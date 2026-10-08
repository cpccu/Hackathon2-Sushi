import { query } from '../config/db.js';
import { NotFoundError, ForbiddenError } from '../utils/errors.js';
import {
  CreateLostFoundInput,
  UpdateLostFoundInput,
  ListLostFoundQuery,
} from '../schemas/lostFound.schema.js';

// ─── Shared Interfaces ────────────────────────────────────────────────────────

export interface LostFoundPost {
  id: string;
  post_type: 'lost' | 'found';
  item_name: string;
  description: string;
  keywords: string[];
  location: string;
  incident_date: string;
  contact_phone: string | null;
  contact_email: string | null;
  images: string[];
  status: 'active' | 'resolved';
  created_at: string;
  updated_at: string;
  poster_id: string;
  poster_name: string;
  poster_batch: string | null;
  poster_department: string | null;
  poster_email: string;
}

// ─── List / Browse ────────────────────────────────────────────────────────────

export async function getLostFoundPosts(params: ListLostFoundQuery) {
  const { search, q, post_type, status, from, to, page = 1, limit = 20 } = params;
  const searchTerm = search || q;
  const offset = (page - 1) * limit;

  const conditions: string[] = [];
  const values: any[] = [];
  let idx = 1;

  // Multi-field search: item_name, description, location, keywords, incident_date
  if (searchTerm && searchTerm.trim()) {
    const term = `%${searchTerm.trim()}%`;
    conditions.push(`(
      p.item_name ILIKE $${idx}
      OR p.description ILIKE $${idx}
      OR p.location ILIKE $${idx}
      OR EXISTS (
        SELECT 1 FROM unnest(p.keywords) AS kw WHERE kw ILIKE $${idx}
      )
      OR TO_CHAR(p.incident_date, 'YYYY-MM-DD') ILIKE $${idx}
    )`);
    values.push(term);
    idx++;
  }

  if (post_type) {
    conditions.push(`p.post_type = $${idx}`);
    values.push(post_type);
    idx++;
  }

  if (status) {
    conditions.push(`p.status = $${idx}`);
    values.push(status);
    idx++;
  }

  if (from) {
    conditions.push(`p.incident_date >= $${idx}`);
    values.push(from);
    idx++;
  }

  if (to) {
    conditions.push(`p.incident_date <= $${idx}`);
    values.push(to);
    idx++;
  }

  const whereClause =
    conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const sql = `
    SELECT
      p.id,
      p.post_type,
      p.item_name,
      p.description,
      p.keywords,
      p.location,
      TO_CHAR(p.incident_date, 'YYYY-MM-DD') AS incident_date,
      p.contact_phone,
      p.contact_email,
      p.images,
      p.status,
      p.created_at,
      p.updated_at,
      u.id AS poster_id,
      u.full_name AS poster_name,
      u.batch AS poster_batch,
      u.department AS poster_department,
      COALESCE(p.contact_email, u.email) AS poster_email
    FROM lost_found_posts p
    JOIN users u ON p.user_id = u.id
    ${whereClause}
    ORDER BY p.created_at DESC
    LIMIT $${idx++} OFFSET $${idx++};
  `;

  const countSql = `
    SELECT COUNT(*) AS total
    FROM lost_found_posts p
    ${whereClause};
  `;

  const [itemsRes, countRes] = await Promise.all([
    query<LostFoundPost>(sql, [...values, limit, offset]),
    query<{ total: string }>(countSql, values),
  ]);

  const total = parseInt(countRes.rows[0]?.total || '0', 10);
  const hasMore = offset + itemsRes.rows.length < total;

  return {
    posts: itemsRes.rows,
    pagination: { page, limit, total, hasMore },
  };
}

// ─── Get Single Post ──────────────────────────────────────────────────────────

export async function getLostFoundPostById(postId: string): Promise<LostFoundPost> {
  const sql = `
    SELECT
      p.id,
      p.post_type,
      p.item_name,
      p.description,
      p.keywords,
      p.location,
      TO_CHAR(p.incident_date, 'YYYY-MM-DD') AS incident_date,
      p.contact_phone,
      p.contact_email,
      p.images,
      p.status,
      p.created_at,
      p.updated_at,
      u.id AS poster_id,
      u.full_name AS poster_name,
      u.batch AS poster_batch,
      u.department AS poster_department,
      COALESCE(p.contact_email, u.email) AS poster_email
    FROM lost_found_posts p
    JOIN users u ON p.user_id = u.id
    WHERE p.id = $1
    LIMIT 1;
  `;

  const res = await query<LostFoundPost>(sql, [postId]);
  if (res.rows.length === 0) {
    throw new NotFoundError('Lost & Found post not found');
  }

  return res.rows[0];
}

