# CampusOS — City University
A unified digital campus hub bringing City University events, academic resources, essential information, lost & found, and student complaints into one place.

> **CPCCU AI-Powered Web App Development & Deployment Hackathon 2026**  
> **Challenge:** Build a Smart Digital Campus Hub for City University  
> **Live App:** [https://hackathon2-sushi.vercel.app/](https://hackathon2-sushi.vercel.app/) *(or your Vercel URL)*  
> **Backend API:** [https://backend-campusos.onrender.com/api/v1](https://backend-campusos.onrender.com/api/v1)  
> **API Health:** [https://backend-campusos.onrender.com/health](https://backend-campusos.onrender.com/health)

---

## 1. Problem & Solution

### The City University Problem
At City University (Khagan, Birulia, Savar), vital information is fragmented across informal, chaotic channels:
* **Buried Events:** Contests and workshops get lost in disparate Facebook groups and Messenger chats.
* **Pre-Exam Panic:** Students scramble through chat history for past exam papers and lecture notes.
* **Untraceable Logistics:** Commuter bus schedules, canteen hours, and admission fees are difficult to locate.
* **Ephemeral Lost & Found:** Lost belongings posted on social media stories vanish within 24 hours.
* **Fear of Retaliation:** Students lack a confidential channel to report academic and facility grievances.

### The CampusOS Solution
CampusOS is a unified, searchable, role-based digital campus hub built specifically for City University students, organizers, and administration. It fully implements **all four core hackathon challenge modules**:

| Module | Core Purpose | Student Routes | Admin Routes |
|---|---|---|---|
| **Club & Event Engine** | Campus-wide event discovery, eligibility check, QR pass check-in | `/events`, `/my-events` | `/event-dashboard`, `/check-in/[id]` |
| **Resource Hub** | Searchable repository for past exams, notes, and lab manuals | `/resources`, `/my-resources` | *(Uploader controls)* |
| **Smart Helpdesk** | Verified institutional guide with official rules and schedules | `/helpdesk`, `/helpdesk/[id]` | `/helpdesk-dashboard` |
| **Lost & Found** | Central catalog for lost and recovered campus belongings | `/lost-found`, `/my-posts` | *(Creator controls)* |
| **Complaint Box** | 100% anonymous grievance channel with official responses | `/complaints`, `/complaints/[id]` | `/complaints/[id]` *(Respond)* |

---

## 2. Module 1: Club & Event Engine

### Student Experience (`/events`)
* **Feed & Pagination:** Events display newest to oldest, **20 per page** with **Load More**.
* **Filtering:** Instant filter by Event Name, Club, Department, Category, and Date.
* **Event Cards & Details (`/events/[id]`):** Cover image, club logo, department, category, date, start time, duration, venue, eligibility rules, registration window, and organizer contact email.
* **Smart Registration:**
  * Uses stored profile data (`Full Name`, `Student ID`, `Department`, `Batch`) automatically.
  * Checks eligibility against allowed departments and batches.
  * Enforces dynamic organizer questions (required vs. optional).
  * Adaptive button states: *Login* → *Register* → *Ineligible (hidden)* → *Registration Closed* → *Show QR*.
* **QR Check-in Pass:** Generates a QR code containing `/check-in/<registrationId>`. Scanned using any standard smartphone camera. Registered events are managed under `/my-events`.

### Club Administration (`/event-dashboard`)
* **Scope:** Managed exclusively by `CLUB_ADMIN` users (no separate public club directory).
* **Creation Form:** Title, Description, Cover, Category, Venue, Date, Start Time, Duration, Registration Window, Department/Batch restrictions, custom questions, and contact email.
* **Post-Creation Edits:** Admins can edit Name, Description, Date, Start Time, Duration, Registration Start, and Registration Deadline *(scope restrictions remain locked)*.
* **Participant Management:** Real-time search by Name/ID, showing Department, Batch, Registration Status, and total checked-in tally.
* **Check-In Terminal (`/check-in/[registrationId]`):**
  * **Authorization Checks:** User is authenticated, has `CLUB_ADMIN` role, event belongs to admin's club, registration exists, and student is not already checked in.

---

## 3. Module 2: Academic Resource Hub

A peer-curated academic repository solving the last-minute exam scramble:

* **Categories:** `Mid Question`, `Final Question`, `Class Notes`, `Slides`, `Lab`, `Class Test`, `Assignment`, `Other`.
* **Organization & Search:** Filterable by Course Name, Course Code (e.g., `CSE 211`), Academic Year, Semester (`Spring`, `Summer`, `Fall`), Department, and Category.
* **Community Ranking & Peer Quality Control:** Materials are ranked dynamically by **Vote Score** (`upvotes - downvotes`) and date. This crowdsources quality control without requiring administrative bottlenecks:
  * **Verified materials float to the top:** Accurate exam solutions, clear handouts, and complete lab guides naturally rise to the first page.
  * **Noise is filtered out:** Blurry photos, incomplete notes, or outdated syllabi are downvoted and deprioritized.
  * **Saves exam-night revision time:** Students under pre-exam pressure don't have to download 10 different files to find the right one—the highest community-vetted document is always front and center.
  * **Toggleable & Idempotent:** Students can upvote (+1), downvote (-1), or cancel/switch their vote at any time.
* **Uploads (`/resources/upload`):** Any student can upload resources with title, course code, year, semester, department, category, notes, and multiple attachments (file URL, title, size, type).
* **Ownership (`/my-resources`):** Only the student who uploaded the resource can delete it.

---

## 4. Module 3: Smart Helpdesk

* **Routes:** `/helpdesk` (searchable card catalog), `/helpdesk/[postId]` (detail & guides), `/helpdesk-dashboard` (global admin).
* **Search:** Full-text indexing across Title, Description, and Keywords array.
* **Dynamic Guides:** Optional ordered steps (`Step 1`, `Step 2`...) for complex procedures. If omitted, displays *"No step-by-step guide for this information."*
* **Accountability:** `Provided By` automatically stamps the name of the `HELPDESK_ADMIN` who created or last edited the article, along with `Last Updated`.
* **Global Administration:** Any user with the `HELPDESK_ADMIN` role can create, edit, and delete any helpdesk post.

---

## 5. Module 4: Campus Safety & Voice

### A. Lost & Found (`/lost-found`)
* **Pages:** `/lost-found`, `/lost-found/[postId]`, `/lost-found/create`, `/my-posts`.
* **Search & Filters:** Search by Item Name, Description, Location, and Keywords. Filter by Lost vs. Found, Date Range, and Active vs. Resolved.
* **Photo Attachments:** Supports 1 to 3 images per post with interactive viewer.
* **Automatic Contact Info:** Reporter's Name, Batch, Department are auto-populated from their authenticated profile. Gmail is provided by the user separately (phone number optional).
* **Lifecycle:** Reports transition from `Active` → `Resolved`. Only the original author can mark an item resolved. Posts are never permanently deleted.

### B. Anonymous Complaint Box (`/complaints`)
* **Guaranteed Anonymity by Architecture:** The `complaints` database table contains **NO `user_id`, NO `student_id`, NO email, and NO IP address**. Submission is cryptographically decoupled from user identity.
* **Pages:** Exactly two pages: `/complaints` (public feed) and `/complaints/[complaintId]` (detail & responses). There is no "My Complaints" page and complaints cannot be edited once submitted.
* **Listing & Filters:** Sorted newest to oldest. Filter by Category (`academic`, `facilities`, `general`, `transport`, `hostel`, `other`) and Response Status.
* **Immutable Admin Responses:** Only `HELPDESK_ADMIN` users can reply. Responses display admin name, date, and message. Cards show response counts and a **"Responded by You"** badge for active admins.

---

## 6. Authentication & Roles

* **Session Security:** Server-side sessions with opaque token hashing stored in PostgreSQL, delivered via HttpOnly, secure cookies (`SameSite=None; Secure`).
* **Signup:** Full Name, Student ID (immutable), Email, Department, Batch, Password.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Role Permission Matrix                          │
├────────────────────────────┬─────────────┬──────────────┬──────────────┤
│ Feature                    │   STUDENT   │  CLUB_ADMIN  │HELPDESK_ADMIN│
├────────────────────────────┼─────────────┼──────────────┼──────────────┤
│ Register for Events & QR   │      ✅      │      ✅      │      ✅      │
│ Upload & Vote Resources    │      ✅      │      ✅      │      ✅      │
│ Post Lost & Found Items    │      ✅      │      ✅      │      ✅      │
│ Submit Anonymous Complaint │      ✅      │      ✅      │      ✅      │
│ Manage Club Events & Doors │      ❌      │      ✅      │      ❌      │
│ Manage Helpdesk Articles   │      ❌      │      ❌      │      ✅      │
│ Post Complaint Responses   │      ❌      │      ❌      │      ✅      │
└────────────────────────────┴─────────────┴──────────────┴──────────────┘
```

---

## 7. How CampusOS Solves Real CU Scenarios

1. **Finding & Joining Club Contests:** A student checks `/events` to find the Computer Club Intra-Batch Contest, verifies eligibility in one view, answers required questions, and receives an instant QR pass.
2. **Pre-Exam Revision:** Hours before the CSE 211 midterm, a student searches `/resources` and downloads top-voted past question sets and handwritten notes.
3. **Checking Commuter Routes:** A student planning their morning commute checks `/helpdesk` for Mirpur and Uttara university bus departure times.
4. **Misplaced Possessions:** A student leaves a calculator in Room 402, files an item report on `/lost-found/create`, and is contacted directly by the finder.
5. **Fearless Feedback:** A student reports malfunctioning lab air conditioning via `/complaints`. Their identity is completely omitted, and the administration posts an official update.

---

## 8. Technical Architecture

* **Frontend:** Next.js 16 (App Router), React 19, Tailwind CSS v4, Lucide Icons, `qrcode.react`, React Hook Form, Zod.
* **Backend:** Node.js, Express.js, TypeScript, `pg` (parameterized raw SQL, no ORM overhead), Cloudinary, Multer, Helmet, Rate Limiter, bcryptjs.
* **Database:** Neon Serverless PostgreSQL with SSL. 6 structured migrations (`001_init` through `006_complaints`).
* **Hosting:** Frontend on **Vercel**, Backend on **Render**, Database on **Neon**.

### Repository Structure
```text
Hackathon2-Sushi/
├── backend/
│   ├── src/
│   │   ├── config/          # DB connection pool & Cloudinary config
│   │   ├── controllers/     # Route controllers (Events, Resources, Helpdesk, Complaints, etc.)
│   │   ├── db/
│   │   │   ├── migrations/  # Raw SQL migrations (001_init through 006_complaints)
│   │   │   └── seed.ts      # City University demo data & user seeder
│   │   ├── middlewares/     # Session auth, role guards, file upload, error handlers
│   │   ├── routes/          # Express route definitions mounted at /api/v1
│   │   ├── schemas/         # Zod validation schemas
│   │   ├── services/        # Business logic & parameterized SQL queries
│   │   └── app.ts           # Express server setup & security middlewares
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── app/             # Next.js App Router (pages & metadata layouts)
│   │   │   ├── check-in/    # Door check-in terminal ([registrationId])
│   │   │   ├── complaints/  # Anonymous complaint box & detail threads
│   │   │   ├── event-dashboard/ # Club admin event creation & attendee roster
│   │   │   ├── events/      # Public event feed & registration flow
│   │   │   ├── helpdesk/    # Smart helpdesk knowledge base & policy guides
│   │   │   ├── helpdesk-dashboard/ # Helpdesk admin CMS
│   │   │   ├── lost-found/  # Lost & Found catalog & reporting
│   │   │   ├── my-events/   # Registered events & QR entrance passes
│   │   │   ├── my-resources/# Uploader's personal academic resource manager
│   │   │   ├── resources/   # Academic vault search & document downloads
│   │   │   └── page.tsx     # City University landing page
│   │   ├── components/      # UI components (Header, Footer, Modals, Cards, Filters)
│   │   ├── context/         # AuthContext (session state & login lifecycle)
│   │   └── lib/             # API client, constants, formatters
│   └── package.json
├── DEPLOYMENT.md            # Production deployment guide (Vercel, Render, Neon)
├── render.yaml              # Render blueprint deployment specification
└── README.md                # Project documentation
```

---

## 9. Local Development Setup

### Prerequisites
* Node.js v20+, npm v10+, and a PostgreSQL database (Neon recommended).

### 1. Clone & Setup Backend
```bash
git clone https://github.com/your-username/Hackathon2-Sushi.git
cd Hackathon2-Sushi/backend
cp .env.example .env
```
Configure `backend/.env`:
```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
DATABASE_URL=postgresql://user:pass@ep-sample.us-east-2.aws.neon.tech/neondb?sslmode=require
COOKIE_NAME=session_token
COOKIE_SECRET=replace_with_a_secure_secret_key
SESSION_MAX_AGE_DAYS=7
```
Run migrations, seed data, and start backend:
```bash
npm install
npm run migrate
npm run seed
npm run dev
# Backend runs at http://localhost:5000 (API at http://localhost:5000/api/v1)
```

### 2. Setup Frontend
```bash
cd ../frontend
cp .env.example .env.local
```
Ensure `frontend/.env.local` contains:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
```
Install and run frontend:
```bash
npm install
npm run dev
# Frontend runs at http://localhost:3000
```

---

## 10. Demo & Test Accounts

The database includes pre-seeded accounts covering every role (all use password: `password123`):

| Role | Name | Email | Password | Scope |
|---|---|---|---|---|
| **Student** | Sizan Molla | `sizan@cityuniversity.edu` | `password123` | ID: `0272410005101127`, CSE Batch 64 |
| **Student** | Nusrat Jahan | `nusrat@cityuniversity.edu` | `password123` | ID: `0272410005101999`, CSE Batch 65 |
| **Club Admin** | CP Camp Admin | `admin@cpcamp.edu` | `password123` | CP Camp City University (CPCCU) |
| **Club Admin** | Tanvir Ahmed | `admin@computerclub.edu` | `password123` | Computer Club City University (CUCC) |
| **Helpdesk Admin** | Rafiqul Islam | `support@cityuniversity.edu` | `password123` | Helpdesk & Complaints |
| **Helpdesk Admin** | Helpdesk Desk | `helpdesk@cityuniversity.edu` | `password123` | Helpdesk & Complaints |

---

## 11. Recommended Demo Sequence for Judges

1. **Landing Page (`/`):** Discover City University branding, announcements, and quick access hubs.
2. **Student Login (`/login`):** Log in as `sizan@cityuniversity.edu` (`password123`).
3. **Event Hub (`/events`):** Explore event filters, inspect *Hackathon*, and complete your registration.
4. **My Events & QR Pass (`/my-events`):** Open the digital QR entrance pass (`/check-in/[id]`).
5. **Club Admin Check-in (`/event-dashboard`):** Log in as `admin@cpcamp.edu` and verify participant check-ins. You can use another device to scan the qr for better experience. 
6. **Resource Hub (`/resources`):** Search *CSE 211*, cast an upvote, and inspect the upload modal.
7. **Smart Helpdesk (`/helpdesk`):** Review the Library, bus routes, and the 5-step admission guide. Log in as `support@cityuniversity.edu` to post on a topic if you want.
8. **Lost & Found (`/lost-found`):** Browse misplaced items and inspect photo galleries and verified contacts. Create a lost/found post to experience the flow.
9. **Anonymous Complaint Box (`/complaints`):** Submit a grievance with complete privacy (zero user ID stored).
10. **Helpdesk Admin Response:** Log in as `support@cityuniversity.edu` to post an immutable official response.

---

## License & Attribution

Developed by the **Sushi Team** for the **CPCCU AI-Powered Web App Development & Deployment Hackathon 2026** at **City University, Bangladesh**.