import bcrypt from 'bcryptjs';
import { pool, query } from '../config/db.js';

interface SeedPost {
  post_type: 'academic' | 'facilities';
  title: string;
  description: string;
  keywords: string[];
  steps: string[];
  attachments: Array<{
    title: string;
    file_url: string;
    file_type: string;
    file_size: number;
  }>;
}

const INITIAL_POSTS: SeedPost[] = [
  // ─── Academic ─────────────────────────────────────────────────────────────
  {
    post_type: 'academic',
    title: 'Institution Rules & Student Code of Conduct',
    description: `City University upholds a standard of academic excellence, discipline, and mutual respect among students and faculty members. All registered students are expected to strictly adhere to the following institutional regulations:

### 1. Student Discipline & General Conduct
* Every student must maintain decent behavior and disciplinary standards both on and off campus.
* Political activities, ragging, verbal harassment, physical altercations, and smoking or substance use anywhere on university premises are strictly prohibited.
* Damaging university property, equipment, or campus infrastructure will incur severe disciplinary penalties and monetary reimbursement.

### 2. Identity Cards
* All students must visibly wear their official City University Student ID card at all times while on campus.
* Entry into classrooms, laboratories, the library, and examinations requires presenting a valid Student ID.

### 3. Attendance & Academic Responsibilities
* Regular attendance is mandatory. A minimum of **75% class attendance** is required in each course to be eligible to sit for the semester final examinations.
* Students falling between 60% and 74% attendance may only be permitted to sit as non-collegiate candidates upon payment of the designated non-collegiate fee with departmental clearance.

### 4. Campus Safety & Inquiries
* For institutional inquiries, students should contact the Proctor's Office or their respective Department Head.`,
    keywords: ['rules', 'institution', 'discipline', 'attendance', 'student conduct', 'campus policy', 'proctor'],
    steps: [],
    attachments: [],
  },
  {
    post_type: 'academic',
    title: 'Examination Rules & Regulations',
    description: `To maintain high academic integrity and fair assessment, all students sitting for Midterm and Semester Final Examinations at City University must comply with the following mandatory examination rules.

### Essential Examination Regulations
Failure to comply with any of these rules will result in disciplinary sanctions, course cancellation, or academic expulsion.

1. **Electronic Gadgets**: Mobile phones, smartwatches, digital calculators with programming memory, and any digital storage devices are strictly prohibited inside the exam hall.
2. **Identification**: Students must bring their official City University **Student ID Card** and original **Admit Card**. Entry will be denied without these credentials.
3. **Dress Code**: Wearing **round-neck T-shirts is strictly prohibited** inside the examination hall. Decent and appropriate university attire is required.
4. **Seat Plan**: Students must check their assigned seat plan on the departmental notice board before entering the hall and sit only in their designated seat.
5. **Academic Integrity**: Any form of cheating, talking, passing materials, or possession of unauthorized papers will lead to immediate expulsion from the exam.`,
    keywords: ['exam', 'examination', 'rules', 'admit card', 'seat plan', 'cheating', 'dress code', 'midterm', 'final'],
    steps: [
      'Mobile phones and smartwatches are strictly prohibited inside the examination hall.',
      'Students must bring their original Student ID Card and Admit Card.',
      'Wearing round-neck T-shirts is strictly prohibited in the examination hall.',
      'Students must check their assigned seat plan before entering the examination hall.',
      'Any form of cheating or use of forged documents may result in immediate expulsion.',
    ],
    attachments: [],
  },
  {
    post_type: 'academic',
    title: 'Admission Fees & Tuition Fee Structure',
    description: `City University provides competitive tuition and admission fee structures across all undergraduate and graduate disciplines. 

### Overview of Fee Components
* **Admission Fee**: One-time non-refundable fee payable at the time of admission.
* **Tuition Fees**: Payable per credit hour or per semester according to department guidelines.
* **Semester Fees**: Includes library, laboratory, sports, computer, and student development facilities.
* **Payment Venue**: All academic fees must be deposited at the Accounts Office located on the right side of the main Admission Hall or via approved university bank accounts.

Please review the attached official tuition fee schedule for exact department-by-department credit costs and payment schedules.`,
    keywords: ['admission', 'fees', 'tuition', 'cost', 'payment', 'semester fee', 'accounts', 'rates'],
    steps: [],
    attachments: [
      {
        title: 'City University Official Tuition & Admission Fee Schedule',
        file_url: 'https://res.cloudinary.com/dznyobb8i/image/upload/v1791438743/tuition-fees.jpg',
        file_type: 'jpg',
        file_size: 450000,
      },
    ],
  },
  {
    post_type: 'academic',
    title: 'Admission Process & Document Submission',
    description: `Follow this straightforward step-by-step procedure to complete your admission and enrollment at City University.

### Required Documentation Checklist
Before visiting the Admission Office, ensure you have gathered the following:
* Original and photocopies of SSC and HSC mark sheets, grade sheets, and testimonials/certificates.
* 4 copies of recent passport-size photographs.
* Copy of National ID card (NID) or Birth Certificate of the student and guardian.

### Procedure Overview
Admissions are processed directly at the Central Admission Office in the main building. Follow the step-by-step guide below to successfully complete your registration.`,
    keywords: ['admission', 'process', 'registration', 'form', 'enrollment', 'admission office', 'documents', 'accounts'],
    steps: [
      'Bring the required documents: HSC Grade Sheet/Marksheet/Certificate, NID or Birth Certificate, and Passport-size photographs.',
      'Collect an admission form from the Admission Office and fill out all required personal and academic information.',
      'Pay the designated admission fee at the Accounts Room located on the right side of the Admission Hall.',
      'Submit the completed form along with document photocopies and payment receipt to the Admission Officer.',
      'Receive your official Admission Card. Once received, you are officially enrolled as a student of City University.',
    ],
    attachments: [],
  },
  {
    post_type: 'academic',
    title: 'Undergraduate Waiver Policy & Scholarships',
    description: `City University offers generous tuition fee waivers and merit scholarships to assist meritorious and underprivileged students.

### Undergraduate Merit Waiver (Based on SSC & HSC Results)

| SL | Result of SSC & HSC | Waiver | Required CGPA to Retain Waiver (From 2nd Semester) |
| -: | :-------------------------------- | -----: | -------------------------------------------------: |
| 01 | Golden GPA 5.00 in both SSC & HSC | 100% | 3.60 |
| 02 | GPA 5.00 in both SSC & HSC | 75% | 3.50 |
| 03 | GPA 9.00 – 9.99 in total | 30% | 3.20 |
| 04 | GPA 8.00 – 8.99 in total | 25% | 3.00 |
| 05 | GPA 7.00 – 7.99 in total | 20% | 3.00 |
| 06 | GPA 6.00 – 6.99 in total | 15% | 3.00 |
| 07 | GPA 5.00 – 5.99 in total | 10% | 3.00 |

---

### Special Category Waivers
Students falling under special categories may receive **up to 50% tuition fee waiver**:
* **Siblings**: Siblings studying concurrently at City University.
* **Spouse**: Husband and wife studying simultaneously.
* **Hafiz**: Hafiz of the Holy Quran.
* **Freedom Fighters**: Children or grandchildren of recognized freedom fighters.
* **Physically Challenged**: Differently-abled students.
* **Sports Quota**: Recognized national or divisional sports performers.

> **Important Rule**: A student cannot receive more than one waiver simultaneously. If a student qualifies for multiple waiver categories, only the **highest applicable waiver** will be granted.`,
    keywords: ['waiver', 'scholarship', 'gpa', 'tuition discount', 'financial aid', 'freedom fighter', 'golden gpa', 'merit'],
    steps: [],
    attachments: [],
  },

  // ─── Facilities ───────────────────────────────────────────────────────────
  {
    post_type: 'facilities',
    title: 'Library Facilities & KOHA e-Library',
    description: `The City University Central Library is located in the main building at Khagan, Birulia, Savar, Dhaka. It provides a state-of-the-art learning space with extensive physical and electronic collections.

### Physical Library Highlights
* **Collection**: Houses **21,000+ printed books**, journals, thesis reports, and CDs.
* **Open-Shelf Access**: Operates as an open-shelf library where students can browse books directly on the shelves.
* **Online Catalog**: Powered by **KOHA Integrated Library System** for computerized cataloging and automated circulation.
* **Quiet Reading Zones**: Spacious air-conditioned reading halls accommodating hundreds of students simultaneously.

### Digital Library & e-Resources
City University is an active member of the **UGC Digital Library (UDL)**, providing campus-wide access to world-class online academic resources:
* **120,000+ e-books** available across leading academic publishers.
* **30,950+ peer-reviewed e-journals** accessible through HINARI, AGORA, ARDI, OARE, and GOALI consortia.
* **3,500+ e-books** accessed directly via UDL subscription.

### Subject Coverage
The collection extensively spans English Literature, Law, Computer Science, Electrical Engineering, Mechanical Engineering, Textile, Civil, Agriculture, Pharmacy, Economics, Business, and Mathematics.`,
    keywords: ['library', 'books', 'e-books', 'journals', 'udl', 'koha', 'reading room', 'thesis', 'digital library'],
    steps: [],
    attachments: [],
  },
  {
    post_type: 'facilities',
    title: 'Canteen Facilities & Meal Schedules',
    description: `The City University Central Cafeteria provides hot meals, breakfast, and snacks for students, faculty, and administrative staff at subsidized rates.

### Operating Hours & Meal Routine
* **Breakfast**: 8:00 AM – 10:30 AM
* **Lunch**: 12:30 PM – 3:30 PM
* **Evening Snacks**: 4:00 PM – 6:30 PM

### Hygiene & Quality
* All food items are prepared under hygienic conditions supervised by the campus health committee.
* Filtered RO drinking water is provided free of charge.

Please check the attached cafeteria schedule images below for the weekly menu breakdown, routine items, and pricing.`,
    keywords: ['canteen', 'cafeteria', 'food', 'meals', 'lunch', 'breakfast', 'schedule', 'routine'],
    steps: [],
    attachments: [
      {
        title: 'Central Canteen Daily Schedule & Meal Timetable - Part 1',
        file_url: 'https://res.cloudinary.com/dznyobb8i/image/upload/v1791438857/IMG-20260921-WA0002.jpg',
        file_type: 'jpg',
        file_size: 380000,
      },
      {
        title: 'Central Canteen Daily Schedule & Meal Timetable - Part 2',
        file_url: 'https://res.cloudinary.com/dznyobb8i/image/upload/v1791438857/IMG-20260921-WA0001.jpg',
        file_type: 'jpg',
        file_size: 410000,
      },
    ],
  },
  {
    post_type: 'facilities',
    title: 'Campus Bus Routes & Commuter Schedules',
    description: `City University operates a dedicated fleet of commuter buses connecting the permanent campus at Khagan, Birulia, Savar with major hubs across Dhaka and surrounding regions.

### Major Bus Routes
1. **Mirpur Route**: Mirpur-10 → Mirpur-1 → Gabtoli → Beribadh → Campus.
2. **Uttara Route**: House Building → Azampur → Airport → Abdullahpur → Ashulia → Campus.
3. **Dhanmondi Route**: Kalabagan → Science Lab → Asad Gate → Shyamoli → Campus.
4. **Savar & Nabinagar Route**: Savar Bazar → Radio Colony → Baipail → Campus.
5. **Gazipur Route**: Gazipur Chowrasta → Konabari → Zirani → Campus.

### Commuter Guidelines
* Students must show their valid Student ID card when boarding university buses.
* Departure times are strictly maintained in the morning and after classes in the afternoon.

Please refer to the attached Bus Schedule document for detailed timing schedules and stoppage points.`,
    keywords: ['bus', 'transport', 'route', 'shuttle', 'schedule', 'pickup', 'commute', 'transportation'],
    steps: [],
    attachments: [
      {
        title: 'University Commuter Bus Routes & Timetable (Official Schedule)',
        file_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        file_type: 'pdf',
        file_size: 245000,
      },
    ],
  },
  {
    post_type: 'facilities',
    title: 'Classroom Facilities & Environment Overview',
    description: `City University academic buildings feature modern, well-ventilated classrooms designed to facilitate interactive learning.

### Standard Classroom Amenities
* **Seating**: Comfortable student desks and podium seating arranged for clear visibility.
* **Audio-Visual**: Classrooms are outfitted with digital ceiling-mounted projectors and projection screens.
* **Climate Control**: Select classrooms are equipped with split air-conditioning units and ceiling fans.
* **Environment**: Natural lighting and daily sanitization maintenance.

### Current Operating Status & Notices
* **Air Conditioning**: AC units in some older wings are undergoing scheduled servicing and maintenance.
* **Projector Availability**: Multimedia projectors in specific rooms are scheduled for digital upgrade. If a projector experiences connectivity issues, report to the floor coordinator immediately.`,
    keywords: ['classroom', 'facilities', 'projector', 'ac', 'lecture hall', 'campus', 'amenities'],
    steps: [],
    attachments: [],
  },
  {
    post_type: 'facilities',
    title: 'University Laboratories Overview',
    description: `Practical application is an essential part of engineering, pharmacy, and science programs at City University. The campus maintains specialized laboratories across departments.

### Departmental Laboratories
* **Computer Science & Software Labs**: Equipped with networked workstations running Linux and Windows, Python, Java, C++, and database IDE environments.
* **EEE & Circuit Labs**: Signal generators, digital oscilloscopes, microcontrollers, and electrical testing hardware.
* **Textile & Mechanical Testing Labs**: Fabric testing machines, spinning/weaving demonstration units, and mechanics test benches.
* **Pharmacy Labs**: Chemistry, pharmacology, and microbiology clean rooms.

### Current Lab Notes & Guidelines
* Many software labs feature modern PCs, while specific introductory labs have older desktop hardware scheduled for renewal.
* Students must wear lab coats where required and follow laboratory safety protocols strictly.`,
    keywords: ['lab', 'computers', 'practical', 'cse lab', 'hardware', 'equipment', 'experiments', 'workstations'],
    steps: [],
    attachments: [],
  },
];

