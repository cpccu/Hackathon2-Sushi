import { query } from '../config/db.js';
import { NotFoundError } from '../utils/errors.js';
import {
  CreateHelpdeskPostInput,
  UpdateHelpdeskPostInput,
  ListHelpdeskQuery,
} from '../schemas/helpdesk.schema.js';

export interface HelpdeskAttachment {
  id: string;
  title: string;
  file_url: string;
  file_type: string | null;
  file_size: number | null;
}

export interface HelpdeskPost {
  id: string;
  post_type: 'academic' | 'facilities';
  title: string;
  description: string;
  keywords: string[];
  steps: string[];
  provided_by: string;
  created_at: string;
  updated_at: string;
  attachments: HelpdeskAttachment[];
}

// ─── List Posts (Public & Admin) ──────────────────────────────────────────────

export async function getHelpdeskPosts(params: ListHelpdeskQuery) {
  const { search, q, post_type, page = 1, limit = 50 } = params;
  const searchTerm = search || q;
  const offset = (page - 1) * limit;

  const conditions: string[] = [];
  const values: any[] = [];
  let idx = 1;

  if (searchTerm && searchTerm.trim()) {
    const term = `%${searchTerm.trim()}%`;
    conditions.push(`(
      p.title ILIKE $${idx}
      OR p.description ILIKE $${idx}
      OR EXISTS (
        SELECT 1 FROM unnest(p.keywords) AS kw WHERE kw ILIKE $${idx}
      )
    )`);
    values.push(term);
    idx++;
  }

  if (post_type) {
    conditions.push(`p.post_type = $${idx}`);
    values.push(post_type);
    idx++;
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const sql = `
    SELECT
      p.id,
      p.post_type,
      p.title,
      p.description,
      p.keywords,
      p.steps,
      p.created_at,
      p.updated_at,
      u.full_name AS provided_by,
      COALESCE(
        (
          SELECT json_agg(
            json_build_object(
              'id', a.id,
              'title', a.title,
              'file_url', a.file_url,
              'file_type', a.file_type,
              'file_size', a.file_size
            )
          )
          FROM helpdesk_attachments a
          WHERE a.post_id = p.id
        ),
        '[]'::json
      ) AS attachments
    FROM helpdesk_posts p
    JOIN users u ON p.last_updated_by = u.id
    ${whereClause}
    ORDER BY p.updated_at DESC
    LIMIT $${idx++} OFFSET $${idx++};
  `;

  const countSql = `
    SELECT COUNT(*) AS total
    FROM helpdesk_posts p
    ${whereClause};
  `;

  const [itemsRes, countRes] = await Promise.all([
    query<HelpdeskPost>(sql, [...values, limit, offset]),
    query<{ total: string }>(countSql, values),
  ]);

  const total = parseInt(countRes.rows[0]?.total || '0', 10);
  const hasMore = offset + itemsRes.rows.length < total;

  return {
    posts: itemsRes.rows,
    pagination: { page, limit, total, hasMore },
  };
}

// ─── Get Single Post by ID ───────────────────────────────────────────────────

export async function getHelpdeskPostById(postId: string): Promise<HelpdeskPost> {
  const sql = `
    SELECT
      p.id,
      p.post_type,
      p.title,
      p.description,
      p.keywords,
      p.steps,
      p.created_at,
      p.updated_at,
      u.full_name AS provided_by,
      COALESCE(
        (
          SELECT json_agg(
            json_build_object(
              'id', a.id,
              'title', a.title,
              'file_url', a.file_url,
              'file_type', a.file_type,
              'file_size', a.file_size
            )
          )
          FROM helpdesk_attachments a
          WHERE a.post_id = p.id
        ),
        '[]'::json
      ) AS attachments
    FROM helpdesk_posts p
    JOIN users u ON p.last_updated_by = u.id
    WHERE p.id = $1
    LIMIT 1;
  `;

  const res = await query<HelpdeskPost>(sql, [postId]);
  if (res.rows.length === 0) {
    throw new NotFoundError('Helpdesk post not found');
  }

  return res.rows[0];
}

// ─── Create Post (Helpdesk Admin) ─────────────────────────────────────────────

export async function createHelpdeskPost(
  adminId: string,
  input: CreateHelpdeskPostInput
): Promise<HelpdeskPost> {
  const insertSql = `
    INSERT INTO helpdesk_posts (
      post_type, title, description, keywords, steps, created_by, last_updated_by
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING id;
  `;

  const postRes = await query<{ id: string }>(insertSql, [
    input.post_type,
    input.title.trim(),
    input.description.trim(),
    input.keywords,
    JSON.stringify(input.steps || []),
    adminId,
    adminId,
  ]);

  const newPostId = postRes.rows[0].id;

  // Insert attachments if provided
  if (input.attachments && input.attachments.length > 0) {
    for (const att of input.attachments) {
      await query(
        `INSERT INTO helpdesk_attachments (post_id, title, file_url, file_type, file_size)
         VALUES ($1, $2, $3, $4, $5);`,
        [newPostId, att.title.trim(), att.file_url, att.file_type ?? null, att.file_size ?? null]
      );
    }
  }

  return getHelpdeskPostById(newPostId);
}

// ─── Update Post (Any Helpdesk Admin) ─────────────────────────────────────────

export async function updateHelpdeskPost(
  postId: string,
  adminId: string,
  input: UpdateHelpdeskPostInput
): Promise<HelpdeskPost> {
  const check = await query(`SELECT id FROM helpdesk_posts WHERE id = $1 LIMIT 1;`, [postId]);
  if (check.rows.length === 0) {
    throw new NotFoundError('Helpdesk post not found');
  }

  const setClauses: string[] = [];
  const values: any[] = [];
  let idx = 1;

  if (input.post_type !== undefined) {
    setClauses.push(`post_type = $${idx++}`);
    values.push(input.post_type);
  }
  if (input.title !== undefined) {
    setClauses.push(`title = $${idx++}`);
    values.push(input.title.trim());
  }
  if (input.description !== undefined) {
    setClauses.push(`description = $${idx++}`);
    values.push(input.description.trim());
  }
  if (input.keywords !== undefined) {
    setClauses.push(`keywords = $${idx++}`);
    values.push(input.keywords);
  }
  if (input.steps !== undefined) {
    setClauses.push(`steps = $${idx++}`);
    values.push(JSON.stringify(input.steps));
  }

  // System-generated: Update last_updated_by and updated_at
  setClauses.push(`last_updated_by = $${idx++}`);
  values.push(adminId);

  setClauses.push(`updated_at = NOW()`);

  values.push(postId);
  const updateSql = `
    UPDATE helpdesk_posts
    SET ${setClauses.join(', ')}
    WHERE id = $${idx};
  `;

  await query(updateSql, values);

  // If attachments are explicitly provided, replace them
  if (input.attachments !== undefined) {
    await query(`DELETE FROM helpdesk_attachments WHERE post_id = $1;`, [postId]);
    for (const att of input.attachments) {
      await query(
        `INSERT INTO helpdesk_attachments (post_id, title, file_url, file_type, file_size)
         VALUES ($1, $2, $3, $4, $5);`,
        [postId, att.title.trim(), att.file_url, att.file_type ?? null, att.file_size ?? null]
      );
    }
  }

  return getHelpdeskPostById(postId);
}

// ─── Delete Post (Helpdesk Admin) ─────────────────────────────────────────────

export async function deleteHelpdeskPost(postId: string): Promise<{ id: string; deleted: boolean }> {
  const check = await query(`SELECT id FROM helpdesk_posts WHERE id = $1 LIMIT 1;`, [postId]);
  if (check.rows.length === 0) {
    throw new NotFoundError('Helpdesk post not found');
  }

  await query(`DELETE FROM helpdesk_posts WHERE id = $1;`, [postId]);
  return { id: postId, deleted: true };
}
