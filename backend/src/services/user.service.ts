import { query } from '../config/db.js';
import { UpdateProfileInput } from '../schemas/user.schema.js';
import { NotFoundError, ConflictError } from '../utils/errors.js';
import { AuthenticatedUser } from '../types/index.js';

export async function getUserProfile(userId: string): Promise<AuthenticatedUser> {
  const res = await query(
    `
    SELECT 
      u.id,
      u.full_name,
      u.email,
      u.role,
      u.student_id,
      u.department,
      u.batch,
      ca.club_id,
      c.name as club_name,
      c.logo_url as club_logo_url
    FROM users u
    LEFT JOIN club_admins ca ON ca.user_id = u.id
    LEFT JOIN clubs c ON c.id = ca.club_id
    WHERE u.id = $1
    LIMIT 1;
    `,
    [userId]
  );

  if (res.rows.length === 0) {
    throw new NotFoundError('User profile not found');
  }

  const row = res.rows[0];
  return {
    id: row.id,
    full_name: row.full_name,
    email: row.email,
    role: row.role,
    student_id: row.student_id,
    department: row.department,
    batch: row.batch,
    club_id: row.club_id,
    club_name: row.club_name,
    club_logo_url: row.club_logo_url,
  };
}

export async function updateUserProfile(
  userId: string,
  input: UpdateProfileInput
): Promise<AuthenticatedUser> {
  // If email is being changed, ensure it's not taken by another user
  if (input.email) {
    const existing = await query(
      'SELECT id FROM users WHERE email = $1 AND id != $2',
      [input.email.toLowerCase(), userId]
    );
    if (existing.rows.length > 0) {
      throw new ConflictError('This email is already in use by another account');
    }
  }

  // Student ID is explicitly not updated (immutable requirement)
  const fields: string[] = [];
  const values: any[] = [];
  let paramIdx = 1;

  if (input.full_name !== undefined) {
    fields.push(`full_name = $${paramIdx++}`);
    values.push(input.full_name);
  }
  if (input.email !== undefined) {
    fields.push(`email = $${paramIdx++}`);
    values.push(input.email.toLowerCase());
  }
  if (input.department !== undefined) {
    fields.push(`department = $${paramIdx++}`);
    values.push(input.department);
  }
  if (input.batch !== undefined) {
    fields.push(`batch = $${paramIdx++}`);
    values.push(input.batch);
  }

  if (fields.length === 0) {
    return getUserProfile(userId);
  }

  fields.push(`updated_at = NOW()`);
  values.push(userId);

  const updateSql = `
    UPDATE users
    SET ${fields.join(', ')}
    WHERE id = $${paramIdx}
    RETURNING id;
  `;

  await query(updateSql, values);
  return getUserProfile(userId);
}