async function seedHelpdesk() {
  console.log('--- Starting Smart Helpdesk Seeding ---');
  const client = await pool.connect();

  try {
    // 1. Ensure Helpdesk Admin User Exists
    const adminEmail = 'helpdesk@cityuniversity.edu';
    const checkUser = await client.query('SELECT id, full_name FROM users WHERE email = $1 LIMIT 1;', [adminEmail]);

    let adminId: string;
    if (checkUser.rows.length === 0) {
      const passwordHash = await bcrypt.hash('password123', 10);
      const insertUser = await client.query(
        `INSERT INTO users (full_name, email, password_hash, role, student_id, department, batch)
         VALUES ($1, $2, $3, 'helpdesk_admin', NULL, 'Administration', 'Staff')
         RETURNING id;`,
        ['CU Helpdesk Admin', adminEmail, passwordHash]
      );
      adminId = insertUser.rows[0].id;
      console.log('✅ Created new Helpdesk Admin user:', adminEmail);
    } else {
      adminId = checkUser.rows[0].id;
      // Ensure role is helpdesk_admin
      await client.query("UPDATE users SET role = 'helpdesk_admin' WHERE id = $1;", [adminId]);
      console.log('ℹ️ Existing user set to helpdesk_admin:', adminEmail);
    }

    // 2. Insert or update initial posts
    for (const post of INITIAL_POSTS) {
      // Check if post with same title exists
      const checkPost = await client.query(
        'SELECT id FROM helpdesk_posts WHERE title = $1 LIMIT 1;',
        [post.title]
      );

      let postId: string;
      if (checkPost.rows.length === 0) {
        const insertPost = await client.query(
          `INSERT INTO helpdesk_posts (
             post_type, title, description, keywords, steps, created_by, last_updated_by
           )
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           RETURNING id;`,
          [
            post.post_type,
            post.title,
            post.description,
            post.keywords,
            JSON.stringify(post.steps),
            adminId,
            adminId,
          ]
        );
        postId = insertPost.rows[0].id;
        console.log(`✅ Seeded post: "${post.title}"`);
      } else {
        postId = checkPost.rows[0].id;
        await client.query(
          `UPDATE helpdesk_posts
           SET post_type = $1, description = $2, keywords = $3, steps = $4, last_updated_by = $5, updated_at = NOW()
           WHERE id = $6;`,
          [
            post.post_type,
            post.description,
            post.keywords,
            JSON.stringify(post.steps),
            adminId,
            postId,
          ]
        );
        console.log(`🔄 Updated post: "${post.title}"`);
      }

      // 3. Insert attachments if any
      // Remove old attachments for clean re-seed of this post only
      await client.query('DELETE FROM helpdesk_attachments WHERE post_id = $1;', [postId]);
      for (const att of post.attachments) {
        await client.query(
          `INSERT INTO helpdesk_attachments (post_id, title, file_url, file_type, file_size)
           VALUES ($1, $2, $3, $4, $5);`,
          [postId, att.title, att.file_url, att.file_type, att.file_size]
        );
      }
    }

    console.log('🎉 Smart Helpdesk seeding finished successfully!');
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

seedHelpdesk();
