import { query } from '../config/db.js';
import { NotFoundError } from '../utils/errors.js';
import {
  CreateComplaintInput,
  AddResponseInput,
  ListComplaintsQuery,
} from '../schemas/complaint.schema.js';

export interface ComplaintAttachment {
  id: string;
  title: string;
  file_url: string;
  file_type: string | null;
  file_size: number | null;
}

export interface ComplaintResponse {
  id: string;
  message: string;
  responded_by: string; // full_name of helpdesk_admin
  created_at: string;
}

export interface Complaint {
  id: string;
  title: string;
  description: string;
  category: string;
  created_at: string;
  response_count: number;
  responded_by_me?: boolean;
  attachments: ComplaintAttachment[];
}

export interface ComplaintDetail extends Complaint {
  responses: ComplaintResponse[];
}

// ─── List Complaints ──────────────────────────────────────────────────────────

export async function getComplaints(
  params: ListComplaintsQuery,
  callerId?: string | null
) {
  const { search, category, has_response, page = 1, limit = 20 } = params;
  const offset = (page - 1) * limit;

  const conditions: string[] = [];
  const values: any[] = [];
  let idx = 1;

  if (search?.trim()) {
    const term = `%${search.trim()}%`;
    conditions.push(`(c.title ILIKE $${idx} OR c.description ILIKE $${idx})`);
    values.push(term);
    idx++;
  }

  if (category) {
    conditions.push(`c.category = $${idx}`);
    values.push(category);
    idx++;
  }

  if (has_response === 'true') {
    conditions.push(`(SELECT COUNT(*) FROM complaint_responses cr WHERE cr.complaint_id = c.id) > 0`);
  } else if (has_response === 'false') {
    conditions.push(`(SELECT COUNT(*) FROM complaint_responses cr WHERE cr.complaint_id = c.id) = 0`);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  // Caller-specific responded_by_me column
  const respondedByMeExpr = callerId
    ? `EXISTS (
        SELECT 1 FROM complaint_responses cr2
        WHERE cr2.complaint_id = c.id AND cr2.responded_by = '${callerId}'
      )`
    : `FALSE`;

  const sql = `
    SELECT
      c.id,
      c.title,
      c.description,
      c.category,
      c.created_at,
      (SELECT COUNT(*)::int FROM complaint_responses cr WHERE cr.complaint_id = c.id) AS response_count,
      ${respondedByMeExpr} AS responded_by_me,
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
          FROM complaint_attachments a
          WHERE a.complaint_id = c.id
        ),
        '[]'::json
      ) AS attachments
    FROM complaints c
    ${whereClause}
    ORDER BY c.created_at DESC
    LIMIT $${idx++} OFFSET $${idx++};
  `;

  const countSql = `
    SELECT COUNT(*) AS total
    FROM complaints c
    ${whereClause};
  `;

  const [itemsRes, countRes] = await Promise.all([
    query<Complaint>(sql, [...values, limit, offset]),
    query<{ total: string }>(countSql, values),
  ]);

  const total = parseInt(countRes.rows[0]?.total || '0', 10);
  const hasMore = offset + itemsRes.rows.length < total;

  return {
    complaints: itemsRes.rows,
    pagination: { page, limit, total, hasMore },
  };
}

// ─── Get Single Complaint ─────────────────────────────────────────────────────

export async function getComplaintById(
  complaintId: string,
  callerId?: string | null
): Promise<ComplaintDetail> {
  const respondedByMeExpr = callerId
    ? `EXISTS (
        SELECT 1 FROM complaint_responses cr2
        WHERE cr2.complaint_id = c.id AND cr2.responded_by = '${callerId}'
      )`
    : `FALSE`;

  const sql = `
    SELECT
      c.id,
      c.title,
      c.description,
      c.category,
      c.created_at,
      (SELECT COUNT(*)::int FROM complaint_responses cr WHERE cr.complaint_id = c.id) AS response_count,
      ${respondedByMeExpr} AS responded_by_me,
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
          FROM complaint_attachments a
          WHERE a.complaint_id = c.id
        ),
        '[]'::json
      ) AS attachments,
      COALESCE(
        (
          SELECT json_agg(
            json_build_object(
              'id', r.id,
              'message', r.message,
              'responded_by', u.full_name,
              'created_at', r.created_at
            )
            ORDER BY r.created_at ASC
          )
          FROM complaint_responses r
          JOIN users u ON u.id = r.responded_by
          WHERE r.complaint_id = c.id
        ),
        '[]'::json
      ) AS responses
    FROM complaints c
    WHERE c.id = $1
    LIMIT 1;
  `;

  const res = await query<ComplaintDetail>(sql, [complaintId]);
  if (res.rows.length === 0) {
    throw new NotFoundError('Complaint not found');
  }

  return res.rows[0];
}

// ─── Create Complaint (anonymous) ────────────────────────────────────────────

export async function createComplaint(
  input: CreateComplaintInput
): Promise<ComplaintDetail> {
  const insertSql = `
    INSERT INTO complaints (title, description, category)
    VALUES ($1, $2, $3)
    RETURNING id;
  `;

  const res = await query<{ id: string }>(insertSql, [
    input.title.trim(),
    input.description.trim(),
    input.category,
  ]);

  const newId = res.rows[0].id;

  if (input.attachments && input.attachments.length > 0) {
    for (const att of input.attachments) {
      await query(
        `INSERT INTO complaint_attachments (complaint_id, title, file_url, file_type, file_size)
         VALUES ($1, $2, $3, $4, $5);`,
        [newId, att.title.trim(), att.file_url, att.file_type ?? null, att.file_size ?? null]
      );
    }
  }

  return getComplaintById(newId, null);
}

// ─── Add Response (helpdesk_admin only) ──────────────────────────────────────

export async function addComplaintResponse(
  complaintId: string,
  adminId: string,
  input: AddResponseInput
): Promise<ComplaintResponse> {
  // Verify complaint exists
  const check = await query(`SELECT id FROM complaints WHERE id = $1 LIMIT 1;`, [complaintId]);
  if (check.rows.length === 0) {
    throw new NotFoundError('Complaint not found');
  }

  const res = await query<{ id: string; created_at: string }>(
    `INSERT INTO complaint_responses (complaint_id, message, responded_by)
     VALUES ($1, $2, $3)
     RETURNING id, created_at;`,
    [complaintId, input.message.trim(), adminId]
  );

  const row = res.rows[0];

  // Fetch the admin's name for the response
  const userRes = await query<{ full_name: string }>(
    `SELECT full_name FROM users WHERE id = $1 LIMIT 1;`,
    [adminId]
  );

  return {
    id: row.id,
    message: input.message.trim(),
    responded_by: userRes.rows[0]?.full_name || 'Admin',
    created_at: row.created_at,
  };
}