// ─── Get My Posts ─────────────────────────────────────────────────────────────

export async function getMyLostFoundPosts(userId: string): Promise<LostFoundPost[]> {
  const sql = `
    SELECT
      p.id,
      p.post_type,
      p.item_name,
      p.description,
      p.keywords,
      p.location,
      TO_CHAR(p.incident_date, 'YYYY-MM-DD') AS incident_date,
      p.contact_phone,
      p.contact_email,
      p.images,
      p.status,
      p.created_at,
      p.updated_at,
      u.id AS poster_id,
      u.full_name AS poster_name,
      u.batch AS poster_batch,
      u.department AS poster_department,
      COALESCE(p.contact_email, u.email) AS poster_email
    FROM lost_found_posts p
    JOIN users u ON p.user_id = u.id
    WHERE p.user_id = $1
    ORDER BY p.created_at DESC;
  `;

  const res = await query<LostFoundPost>(sql, [userId]);
  return res.rows;
}

// ─── Create Post ──────────────────────────────────────────────────────────────

export async function createLostFoundPost(
  userId: string,
  input: CreateLostFoundInput
): Promise<{ id: string; item_name: string; created_at: string }> {
  const sql = `
    INSERT INTO lost_found_posts (
      user_id, post_type, item_name, description, keywords,
      location, incident_date, contact_phone, contact_email, images, status
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'active')
    RETURNING id, item_name, created_at;
  `;

  const res = await query(sql, [
    userId,
    input.post_type,
    input.item_name.trim(),
    input.description.trim(),
    input.keywords,
    input.location.trim(),
    input.incident_date,
    input.contact_phone ?? null,
    input.contact_email ?? null,
    input.images,
  ]);

  return res.rows[0];
}

// ─── Update Post ──────────────────────────────────────────────────────────────

export async function updateLostFoundPost(
  postId: string,
  userId: string,
  input: UpdateLostFoundInput
): Promise<LostFoundPost> {
  // Ownership check
  const check = await query(
    `SELECT id, user_id, status FROM lost_found_posts WHERE id = $1 LIMIT 1;`,
    [postId]
  );

  if (check.rows.length === 0) {
    throw new NotFoundError('Lost & Found post not found');
  }
  if (check.rows[0].user_id !== userId) {
    throw new ForbiddenError('You can only edit your own posts');
  }

  // Build dynamic SET clause only for provided fields
  const setClauses: string[] = [];
  const values: any[] = [];
  let idx = 1;

  const fieldMap: Record<string, any> = {
    item_name: input.item_name?.trim(),
    description: input.description?.trim(),
    keywords: input.keywords,
    location: input.location?.trim(),
    incident_date: input.incident_date,
    contact_phone: input.contact_phone,
    contact_email: input.contact_email,
    images: input.images,
  };

  for (const [col, val] of Object.entries(fieldMap)) {
    if (val !== undefined) {
      setClauses.push(`${col} = $${idx++}`);
      values.push(val);
    }
  }

  if (setClauses.length === 0) {
    // Nothing to update — just return the post as-is
    return getLostFoundPostById(postId);
  }

  // Always bump updated_at
  setClauses.push(`updated_at = NOW()`);
  values.push(postId);

  const sql = `
    UPDATE lost_found_posts
    SET ${setClauses.join(', ')}
    WHERE id = $${idx}
    RETURNING id;
  `;

  await query(sql, values);
  return getLostFoundPostById(postId);
}

// ─── Update Status (Resolve) ──────────────────────────────────────────────────

export async function resolveLostFoundPost(
  postId: string,
  userId: string
): Promise<{ id: string; status: string }> {
  const check = await query(
    `SELECT id, user_id, status FROM lost_found_posts WHERE id = $1 LIMIT 1;`,
    [postId]
  );

  if (check.rows.length === 0) {
    throw new NotFoundError('Lost & Found post not found');
  }
  if (check.rows[0].user_id !== userId) {
    throw new ForbiddenError('Only the post creator can resolve this post');
  }

  const res = await query(
    `UPDATE lost_found_posts
     SET status = 'resolved', updated_at = NOW()
     WHERE id = $1
     RETURNING id, status;`,
    [postId]
  );

  return res.rows[0];
}
