import { query } from '../config/db.js';
import { RegisterEventInput } from '../schemas/registration.schema.js';
import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from '../utils/errors.js';
import { AuthenticatedUser } from '../types/index.js';

export async function registerForEvent(
  eventId: string,
  user: AuthenticatedUser,
  input: RegisterEventInput
) {
  if (user.role !== 'student') {
    throw new ForbiddenError('Only students are eligible to register for events');
  }

  // 1. Fetch Event and check existence
  const eventRes = await query(
    `
    SELECT 
      id, name, status,
      registration_start, registration_deadline,
      allowed_departments, allowed_batches
    FROM events
    WHERE id = $1
    LIMIT 1;
    `,
    [eventId]
  );

  if (eventRes.rows.length === 0) {
    throw new NotFoundError('Event not found');
  }

  const event = eventRes.rows[0];

  // 2. Check if registration is open
  const now = new Date();
  const regStart = new Date(event.registration_start);
  const regDeadline = new Date(event.registration_deadline);

  if (now < regStart) {
    throw new BadRequestError('Registration has not opened yet');
  }

  if (now > regDeadline || event.status === 'closed' || event.status === 'cancelled') {
    throw new BadRequestError('Registration for this event has closed');
  }

  // 3. Re-check Department Eligibility
  const allowedDepts: string[] = event.allowed_departments || [];
  if (allowedDepts.length > 0 && user.department && !allowedDepts.includes(user.department)) {
    throw new ForbiddenError(`You are ineligible for this event. Allowed departments: ${allowedDepts.join(', ')}`);
  }

  // 4. Re-check Batch Eligibility
  const allowedBatches: string[] = event.allowed_batches || [];
  if (allowedBatches.length > 0 && user.batch && !allowedBatches.includes(user.batch)) {
    throw new ForbiddenError(`You are ineligible for this event. Allowed batches: ${allowedBatches.join(', ')}`);
  }

  // 5. Check if already registered
  const existingReg = await query(
    `SELECT id FROM registrations WHERE event_id = $1 AND user_id = $2 LIMIT 1;`,
    [eventId, user.id]
  );

  if (existingReg.rows.length > 0) {
    const regId = existingReg.rows[0].id;
    return {
      registrationId: regId,
      qr_url: `/check-in/${regId}`,
      already_registered: true,
      message: 'Already registered for this event',
    };
  }

  // 6. Check Dynamic Organizer Questions
  const questionsRes = await query(
    `SELECT id, question_text, is_required FROM event_questions WHERE event_id = $1;`,
    [eventId]
  );
  const requiredQuestions = questionsRes.rows.filter((q) => q.is_required);

  const answerMap = new Map<string, string>();
  for (const item of input.answers) {
    answerMap.set(item.question_id, item.answer_text.trim());
  }

  for (const rq of requiredQuestions) {
    const val = answerMap.get(rq.id);
    if (!val) {
      throw new BadRequestError(`Answer required for question: "${rq.question_text}"`);
    }
  }

  // 7. Transaction: Insert registration & answers
  await query('BEGIN');
  try {
    const regInsertRes = await query(
      `
      INSERT INTO registrations (event_id, user_id, status)
      VALUES ($1, $2, 'registered')
      RETURNING id, created_at;
      `,
      [eventId, user.id]
    );

    const registrationId = regInsertRes.rows[0].id;

    for (const item of input.answers) {
      if (item.answer_text && item.answer_text.trim().length > 0) {
        await query(
          `
          INSERT INTO registration_answers (registration_id, question_id, answer_text)
          VALUES ($1, $2, $3);
          `,
          [registrationId, item.question_id, item.answer_text.trim()]
        );
      }
    }

    await query('COMMIT');

    const qrUrl = `/check-in/${registrationId}`;

    return {
      registrationId,
      qr_url: qrUrl,
      status: 'registered',
      message: 'Registration successful',
    };
  } catch (err) {
    await query('ROLLBACK');
    throw err;
  }
}

export async function getStudentMyEvents(userId: string) {
  const sql = `
    SELECT 
      r.id as registration_id,
      r.status as registration_status,
      r.checked_in_at,
      r.created_at as registered_at,
      e.id as event_id,
      e.name as event_name,
      e.cover_image_url,
      e.category,
      e.venue,
      e.event_date::text as event_date,
      e.start_time::text as start_time,
      e.duration_minutes,
      e.status as event_status,
      c.id as club_id,
      c.name as club_name,
      c.logo_url as club_logo_url
    FROM registrations r
    JOIN events e ON r.event_id = e.id
    JOIN clubs c ON e.club_id = c.id
    WHERE r.user_id = $1
    ORDER BY e.event_date DESC, r.created_at DESC;
  `;

  const res = await query(sql, [userId]);

  return res.rows.map((row) => ({
    ...row,
    qr_url: `/check-in/${row.registration_id}`,
  }));
}
