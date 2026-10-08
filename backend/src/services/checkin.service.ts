import { query } from '../config/db.js';
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
} from '../utils/errors.js';
import { AuthenticatedUser } from '../types/index.js';

export interface CheckInDetails {
  registration_id: string;
  registration_status: string;
  checked_in_at: Date | null;
  student: {
    id: string;
    full_name: string;
    student_id: string | null;
    department: string | null;
    batch: string | null;
    email: string;
  };
  event: {
    id: string;
    name: string;
    event_date: string;
    start_time: string;
    duration_minutes: number;
    venue: string;
    club_id: string;
    club_name: string;
  };
  is_admin_authorized?: boolean;
}

export async function getCheckInDetails(
  registrationId: string,
  currentUser?: AuthenticatedUser
): Promise<CheckInDetails> {
  const sql = `
    SELECT 
      r.id as registration_id,
      r.status as registration_status,
      r.checked_in_at,
      u.id as user_id,
      u.full_name,
      u.student_id,
      u.department,
      u.batch,
      u.email,
      e.id as event_id,
      e.name as event_name,
      e.event_date::text as event_date,
      e.start_time::text as start_time,
      e.duration_minutes,
      e.venue,
      e.club_id,
      c.name as club_name
    FROM registrations r
    JOIN users u ON r.user_id = u.id
    JOIN events e ON r.event_id = e.id
    JOIN clubs c ON e.club_id = c.id
    WHERE r.id = $1
    LIMIT 1;
  `;

  const res = await query(sql, [registrationId]);
  if (res.rows.length === 0) {
    throw new NotFoundError('Registration record not found');
  }

  const row = res.rows[0];

  const isAuthorizedAdmin =
    currentUser?.role === 'club_admin' && currentUser.club_id === row.club_id;

  return {
    registration_id: row.registration_id,
    registration_status: row.registration_status,
    checked_in_at: row.checked_in_at,
    student: {
      id: row.user_id,
      full_name: row.full_name,
      student_id: row.student_id,
      department: row.department,
      batch: row.batch,
      email: row.email,
    },
    event: {
      id: row.event_id,
      name: row.event_name,
      event_date: row.event_date,
      start_time: row.start_time,
      duration_minutes: row.duration_minutes,
      venue: row.venue,
      club_id: row.club_id,
      club_name: row.club_name,
    },
    is_admin_authorized: isAuthorizedAdmin,
  };
}

export async function performCheckIn(
  registrationId: string,
  adminUser: AuthenticatedUser
) {
  // 1. Authenticated check
  if (adminUser.role !== 'club_admin' || !adminUser.club_id) {
    throw new ForbiddenError('Only authorized club administrators can perform check-in');
  }

  // 2. Fetch Registration + Event details
  const sql = `
    SELECT 
      r.id as registration_id,
      r.status as registration_status,
      r.checked_in_at,
      e.id as event_id,
      e.club_id,
      e.event_date::text as event_date,
      e.start_time::text as start_time,
      e.duration_minutes,
      e.status as event_status
    FROM registrations r
    JOIN events e ON r.event_id = e.id
    WHERE r.id = $1
    LIMIT 1;
  `;

  const res = await query(sql, [registrationId]);
  if (res.rows.length === 0) {
    throw new NotFoundError('Registration record not found');
  }

  const record = res.rows[0];

  // 3. Event belongs to admin's club verification
  if (record.club_id !== adminUser.club_id) {
    throw new ForbiddenError('This event does not belong to your club');
  }

  // 4. Not already checked in verification
  if (record.registration_status === 'checked_in') {
    throw new ConflictError('Student has already been checked in');
  }

  // 5. Event is ongoing verification
  // Construct event start date and duration window
  // e.g. Start time: 2 hours before start time until duration + 2 hours after end time
  const [hours, minutes] = record.start_time.split(':').map(Number);
  const eventStart = new Date(`${record.event_date}T00:00:00`);
  eventStart.setHours(hours, minutes, 0, 0);

  const windowStart = new Date(eventStart.getTime() - 2 * 60 * 60 * 1000); // 2 hours prior to start
  const windowEnd = new Date(
    eventStart.getTime() + (record.duration_minutes + 2 * 60) * 60 * 1000 // duration + 2 hours grace
  );

  const now = new Date();

  // If the event is in the past or far future, check-in is not allowed
  if (now < windowStart) {
    throw new BadRequestError('Event check-in is not open yet. Check-in opens prior to the scheduled start time.');
  }

  if (now > windowEnd) {
    throw new BadRequestError('Event has concluded. Check-in is no longer available.');
  }

  // 6. Update registration to checked_in
  const updateRes = await query(
    `
    UPDATE registrations
    SET status = 'checked_in', checked_in_at = NOW()
    WHERE id = $1
    RETURNING id, status, checked_in_at;
    `,
    [registrationId]
  );

  return {
    success: true,
    message: 'Student checked in successfully',
    registration: updateRes.rows[0],
  };
}
