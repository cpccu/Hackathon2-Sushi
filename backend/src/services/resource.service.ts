import { query, pool } from '../config/db.js';
import { NotFoundError, ForbiddenError, BadRequestError } from '../utils/errors.js';
import { CreateResourceInput, ListResourcesQuery } from '../schemas/resource.schema.js';

export interface ResourceItem {
  id: string;
  title: string;
  course_name: string;
  course_code: string | null;
  description: string;
  year: number;
  semester: string;
  department: string;
  category: string;
  optional_note: string | null;
  created_at: string;
  uploader_id: string;
  uploader_name: string;
  uploader_batch: string | null;
  uploader_department: string | null;
  document_count: number;
  upvotes: number;
  downvotes: number;
  vote_score: number;
  user_vote: number | null;
}

export interface ResourceDocumentItem {
  id: string;
  title: string;
  file_url: string;
  file_type: string | null;
  file_size: number | null;
  created_at: string;
}

export interface SingleResourceDetail extends ResourceItem {
  documents: ResourceDocumentItem[];
}

export async function getResources(
  params: ListResourcesQuery,
  currentUserId?: string
) {
  const { search, year, semester, department, category, page = 1, limit = 20 } = params;
  const offset = (page - 1) * limit;

  const conditions: string[] = [];
  const values: any[] = [];
  let paramIdx = 1;

  // Search by title OR course_name OR course_code
  if (search && search.trim()) {
    conditions.push(
      `(r.title ILIKE $${paramIdx} OR r.course_name ILIKE $${paramIdx} OR r.course_code ILIKE $${paramIdx})`
    );
    values.push(`%${search.trim()}%`);
    paramIdx++;
  }

  // Filter by year
  if (year) {
    conditions.push(`r.year = $${paramIdx}`);
    values.push(year);
    paramIdx++;
  }

  // Filter by semester
  if (semester && semester.trim()) {
    conditions.push(`r.semester = $${paramIdx}`);
    values.push(semester.trim());
    paramIdx++;
  }

  // Filter by department
  if (department && department.trim()) {
    conditions.push(`r.department = $${paramIdx}`);
    values.push(department.trim());
    paramIdx++;
  }

  // Filter by category
  if (category && category.trim()) {
    conditions.push(`r.category = $${paramIdx}`);
    values.push(category.trim());
    paramIdx++;
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  // Current user's vote join parameter
  let userVoteJoin = '';
  if (currentUserId) {
    userVoteJoin = `LEFT JOIN resource_votes uv ON uv.resource_id = r.id AND uv.user_id = $${paramIdx}`;
    values.push(currentUserId);
    paramIdx++;
  } else {
    userVoteJoin = `LEFT JOIN (SELECT NULL::uuid as resource_id, NULL::smallint as vote_type) uv ON false`;
  }

  const sql = `
    SELECT 
      r.id,
      r.title,
      r.course_name,
      r.course_code,
      r.description,
      r.year,
      r.semester,
      r.department,
      r.category,
      r.optional_note,
      r.created_at,
      u.id as uploader_id,
      u.full_name as uploader_name,
      u.batch as uploader_batch,
      u.department as uploader_department,
      COALESCE(d.document_count, 0)::int as document_count,
      COALESCE(v.upvotes, 0)::int as upvotes,
      COALESCE(v.downvotes, 0)::int as downvotes,
      COALESCE(v.vote_score, 0)::int as vote_score,
      uv.vote_type as user_vote
    FROM resources r
    JOIN users u ON r.user_id = u.id
    LEFT JOIN (
      SELECT 
        resource_id,
        COUNT(CASE WHEN vote_type = 1 THEN 1 END)::int as upvotes,
        COUNT(CASE WHEN vote_type = -1 THEN 1 END)::int as downvotes,
        (COUNT(CASE WHEN vote_type = 1 THEN 1 END) - COUNT(CASE WHEN vote_type = -1 THEN 1 END))::int as vote_score
      FROM resource_votes
      GROUP BY resource_id
    ) v ON v.resource_id = r.id
    LEFT JOIN (
      SELECT resource_id, COUNT(*)::int as document_count
      FROM resource_documents
      GROUP BY resource_id
    ) d ON d.resource_id = r.id
    ${userVoteJoin}
    ${whereClause}
    ORDER BY COALESCE(v.vote_score, 0) DESC, r.created_at DESC
    LIMIT $${paramIdx++} OFFSET $${paramIdx++};
  `;

  // Count query for pagination
  const countSql = `
    SELECT COUNT(*) as total
    FROM resources r
    ${whereClause};
  `;

  // Notice countSql only uses the filter values (up to before userVote and pagination params)
  const filterValuesCount = conditions.length > 0 ? (currentUserId ? values.slice(0, values.length - 1) : values) : [];

  const [itemsRes, countRes] = await Promise.all([
    query<ResourceItem>(sql, [...values, limit, offset]),
    query<{ total: string }>(countSql, filterValuesCount),
  ]);

  const total = parseInt(countRes.rows[0]?.total || '0', 10);
  const hasMore = offset + itemsRes.rows.length < total;

  return {
    resources: itemsRes.rows,
    pagination: {
      page,
      limit,
      total,
      hasMore,
    },
  };
}

export async function getResourceById(
  resourceId: string,
  currentUserId?: string
): Promise<SingleResourceDetail> {
  const values: any[] = [resourceId];
  let userVoteJoin = '';

  if (currentUserId) {
    userVoteJoin = `LEFT JOIN resource_votes uv ON uv.resource_id = r.id AND uv.user_id = $2`;
    values.push(currentUserId);
  } else {
    userVoteJoin = `LEFT JOIN (SELECT NULL::uuid as resource_id, NULL::smallint as vote_type) uv ON false`;
  }

  const sql = `
    SELECT 
      r.id,
      r.title,
      r.course_name,
      r.course_code,
      r.description,
      r.year,
      r.semester,
      r.department,
      r.category,
      r.optional_note,
      r.created_at,
      u.id as uploader_id,
      u.full_name as uploader_name,
      u.batch as uploader_batch,
      u.department as uploader_department,
      COALESCE(d.document_count, 0)::int as document_count,
      COALESCE(v.upvotes, 0)::int as upvotes,
      COALESCE(v.downvotes, 0)::int as downvotes,
      COALESCE(v.vote_score, 0)::int as vote_score,
      uv.vote_type as user_vote
    FROM resources r
    JOIN users u ON r.user_id = u.id
    LEFT JOIN (
      SELECT 
        resource_id,
        COUNT(CASE WHEN vote_type = 1 THEN 1 END)::int as upvotes,
        COUNT(CASE WHEN vote_type = -1 THEN 1 END)::int as downvotes,
        (COUNT(CASE WHEN vote_type = 1 THEN 1 END) - COUNT(CASE WHEN vote_type = -1 THEN 1 END))::int as vote_score
      FROM resource_votes
      GROUP BY resource_id
    ) v ON v.resource_id = r.id
    LEFT JOIN (
      SELECT resource_id, COUNT(*)::int as document_count
      FROM resource_documents
      GROUP BY resource_id
    ) d ON d.resource_id = r.id
    ${userVoteJoin}
    WHERE r.id = $1
    LIMIT 1;
  `;

  const resourceRes = await query<ResourceItem>(sql, values);
  if (resourceRes.rows.length === 0) {
    throw new NotFoundError('Resource not found');
  }

  // Fetch documents attached to this resource
  const docsRes = await query<ResourceDocumentItem>(
    `
    SELECT id, title, file_url, file_type, file_size, created_at
    FROM resource_documents
    WHERE resource_id = $1
    ORDER BY created_at ASC;
    `,
    [resourceId]
  );

  return {
    ...resourceRes.rows[0],
    documents: docsRes.rows,
  };
}

export async function createResource(
  userId: string,
  input: CreateResourceInput
) {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const insertResourceSql = `
      INSERT INTO resources (
        title, course_name, course_code, description,
        year, semester, department, category, optional_note, user_id
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING id, title, created_at;
    `;

    const resourceRes = await client.query(insertResourceSql, [
      input.title.trim(),
      input.course_name.trim(),
      input.course_code ? input.course_code.trim() : null,
      input.description.trim(),
      input.year,
      input.semester,
      input.department.trim(),
      input.category,
      input.optional_note ? input.optional_note.trim() : null,
      userId,
    ]);

    const createdResource = resourceRes.rows[0];
    const resourceId = createdResource.id;

    // Insert documents
    for (const doc of input.documents) {
      await client.query(
        `
        INSERT INTO resource_documents (resource_id, title, file_url, file_type, file_size)
        VALUES ($1, $2, $3, $4, $5);
        `,
        [
          resourceId,
          doc.title.trim(),
          doc.file_url,
          doc.file_type || null,
          doc.file_size || null,
        ]
      );
    }

    await client.query('COMMIT');

    return {
      id: resourceId,
      title: createdResource.title,
      created_at: createdResource.created_at,
    };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

export async function deleteResource(resourceId: string, userId: string) {
  const checkRes = await query(
    `SELECT id, user_id FROM resources WHERE id = $1 LIMIT 1;`,
    [resourceId]
  );

  if (checkRes.rows.length === 0) {
    throw new NotFoundError('Resource not found');
  }

  if (checkRes.rows[0].user_id !== userId) {
    throw new ForbiddenError('You can only delete resources that you uploaded');
  }

  await query(`DELETE FROM resources WHERE id = $1;`, [resourceId]);

  return { success: true };
}

export async function getMyResources(userId: string) {
  const sql = `
    SELECT 
      r.id,
      r.title,
      r.course_name,
      r.course_code,
      r.description,
      r.year,
      r.semester,
      r.department,
      r.category,
      r.optional_note,
      r.created_at,
      COALESCE(d.document_count, 0)::int as document_count,
      COALESCE(v.upvotes, 0)::int as upvotes,
      COALESCE(v.downvotes, 0)::int as downvotes,
      COALESCE(v.vote_score, 0)::int as vote_score
    FROM resources r
    LEFT JOIN (
      SELECT 
        resource_id,
        COUNT(CASE WHEN vote_type = 1 THEN 1 END)::int as upvotes,
        COUNT(CASE WHEN vote_type = -1 THEN 1 END)::int as downvotes,
        (COUNT(CASE WHEN vote_type = 1 THEN 1 END) - COUNT(CASE WHEN vote_type = -1 THEN 1 END))::int as vote_score
      FROM resource_votes
      GROUP BY resource_id
    ) v ON v.resource_id = r.id
    LEFT JOIN (
      SELECT resource_id, COUNT(*)::int as document_count
      FROM resource_documents
      GROUP BY resource_id
    ) d ON d.resource_id = r.id
    WHERE r.user_id = $1
    ORDER BY r.created_at DESC;
  `;

  const res = await query<ResourceItem>(sql, [userId]);
  return res.rows;
}

export async function voteResource(
  resourceId: string,
  userId: string,
  voteType: 1 | -1
) {
  // 1. Ensure resource exists
  const resCheck = await query(`SELECT id FROM resources WHERE id = $1 LIMIT 1;`, [resourceId]);
  if (resCheck.rows.length === 0) {
    throw new NotFoundError('Resource not found');
  }

  // 2. Check existing vote
  const existingVoteRes = await query(
    `SELECT id, vote_type FROM resource_votes WHERE resource_id = $1 AND user_id = $2 LIMIT 1;`,
    [resourceId, userId]
  );

  let newUserVote: number | null = voteType;

  if (existingVoteRes.rows.length > 0) {
    const existing = existingVoteRes.rows[0];
    if (existing.vote_type === voteType) {
      // Toggle off / remove vote
      await query(`DELETE FROM resource_votes WHERE id = $1;`, [existing.id]);
      newUserVote = null;
    } else {
      // Switch vote
      await query(
        `UPDATE resource_votes SET vote_type = $1, updated_at = NOW() WHERE id = $2;`,
        [voteType, existing.id]
      );
      newUserVote = voteType;
    }
  } else {
    // New vote
    await query(
      `INSERT INTO resource_votes (resource_id, user_id, vote_type) VALUES ($1, $2, $3);`,
      [resourceId, userId, voteType]
    );
    newUserVote = voteType;
  }

  // 3. Compute new score
  const countsRes = await query<{ upvotes: string; downvotes: string; vote_score: string }>(
    `
    SELECT 
      COUNT(CASE WHEN vote_type = 1 THEN 1 END)::int as upvotes,
      COUNT(CASE WHEN vote_type = -1 THEN 1 END)::int as downvotes,
      (COUNT(CASE WHEN vote_type = 1 THEN 1 END) - COUNT(CASE WHEN vote_type = -1 THEN 1 END))::int as vote_score
    FROM resource_votes
    WHERE resource_id = $1;
    `,
    [resourceId]
  );

  const counts = countsRes.rows[0];

  return {
    vote_score: parseInt(counts?.vote_score || '0', 10),
    upvotes: parseInt(counts?.upvotes || '0', 10),
    downvotes: parseInt(counts?.downvotes || '0', 10),
    user_vote: newUserVote,
  };
}
