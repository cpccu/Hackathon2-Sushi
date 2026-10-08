import bcrypt from 'bcryptjs';
import { pool } from '../config/db.js';

async function seed() {
  console.log('--- Seeding Database with City University Demo Information ---');
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Create Clubs
    const clubResult = await client.query(`
      INSERT INTO clubs (name, logo_url)
      VALUES 
        ('Computer Club City University', 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=150&auto=format&fit=crop&q=80'),
        ('Competitive Programming Camp City University', 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=150&auto=format&fit=crop&q=80'),
        ('Sports Club City University', 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=150&auto=format&fit=crop&q=80')
      ON CONFLICT (name) DO UPDATE SET logo_url = EXCLUDED.logo_url
      RETURNING id, name;
    `);

    const computerClub = clubResult.rows.find((r) => r.name === 'Computer Club City University') || clubResult.rows[0];
    const cpCampClub = clubResult.rows.find((r) => r.name === 'Competitive Programming Camp City University') || clubResult.rows[1];
    const sportsClub = clubResult.rows.find((r) => r.name === 'Sports Club City University') || clubResult.rows[2];

    // 2. Hash default password
    const passwordHash = await bcrypt.hash('password123', 10);

    // 3. Create Users
    // Student: Sizan Molla (ID: 0272410005101127, Batch: 64, Dept: Computer Science and Engineering)
    const studentUser = await client.query(`
      INSERT INTO users (full_name, email, password_hash, role, student_id, department, batch)
      VALUES ('Sizan Molla', 'sizan@cityuniversity.edu', $1, 'student', '0272410005101127', 'Computer Science and Engineering', '64')
      ON CONFLICT (email) DO UPDATE SET 
        full_name = EXCLUDED.full_name,
        student_id = EXCLUDED.student_id,
        department = EXCLUDED.department,
        batch = EXCLUDED.batch
      RETURNING id, email, full_name;
    `, [passwordHash]);

    // Demo Admin: Admin of Competitive Programming Camp City University
    const adminUser = await client.query(`
      INSERT INTO users (full_name, email, password_hash, role, student_id, department, batch)
      VALUES ('CP Camp Admin', 'admin@cpcamp.edu', $1, 'club_admin', NULL, 'Computer Science and Engineering', '58')
      ON CONFLICT (email) DO UPDATE SET full_name = EXCLUDED.full_name
      RETURNING id, email, full_name;
    `, [passwordHash]);

    // Associate admin with Competitive Programming Camp City University
    await client.query(`
      INSERT INTO club_admins (user_id, club_id)
      VALUES ($1, $2)
      ON CONFLICT (user_id, club_id) DO NOTHING;
    `, [adminUser.rows[0].id, cpCampClub.id]);

    // 4. Create Hosted Events (guarded to avoid re-seeding)
    const existingEvents = await client.query('SELECT COUNT(*) as count FROM events');
    let lastBattleId = null;
    let hackathonId = null;

    if (parseInt(existingEvents.rows[0].count, 10) === 0) {
      // Event 1: Computer Club City University - Intra Batch Programming Contest
      const regStart1 = new Date('2026-05-01T00:00:00Z');
      const regDeadline1 = new Date('2026-05-10T23:59:00Z');

      const event1Res = await client.query(`
        INSERT INTO events (
          club_id, name, description, cover_image_url, category, venue,
          event_date, start_time, duration_minutes,
          registration_start, registration_deadline,
          allowed_departments, allowed_batches, contact_email, status
        )
        VALUES (
          $1,
          'Intra Batch Programming Contest',
          'Annual intra-batch algorithmic problem solving contest hosted by Computer Club. Compete with your batchmates and showcase your competitive programming skills.',
          'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=80',
          'Competitive Programming',
          'lab room 213',
          '2026-05-11',
          '12:00',
          180,
          $2,
          $3,
          '{}',
          '{}',
          'computerclub@cityuniversity.edu',
          'upcoming'
        )
        RETURNING id, name;
      `, [computerClub.id, regStart1, regDeadline1]);

      // Event 2: Competitive Programming Camp City University - The Last Battle
      const regStart2 = new Date('2026-07-01T00:00:00Z');
      const regDeadline2 = new Date('2026-07-30T23:59:00Z');

      const event2Res = await client.query(`
        INSERT INTO events (
          club_id, name, description, cover_image_url, category, venue,
          event_date, start_time, duration_minutes,
          registration_start, registration_deadline,
          allowed_departments, allowed_batches, contact_email, status
        )
        VALUES (
          $1,
          'The Last Battle',
          'The flagship speed-coding battle of the season. 5 high-difficulty algorithmic challenges. Battle for the grand trophy and leaderboards.',
          'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&auto=format&fit=crop&q=80',
          'Competitive Programming',
          'online',
          '2026-07-31',
          '20:00',
          180,
          $2,
          $3,
          '{}',
          '{}',
          'cpcamp@cityuniversity.edu',
          'upcoming'
        )
        RETURNING id, name;
      `, [cpCampClub.id, regStart2, regDeadline2]);

      lastBattleId = event2Res.rows[0].id;

      // Add Dynamic Questions for The Last Battle
      const q1Res = await client.query(`
        INSERT INTO event_questions (event_id, question_text, is_required, order_index)
        VALUES 
          ($1, 'What is your Codeforces / VJudge handle?', true, 1),
          ($1, 'Preferred programming language (C++, Java, Python)?', false, 2)
        RETURNING id;
      `, [lastBattleId]);

      // Event 3: Competitive Programming Camp City University - Hackathon
      const regStart3 = new Date('2026-09-15T00:00:00Z');
      const regDeadline3 = new Date('2026-10-06T23:59:00Z');

      const event3Res = await client.query(`
        INSERT INTO events (
          club_id, name, description, cover_image_url, category, venue,
          event_date, start_time, duration_minutes,
          registration_start, registration_deadline,
          allowed_departments, allowed_batches, contact_email, status
        )
        VALUES (
          $1,
          'Hackathon',
          'Non-stop 24-hour innovation sprint. Build functional prototypes solving real campus and societal challenges. Industry mentorship provided.',
          'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&auto=format&fit=crop&q=80',
          'Hackathon',
          'online',
          '2026-10-07',
          '20:00',
          1440,
          $2,
          $3,
          '{}',
          '{}',
          'hackathon@cityuniversity.edu',
          'upcoming'
        )
        RETURNING id, name;
      `, [cpCampClub.id, regStart3, regDeadline3]);

      hackathonId = event3Res.rows[0].id;

      await client.query(`
        INSERT INTO event_questions (event_id, question_text, is_required, order_index)
        VALUES 
          ($1, 'What is your project/team name or are you participating solo?', true, 1),
          ($1, 'Briefly describe your track (AI, Web3, FinTech, GreenTech)?', false, 2);
      `, [hackathonId]);

      // Event 4: Sports Club City University - City University Annual Football Tournament
      const regStart4 = new Date('2026-10-15T00:00:00Z');
      const regDeadline4 = new Date('2026-11-10T23:59:00Z');

      await client.query(`
        INSERT INTO events (
          club_id, name, description, cover_image_url, category, venue,
          event_date, start_time, duration_minutes,
          registration_start, registration_deadline,
          allowed_departments, allowed_batches, contact_email, status
        )
        VALUES (
          $1,
          'City University Annual Football Tournament',
          'Inter-department football championship. 7-a-side matches under the floodlights at the main campus ground.',
          'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&auto=format&fit=crop&q=80',
          'Sports',
          'Main Campus Sports Ground',
          '2026-11-15',
          '15:00',
          120,
          $2,
          $3,
          '{}',
          '{}',
          'sports@cityuniversity.edu',
          'upcoming'
        )
      `, [sportsClub.id, regStart4, regDeadline4]);

      // 5. Register Sizan Molla for The Last Battle & Hackathon
      const regSizan1 = await client.query(`
        INSERT INTO registrations (event_id, user_id, status)
        VALUES ($1, $2, 'registered')
        ON CONFLICT (event_id, user_id) DO NOTHING
        RETURNING id;
      `, [lastBattleId, studentUser.rows[0].id]);

      if (regSizan1.rows.length > 0 && q1Res.rows.length > 0) {
        await client.query(`
          INSERT INTO registration_answers (registration_id, question_id, answer_text)
          VALUES 
            ($1, $2, 'sizan_codeforces'),
            ($1, $3, 'C++20');
        `, [regSizan1.rows[0].id, q1Res.rows[0].id, q1Res.rows[1].id]);
      }

      await client.query(`
        INSERT INTO registrations (event_id, user_id, status)
        VALUES ($1, $2, 'registered')
        ON CONFLICT (event_id, user_id) DO NOTHING;
      `, [hackathonId, studentUser.rows[0].id]);
    }

    // 6. Seed Demo Academic Resources (Phase 2)
    const existingRes = await client.query('SELECT COUNT(*) as count FROM resources');
    if (parseInt(existingRes.rows[0].count, 10) === 0) {
      // Resource 1: Mid Question
      const res1 = await client.query(`
        INSERT INTO resources (
          title, course_name, course_code, description,
          year, semester, department, category, optional_note, user_id
        )
        VALUES (
          'CSE 211 Data Structures Midterm Questions with Solution Sketches',
          'Data Structures',
          'CSE 211',
          'Official midterm question set from Spring 2024 covering Stack, Queue, Linked List, and Binary Search Trees with partial solution notes.',
          2024,
          'Spring',
          'Computer Science and Engineering',
          'Mid Question',
          'Prepared for Batch 62-64 revision. Questions 3 & 4 have handwritten notes.',
          $1
        )
        RETURNING id;
      `, [studentUser.rows[0].id]);

      await client.query(`
        INSERT INTO resource_documents (resource_id, title, file_url, file_type, file_size)
        VALUES 
          ($1, 'CSE211_Midterm_Questions_Spring2024.pdf', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 'pdf', 1048576),
          ($1, 'BST_Traversal_Quick_Reference.pdf', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 'pdf', 524288);
      `, [res1.rows[0].id]);

      // Resource 2: Class Notes
      const res2 = await client.query(`
        INSERT INTO resources (
          title, course_name, course_code, description,
          year, semester, department, category, optional_note, user_id
        )
        VALUES (
          'DBMS Normalization & Relational Algebra Handouts',
          'Database Management Systems',
          'CSE 311',
          'Concise handwritten class notes explaining 1NF, 2NF, 3NF, BCNF decomposition and SQL Join optimization.',
          2024,
          'Summer',
          'Computer Science and Engineering',
          'Class Notes',
          'Covered in lectures 12 through 18 by faculty.',
          $1
        )
        RETURNING id;
      `, [studentUser.rows[0].id]);

      await client.query(`
        INSERT INTO resource_documents (resource_id, title, file_url, file_type, file_size)
        VALUES 
          ($1, 'DBMS_Normalization_Complete_Notes.pdf', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 'pdf', 2097152);
      `, [res2.rows[0].id]);

      // Resource 3: Lab Manual
      const res3 = await client.query(`
        INSERT INTO resources (
          title, course_name, course_code, description,
          year, semester, department, category, optional_note, user_id
        )
        VALUES (
          'Electrical Circuits I Lab Experiments & MultiSim Guides',
          'Electrical Circuits I',
          'EEE 163',
          'Complete lab manual with circuit diagrams, KVL/KCL verification procedures, and Thevenin equivalent steps.',
          2023,
          'Fall',
          'Electrical and Electronic Engineering',
          'Lab',
          NULL,
          $1
        )
        RETURNING id;
      `, [studentUser.rows[0].id]);

      await client.query(`
        INSERT INTO resource_documents (resource_id, title, file_url, file_type, file_size)
        VALUES 
          ($1, 'EEE163_Lab_Manual_Full.pdf', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 'pdf', 3145728);
      `, [res3.rows[0].id]);

      // Add a couple sample upvotes from admin to resource 1 & 2
      await client.query(`
        INSERT INTO resource_votes (resource_id, user_id, vote_type)
        VALUES 
          ($1, $2, 1),
          ($3, $2, 1)
        ON CONFLICT (resource_id, user_id) DO NOTHING;
      `, [res1.rows[0].id, adminUser.rows[0].id, res2.rows[0].id]);
    }

    // 7. Seed Demo Lost & Found Posts (Phase 3 - strictly guarded)
    const existingLF = await client.query('SELECT COUNT(*) as count FROM lost_found_posts');
    if (parseInt(existingLF.rows[0].count, 10) === 0) {
      // Post 1: Lost - Casio Calculator
      await client.query(`
        INSERT INTO lost_found_posts (
          user_id, post_type, item_name, description, keywords,
          location, incident_date, contact_phone, images, status
        )
        VALUES (
          $1,
          'lost',
          'Casio fx-991EX ClassWiz Calculator',
          'Lost my black Casio ClassWiz calculator during the CSE 211 midterm exam. It has a small yellow sticker on the back cover.',
          ARRAY['calculator', 'casio', 'fx-991ex', 'exam-hall'],
          'Academic Building 2, Room 402',
          '2026-10-06',
          '01712345678',
          ARRAY['https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?w=800&auto=format&fit=crop&q=80'],
          'active'
        )
      `, [studentUser.rows[0].id]);

      // Post 2: Found - Brown Leather Wallet
      await client.query(`
        INSERT INTO lost_found_posts (
          user_id, post_type, item_name, description, keywords,
          location, incident_date, contact_phone, images, status
        )
        VALUES (
          $1,
          'found',
          'Brown Leather Wallet with Student ID Card',
          'Found a brown leather wallet on a bench near the central cafeteria. Contains a City University student card and keys. Deposited safely at cafeteria security desk.',
          ARRAY['wallet', 'id-card', 'cafeteria', 'keys'],
          'Central Cafeteria Bench #3',
          '2026-10-07',
          '01898765432',
          ARRAY[
            'https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&auto=format&fit=crop&q=80'
          ],
          'active'
        )
      `, [adminUser.rows[0].id]);

      // Post 3: Resolved - Blue Umbrella
      await client.query(`
        INSERT INTO lost_found_posts (
          user_id, post_type, item_name, description, keywords,
          location, incident_date, contact_phone, images, status
        )
        VALUES (
          $1,
          'lost',
          'Blue Foldable Umbrella with Wooden Handle',
          'Left my umbrella in the library 2nd floor reading zone after rainy morning. Collected back safely.',
          ARRAY['umbrella', 'library', 'blue'],
          'Central Library 2nd Floor',
          '2026-10-02',
          NULL,
          ARRAY['https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?w=800&auto=format&fit=crop&q=80'],
          'resolved'
        )
      `, [studentUser.rows[0].id]);
    }

    await client.query('COMMIT');
    console.log('✅ Database successfully seeded with City University information!');
    console.log('Demo Credentials:');
    console.log('  Student: sizan@cityuniversity.edu / password123');
    console.log('  Admin (CP Camp): admin@cpcamp.edu / password123');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Seeding failed:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
