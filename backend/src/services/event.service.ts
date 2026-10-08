import { query } from '../config/db.js';
import {
  ListEventsQuery,
  CreateEventInput,
  UpdateEventInput,
} from '../schemas/event.schema.js';
import { NotFoundError, ForbiddenError, BadRequestError } from '../utils/errors.js';
import { AuthenticatedUser } from '../types/index.js';

export interface EventListItem {
  id: string;
  name: string;
  cover_image_url: string | null;
  category: string;
  venue: string;
  event_date: string;
  start_time: string;
  duration_minutes: number;
  allowed_departments: string[];
  allowed_batches: string[];
  status: string;
  club_id: string;
  club_name: string;
  club_logo_url: string | null;
  registration_start: Date;
  registration_deadline: Date;
  created_at: Date;
}

export interface SingleEventDetail extends EventListItem {
  description: string;
  contact_email: string;
  questions: Array<{
    id: string;
    question_text: string;
    is_required: boolean;
    order_index: number;
  }>;
  registration_state?: {
    state: 'login' | 'eligible_open' | 'ineligible' | 'closed' | 'registered';
    reason?: string;
    registration_id?: string;
    qr_url?: string;
  };
}

export function computeEventLifecycleStatus(
  eventDateStr: string,
  startTimeStr: string,
  durationMinutes: number,
  dbStatus: string
): 'upcoming' | 'ongoing' | 'finished' | 'cancelled' {
  if (dbStatus === 'cancelled') return 'cancelled';
  try {
    const timeClean = startTimeStr.split(':').slice(0, 2).join(':');
    const start = new Date(`${eventDateStr}T${timeClean}:00`);
    const end = new Date(start.getTime() + durationMinutes * 60 * 1000);
    const now = new Date();

    if (now < start) return 'upcoming';
    if (now >= start && now <= end) return 'ongoing';
    return 'finished';
  } catch {
    return (dbStatus as any) || 'upcoming';
  }
}

