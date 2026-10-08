import bcrypt from 'bcryptjs';
import { query } from '../config/db.js';
import { env } from '../config/env.js';
import { SignupInput, LoginInput } from '../schemas/auth.schema.js';
import { generateSessionToken, hashSessionToken } from '../utils/session.js';
import { BadRequestError, UnauthorizedError, ConflictError } from '../utils/errors.js';
import { AuthenticatedUser } from '../types/index.js';

export async function registerStudent(input: SignupInput): Promise<{ user: AuthenticatedUser; token: string }> {
  // Check if email already registered
  const existingEmail = await query('SELECT id FROM users WHERE email = $1', [input.email.toLowerCase()]);
  if (existingEmail.rows.length > 0) {
    throw new ConflictError('A user with this email address already exists');
  }

  // Check if Student ID already registered
  const existingStudentId = await query('SELECT id FROM users WHERE student_id = $1', [input.student_id]);
  if (existingStudentId.rows.length > 0) {
    throw new ConflictError('A student with this Student ID already exists');
  }

  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(input.password, saltRounds);

  const insertRes = await query(
    `
    INSERT INTO users (full_name, email, password_hash, role, student_id, department, batch)
    VALUES ($1, $2, $3, 'student', $4, $5, $6)
    RETURNING id, full_name, email, role, student_id, department, batch;
    `,
    [
      input.full_name,
      input.email.toLowerCase(),
      passwordHash,
      input.student_id,
      input.department,
      input.batch,
    ]
  );

  const newUser = insertRes.rows[0];

  // Automatically create a session for immediate login after signup
  const token = await createSession(newUser.id);

  return {
    user: {
      id: newUser.id,
      full_name: newUser.full_name,
      email: newUser.email,
      role: newUser.role,
      student_id: newUser.student_id,
      department: newUser.department,
      batch: newUser.batch,
    },
    token,
  };
}

export async function loginUser(input: LoginInput): Promise<{ user: AuthenticatedUser; token: string }> {
  const userRes = await query(
    `
    SELECT 
      u.id,
      u.full_name,
      u.email,
      u.password_hash,
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
    WHERE u.email = $1
    LIMIT 1;
    `,
    [input.email.toLowerCase()]
  );

  if (userRes.rows.length === 0) {
    throw new UnauthorizedError('Invalid email or password');
  }

  const user = userRes.rows[0];
  const isMatch = await bcrypt.compare(input.password, user.password_hash);
  if (!isMatch) {
    throw new UnauthorizedError('Invalid email or password');
  }

  // Generate session token and store sha256 hash in DB
  const token = await createSession(user.id);

  return {
    user: {
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      role: user.role,
      student_id: user.student_id,
      department: user.department,
      batch: user.batch,
      club_id: user.club_id,
      club_name: user.club_name,
      club_logo_url: user.club_logo_url,
    },
    token,
  };
}

export async function createSession(userId: string): Promise<string> {
  const token = generateSessionToken();
  const tokenHash = hashSessionToken(token);

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + env.SESSION_MAX_AGE_DAYS);

  await query(
    `
    INSERT INTO sessions (user_id, session_token_hash, expires_at)
    VALUES ($1, $2, $3);
    `,
    [userId, tokenHash, expiresAt]
  );

  return token;
}

export async function destroySession(token: string): Promise<void> {
  const tokenHash = hashSessionToken(token);
  await query('DELETE FROM sessions WHERE session_token_hash = $1', [tokenHash]);
}
