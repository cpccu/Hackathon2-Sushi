import bcrypt from 'bcryptjs';
import { query, pool } from '../config/db.js';

async function main() {
  console.log('--- Creating 3 new users ---');
  const passwordHash = await bcrypt.hash('password123', 10);

  // 1. Student User
  const studentRes = await query(
    `
    INSERT INTO users (full_name, email, password_hash, role, student_id, department, batch)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    ON CONFLICT (email) DO UPDATE SET 
      full_name = EXCLUDED.full_name,
      student_id = EXCLUDED.student_id,
      department = EXCLUDED.department,
      batch = EXCLUDED.batch,
      password_hash = EXCLUDED.password_hash
    RETURNING id, full_name, email, role, student_id;
    `,
    [
      'Nusrat Jahan',
      'nusrat@cityuniversity.edu',
      passwordHash,
      'student',
      '0272410005101999',
      'Computer Science and Engineering',
      '65'
    ]
  );
  console.log('Created/Updated Student:', studentRes.rows[0]);

  // 2. Club Admin User (Computer Club City University)
  const clubRes = await query(
    `SELECT id, name FROM clubs WHERE name = 'Computer Club City University' LIMIT 1;`
  );
  if (clubRes.rows.length === 0) {
    throw new Error('Computer Club City University not found in clubs table');
  }
  const computerClubId = clubRes.rows[0].id;
  console.log('Found club:', clubRes.rows[0].name, 'ID:', computerClubId);

  const clubAdminRes = await query(
    `
    INSERT INTO users (full_name, email, password_hash, role, student_id, department, batch)
    VALUES ($1, $2, $3, $4, NULL, $5, $6)
    ON CONFLICT (email) DO UPDATE SET 
      full_name = EXCLUDED.full_name,
      department = EXCLUDED.department,
      batch = EXCLUDED.batch,
      password_hash = EXCLUDED.password_hash,
      role = 'club_admin'
    RETURNING id, full_name, email, role;
    `,
    [
      'Tanvir Ahmed',
      'admin@computerclub.edu',
      passwordHash,
      'club_admin',
      'Computer Science and Engineering',
      '59'
    ]
  );
  const clubAdminUser = clubAdminRes.rows[0];
  console.log('Created/Updated Club Admin:', clubAdminUser);

  // Link to club_admins table
  await query(
    `
    INSERT INTO club_admins (user_id, club_id)
    VALUES ($1, $2)
    ON CONFLICT (user_id, club_id) DO NOTHING;
    `,
    [clubAdminUser.id, computerClubId]
  );
  console.log('Linked Tanvir Ahmed to Computer Club City University');

  // 3. Helpdesk Admin User
  const helpdeskAdminRes = await query(
    `
    INSERT INTO users (full_name, email, password_hash, role, student_id, department, batch)
    VALUES ($1, $2, $3, $4, NULL, $5, NULL)
    ON CONFLICT (email) DO UPDATE SET 
      full_name = EXCLUDED.full_name,
      department = EXCLUDED.department,
      password_hash = EXCLUDED.password_hash,
      role = 'helpdesk_admin'
    RETURNING id, full_name, email, role;
    `,
    [
      'Rafiqul Islam',
      'support@cityuniversity.edu',
      passwordHash,
      'helpdesk_admin',
      'Administration'
    ]
  );
  console.log('Created/Updated Helpdesk Admin:', helpdeskAdminRes.rows[0]);

  console.log('--- All 3 users created successfully with password123 ---');
  await pool.end();
  process.exit(0);
}

main().catch(err => {
  console.error('Failed to create users:', err);
  process.exit(1);
});
