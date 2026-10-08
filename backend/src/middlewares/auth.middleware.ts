import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env.js';
import { query } from '../config/db.js';
import { hashSessionToken } from '../utils/session.js';
import { UnauthorizedError } from '../utils/errors.js';
import { AuthenticatedUser } from '../types/index.js';

interface SessionUserRow {
  session_id: string;
  expires_at: Date;
  id: string;
  full_name: string;
  email: string;
  role: 'student' | 'club_admin' | 'helpdesk_admin';
  student_id: string | null;
  department: string | null;
  batch: string | null;
  club_id: string | null;
  club_name: string | null;
  club_logo_url: string | null;
}

export async function findUserBySessionToken(token: string): Promise<AuthenticatedUser | null> {
  const tokenHash = hashSessionToken(token);

  const res = await query<SessionUserRow>(
    `
    SELECT 
      s.id as session_id,
      s.expires_at,
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
    FROM sessions s
    JOIN users u ON s.user_id = u.id
    LEFT JOIN club_admins ca ON ca.user_id = u.id
    LEFT JOIN clubs c ON c.id = ca.club_id
    WHERE s.session_token_hash = $1
      AND s.expires_at > NOW()
    LIMIT 1;
    `,
    [tokenHash]
  );

  if (res.rows.length === 0) {
    return null;
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

export const requireAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = req.cookies[env.COOKIE_NAME];
    if (!token) {
      throw new UnauthorizedError('Authentication required');
    }

    const user = await findUserBySessionToken(token);
    if (!user) {
      res.clearCookie(env.COOKIE_NAME);
      throw new UnauthorizedError('Session expired or invalid');
    }

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};

export const optionalAuth = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = req.cookies[env.COOKIE_NAME];
    if (token) {
      const user = await findUserBySessionToken(token);
      if (user) {
        req.user = user;
      }
    }
    next();
  } catch (_err) {
    next();
  }
};