export async function getPublicEvents(params: ListEventsQuery) {
  const { search, clubId, department, category, date, page = 1, limit = 20 } = params;
  const offset = (page - 1) * limit;

  const conditions: string[] = ["e.status NOT IN ('draft', 'cancelled')"];
  const values: any[] = [];
  let paramIdx = 1;

  if (search) {
    conditions.push(`e.name ILIKE $${paramIdx++}`);
    values.push(`%${search}%`);
  }

  if (clubId) {
    conditions.push(`e.club_id = $${paramIdx++}`);
    values.push(clubId);
  }

  if (department) {
    // Check if the department is explicitly listed or if allowed_departments is empty (meaning all departments)
    conditions.push(`($${paramIdx++} = ANY(e.allowed_departments) OR cardinality(e.allowed_departments) = 0)`);
    values.push(department);
  }

  if (category) {
    conditions.push(`e.category = $${paramIdx++}`);
    values.push(category);
  }

  if (date) {
    conditions.push(`e.event_date = $${paramIdx++}`);
    values.push(date);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  // Order: Newest -> oldest (by event_date DESC, created_at DESC)
  const sql = `
    SELECT 
      e.id,
      e.name,
      e.cover_image_url,
      e.category,
      e.venue,
      e.event_date::text as event_date,
      e.start_time::text as start_time,
      e.duration_minutes,
      e.allowed_departments,
      e.allowed_batches,
      e.status,
      e.registration_start,
      e.registration_deadline,
      e.created_at,
      c.id as club_id,
      c.name as club_name,
      c.logo_url as club_logo_url
    FROM events e
    JOIN clubs c ON e.club_id = c.id
    ${whereClause}
    ORDER BY e.event_date DESC, e.created_at DESC
    LIMIT $${paramIdx++} OFFSET $${paramIdx++};
  `;

  const countSql = `
    SELECT COUNT(*) as total
    FROM events e
    JOIN clubs c ON e.club_id = c.id
    ${whereClause};
  `;

  const [itemsRes, countRes] = await Promise.all([
    query<EventListItem>(sql, [...values, limit, offset]),
    query<{ total: string }>(countSql, values),
  ]);

  const total = parseInt(countRes.rows[0].total, 10);
  const hasMore = offset + itemsRes.rows.length < total;

  const eventsWithStatus = itemsRes.rows.map((e) => ({
    ...e,
    status: computeEventLifecycleStatus(e.event_date, e.start_time, e.duration_minutes, e.status),
  }));

  return {
    events: eventsWithStatus,
    pagination: {
      page,
      limit,
      total,
      hasMore,
    },
  };
}

export async function getEventById(
  eventId: string,
  user?: AuthenticatedUser
): Promise<SingleEventDetail> {
  const eventRes = await query(
    `
    SELECT 
      e.id,
      e.name,
      e.description,
      e.cover_image_url,
      e.category,
      e.venue,
      e.event_date::text as event_date,
      e.start_time::text as start_time,
      e.duration_minutes,
      e.allowed_departments,
      e.allowed_batches,
      e.status,
      e.contact_email,
      e.registration_start,
      e.registration_deadline,
      e.created_at,
      c.id as club_id,
      c.name as club_name,
      c.logo_url as club_logo_url
    FROM events e
    JOIN clubs c ON e.club_id = c.id
    WHERE e.id = $1
    LIMIT 1;
    `,
    [eventId]
  );

  if (eventRes.rows.length === 0) {
    throw new NotFoundError('Event not found');
  }

  const event = eventRes.rows[0];

  // Fetch dynamic questions
  const questionsRes = await query(
    `
    SELECT id, question_text, is_required, order_index
    FROM event_questions
    WHERE event_id = $1
    ORDER BY order_index ASC, created_at ASC;
    `,
    [eventId]
  );

  const lifecycleStatus = computeEventLifecycleStatus(
    event.event_date,
    event.start_time,
    event.duration_minutes,
    event.status
  );

  const detail: SingleEventDetail = {
    ...event,
    status: lifecycleStatus,
    questions: questionsRes.rows,
  };

  // Determine Register State per requirements:
  // Not logged in → Login
  // Eligible + open → Register
  // Ineligible → hide Register
  // Closed → Registration Closed
  // Registered → Show QR
  if (!user) {
    detail.registration_state = { state: 'login' };
    return detail;
  }

  if (user.role === 'club_admin') {
    // Club admins don't register for student events
    detail.registration_state = {
      state: 'ineligible',
      reason: 'Club administrators cannot register as student participants',
    };
    return detail;
  }

  // Check if student is already registered
  const regRes = await query(
    `
    SELECT id, status
    FROM registrations
    WHERE event_id = $1 AND user_id = $2
    LIMIT 1;
    `,
    [eventId, user.id]
  );

  if (regRes.rows.length > 0) {
    const reg = regRes.rows[0];
    detail.registration_state = {
      state: 'registered',
      registration_id: reg.id,
      qr_url: `/check-in/${reg.id}`,
    };
    return detail;
  }

  // Check registration window
  const now = new Date();
  const regStart = new Date(event.registration_start);
  const regDeadline = new Date(event.registration_deadline);

  if (now < regStart || now > regDeadline || event.status === 'closed' || event.status === 'cancelled') {
    detail.registration_state = {
      state: 'closed',
      reason: now < regStart ? 'Registration has not started yet' : 'Registration closed',
    };
    return detail;
  }

  // Check Department Eligibility
  const allowedDepts: string[] = event.allowed_departments || [];
  if (allowedDepts.length > 0 && user.department && !allowedDepts.includes(user.department)) {
    detail.registration_state = {
      state: 'ineligible',
      reason: `Event restricted to: ${allowedDepts.join(', ')}`,
    };
    return detail;
  }

  // Check Batch Eligibility
  const allowedBatches: string[] = event.allowed_batches || [];
  if (allowedBatches.length > 0 && user.batch && !allowedBatches.includes(user.batch)) {
    detail.registration_state = {
      state: 'ineligible',
      reason: `Event restricted to batches: ${allowedBatches.join(', ')}`,
    };
    return detail;
  }

  // Eligible and open
  detail.registration_state = { state: 'eligible_open' };
  return detail;
}

// Club Admin Dashboard
export async function getClubDashboard(clubId: string) {
  // Get club info
  const clubRes = await query(
    `SELECT id, name, logo_url FROM clubs WHERE id = $1 LIMIT 1;`,
    [clubId]
  );

  if (clubRes.rows.length === 0) {
    throw new NotFoundError('Club not found');
  }

  const club = clubRes.rows[0];

  // Get club's events with registration counts
  const eventsRes = await query(
    `
    SELECT 
      e.id,
      e.name,
      e.event_date::text as event_date,
      e.start_time::text as start_time,
      e.duration_minutes,
      e.status,
      COUNT(r.id) as registrations_count,
      COUNT(CASE WHEN r.status = 'checked_in' THEN 1 END) as checked_in_count
    FROM events e
    LEFT JOIN registrations r ON r.event_id = e.id
    WHERE e.club_id = $1
    GROUP BY e.id
    ORDER BY e.event_date DESC, e.created_at DESC;
    `,
    [clubId]
  );

  return {
    club,
    events: eventsRes.rows.map((row) => ({
      ...row,
      status: computeEventLifecycleStatus(
        row.event_date,
        row.start_time,
        row.duration_minutes,
        row.status
      ),
      registrations_count: parseInt(row.registrations_count, 10),
      checked_in_count: parseInt(row.checked_in_count, 10),
    })),
  };
}

export async function createClubEvent(
  clubId: string,
  input: CreateEventInput,
  coverImageUrl: string | null
) {
  const client = await query(`BEGIN`);
  try {
    const insertEventRes = await query(
      `
      INSERT INTO events (
        club_id, name, description, cover_image_url, category, venue,
        event_date, start_time, duration_minutes,
        registration_start, registration_deadline,
        allowed_departments, allowed_batches, contact_email, status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, 'upcoming')
      RETURNING id, name, created_at;
      `,
      [
        clubId,
        input.name,
        input.description,
        coverImageUrl,
        input.category,
        input.venue,
        input.event_date,
        input.start_time,
        input.duration_minutes,
        input.registration_start,
        input.registration_deadline,
        input.allowed_departments,
        input.allowed_batches,
        input.contact_email,
      ]
    );

    const eventId = insertEventRes.rows[0].id;

    // Insert dynamic questions if provided
    if (input.questions && input.questions.length > 0) {
      for (let i = 0; i < input.questions.length; i++) {
        const q = input.questions[i];
        await query(
          `
          INSERT INTO event_questions (event_id, question_text, is_required, order_index)
          VALUES ($1, $2, $3, $4);
          `,
          [eventId, q.question_text, q.is_required, i + 1]
        );
      }
    }

    await query(`COMMIT`);
    return insertEventRes.rows[0];
  } catch (err) {
    await query(`ROLLBACK`);
    throw err;
  }
}

export async function updateClubEvent(
  clubId: string,
  eventId: string,
  input: UpdateEventInput
) {
  // Verify event belongs to this club
  const checkRes = await query(
    `SELECT id, club_id FROM events WHERE id = $1 LIMIT 1;`,
    [eventId]
  );

  if (checkRes.rows.length === 0) {
    throw new NotFoundError('Event not found');
  }

  if (checkRes.rows[0].club_id !== clubId) {
    throw new ForbiddenError('You are not authorized to manage events for this club');
  }

  // Requirements: Only these fields are editable: Name, Description, Date, Start Time, Duration
  const fields: string[] = [];
  const values: any[] = [];
  let paramIdx = 1;

  if (input.name !== undefined) {
    fields.push(`name = $${paramIdx++}`);
    values.push(input.name);
  }
  if (input.description !== undefined) {
    fields.push(`description = $${paramIdx++}`);
    values.push(input.description);
  }
  if (input.event_date !== undefined) {
    fields.push(`event_date = $${paramIdx++}`);
    values.push(input.event_date);
  }
  if (input.start_time !== undefined) {
    fields.push(`start_time = $${paramIdx++}`);
    values.push(input.start_time);
  }
  if (input.duration_minutes !== undefined) {
    fields.push(`duration_minutes = $${paramIdx++}`);
    values.push(input.duration_minutes);
  }

  if (fields.length === 0) {
    throw new BadRequestError('No editable fields provided');
  }

  fields.push(`updated_at = NOW()`);
  values.push(eventId);

  const updateSql = `
    UPDATE events
    SET ${fields.join(', ')}
    WHERE id = $${paramIdx}
    RETURNING id, name, description, event_date::text as event_date, start_time::text as start_time, duration_minutes;
  `;

  const updatedRes = await query(updateSql, values);
  return updatedRes.rows[0];
}

export async function getClubEventParticipants(
  clubId: string,
  eventId: string,
  search?: string
) {
  // Verify event belongs to this club
  const eventRes = await query(
    `
    SELECT e.id, e.name, e.club_id, c.name as club_name
    FROM events e
    JOIN clubs c ON e.club_id = c.id
    WHERE e.id = $1
    LIMIT 1;
    `,
    [eventId]
  );

  if (eventRes.rows.length === 0) {
    throw new NotFoundError('Event not found');
  }

  if (eventRes.rows[0].club_id !== clubId) {
    throw new ForbiddenError('You are not authorized to view participants for this club event');
  }

  const conditions = ['r.event_id = $1'];
  const values: any[] = [eventId];
  let paramIdx = 2;

  if (search) {
    conditions.push(`(u.full_name ILIKE $${paramIdx} OR u.student_id ILIKE $${paramIdx})`);
    values.push(`%${search}%`);
    paramIdx++;
  }

  const participantsSql = `
    SELECT 
      r.id as registration_id,
      r.status as registration_status,
      r.checked_in_at,
      r.created_at as registered_at,
      u.id as user_id,
      u.full_name,
      u.student_id,
      u.department,
      u.batch,
      u.email
    FROM registrations r
    JOIN users u ON r.user_id = u.id
    WHERE ${conditions.join(' AND ')}
    ORDER BY r.created_at ASC;
  `;

  // Counts
  const countsSql = `
    SELECT 
      COUNT(*) as registered_count,
      COUNT(CASE WHEN status = 'checked_in' THEN 1 END) as checked_in_count
    FROM registrations
    WHERE event_id = $1;
  `;

  const [participantsRes, countsRes] = await Promise.all([
    query(participantsSql, values),
    query<{ registered_count: string; checked_in_count: string }>(countsSql, [eventId]),
  ]);

  // Fetch dynamic question answers for these participants
  const registrationIds = participantsRes.rows.map((p) => p.registration_id);
  let answersMap: Record<string, Array<{ question: string; answer: string }>> = {};

  if (registrationIds.length > 0) {
    const answersRes = await query(
      `
      SELECT 
        ra.registration_id,
        eq.question_text as question,
        ra.answer_text as answer
      FROM registration_answers ra
      JOIN event_questions eq ON ra.question_id = eq.id
      WHERE ra.registration_id = ANY($1)
      ORDER BY eq.order_index ASC;
      `,
      [registrationIds]
    );

    for (const ans of answersRes.rows) {
      if (!answersMap[ans.registration_id]) {
        answersMap[ans.registration_id] = [];
      }
      answersMap[ans.registration_id].push({
        question: ans.question,
        answer: ans.answer,
      });
    }
  }

  const participantsWithAnswers = participantsRes.rows.map((p) => ({
    ...p,
    answers: answersMap[p.registration_id] || [],
  }));

  const counts = countsRes.rows[0];

  // console.log({
  //   event: eventRes.rows[0],
  //   registered_count: parseInt(counts.registered_count || '0', 10),
  //   checked_in_count: parseInt(counts.checked_in_count || '0', 10),
  //   participants: participantsWithAnswers,
  // })

  return {
    event: eventRes.rows[0],
    registered_count: parseInt(counts.registered_count || '0', 10),
    checked_in_count: parseInt(counts.checked_in_count || '0', 10),
    participants: participantsWithAnswers,
  };
}
