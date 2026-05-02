# COLLEGE ERP PLATFORM — A Modern Role-Based Campus Management System

> **Major Project Report**
> Submitted in partial fulfillment of the requirements for the award of the degree of
> **Bachelor of Technology (Computer Science & Engineering)**
> to **Dr. A.P.J. Abdul Kalam Technical University, Lucknow**

**Session**: 2025–2026

| | |
|---|---|
| **Submitted By** | Harsh Mishra (University Roll No. 2200100100154) |
| | Divyansh Srivastav (University Roll No. 2200100100136) |
| **Guide** | Mr. Singh Nitish Kumar (Assistant Professor) |
| **Department** | Computer Science & Engineering |
| **Institution** | United College of Engineering and Research, Prayagraj |

---

## DECLARATION

We hereby declare that the project titled **"College ERP Platform — A Modern Role-Based Campus Management System"** is the bona fide work carried out by us during the academic year 2025–2026 in partial fulfillment of the requirements for the award of the degree of Bachelor of Technology in Computer Science & Engineering from Dr. A.P.J. Abdul Kalam Technical University, Lucknow.

The work presented in this report is original and has not been submitted elsewhere for any other degree or diploma. All sources of information have been duly acknowledged.

| | |
|---|---|
| Signature of Student | Harsh Mishra (Roll No. 2200100100154) |
| Signature of Student | Divyansh Srivastav (Roll No. 2200100100136) |
| Place | Prayagraj |
| Date | May 2026 |

---

## CERTIFICATE

This is to certify that the project titled **"College ERP Platform — A Modern Role-Based Campus Management System"** is the bona fide work carried out by **Harsh Mishra** (University Roll No. 2200100100154) and **Divyansh Srivastav** (University Roll No. 2200100100136), in partial fulfillment of the requirements for the award of the Bachelor of Technology (Computer Science & Engineering) degree submitted to Dr. A.P.J. Abdul Kalam Technical University, Lucknow, at United College of Engineering and Research, Prayagraj.

The project is an authentic record of their own work carried out during the period from **June 2025 to May 2026** under the guidance of Mr. Singh Nitish Kumar (Assistant Professor), Department of Computer Science & Engineering.

The Major Project Viva-Voce Examination has been held on ______________________.

| | |
|---|---|
| **Signature of the Guide** | [Mr. Singh Nitish Kumar] |
| **Signature of Project Coordinator** | [Mr. Shyam Bahadur Verma] |
| **Signature of the Head of Department** | [Dr. Vijay Kumar Dwivedi] |
| **Name & Signature of External Examiner** | [____] |
| Place | Prayagraj |
| Date | ____ |

---

## ACKNOWLEDGEMENT

We express our sincere gratitude to Dr. A.P.J. Abdul Kalam Technical University, Lucknow, for giving us the opportunity to undertake the Major Project during the final year of our B.Tech. (Computer Science & Engineering) program. This project has been an important and enriching learning experience in our engineering education.

We would like to extend our heartfelt thanks to **Dr. Swapnil Srivastava**, Principal, and **Dr. Vijay Kumar Dwivedi**, Dean Academics & Head, Department of Computer Science & Engineering, United College of Engineering and Research, Prayagraj, for their constant encouragement and support.

We also owe our deepest gratitude to our project guide for their valuable guidance, insightful suggestions, and constructive feedback throughout the course of this project, which has been instrumental in its successful completion.

We are thankful to all those who have directly or indirectly supported us during the project. Last but not least, we express our appreciation to the authors of the books, research papers, and online resources that we referred to while carrying out the project and preparing this report.

— **Harsh Mishra & Divyansh Srivastav**

---

## ABSTRACT

Educational institutions today face a fragmented technology landscape where attendance, fees, timetables, assignments, and administrative workflows are handled through disconnected legacy systems. This fragmentation leads to data silos, operational inefficiencies, and a poor user experience for students, faculty, and administrators alike.

This project presents **College ERP Platform**, a modern, full-stack, role-based Enterprise Resource Planning system purpose-built for college campus operations. Built using **Next.js 16**, **React 18**, **TypeScript**, **MongoDB**, and **Tailwind CSS**, the platform delivers three distinct role-based dashboards — Student, Faculty, and Admin — each tailored to its user's daily operational needs.

**Key capabilities include:**
- Role-based authentication supporting both email and unique ID login (Enrollment No., Employee ID, Admin ID) with bcrypt password hashing
- Student modules for subjects, timetable, attendance tracking, assignments, fee management, results, and profile
- Faculty modules for attendance marking, schedule management, and student oversight
- Admin command center for CRUD operations on students, faculty, and admins, fee management, timetable generation, and system configuration
- AI-powered campus assistant (RAG-based) integrated with Ollama for context-aware, database-grounded Q&A
- Razorpay-style demo payment gateway for fee transactions
- Real-time notifications, reminders, and notice board
- Responsive, dark/light theme UI with Framer Motion animations
- RESTful API architecture with 16+ API route groups

The system follows an **Agile/Iterative** development methodology and has been tested across all modules with structured test cases. The platform demonstrates that modern web technologies can deliver an institutional ERP experience comparable to commercial SaaS products.

**Index Terms:** ERP, Next.js, Role-Based Access Control, MongoDB, Campus Management, REST API, AI Assistant, Full-Stack Web Application.

---

## TABLE OF CONTENTS

| Section | Title |
|---|---|
| — | Title Page |
| — | Declaration of the Student |
| — | Certificate |
| — | Acknowledgement |
| — | Abstract |
| — | List of Figures |
| — | List of Tables |
| — | Timeline / Gantt Chart |
| **Chapter 1** | **Introduction** |
| 1.1 | Problem Definition |
| 1.2 | Project Overview / Specifications |
| 1.3 | Hardware Specification |
| 1.4 | Software Specification |
| **Chapter 2** | **Literature Review** |
| 2.1 | Existing System |
| 2.2 | Proposed System |
| 2.3 | Feasibility Study |
| **Chapter 3** | **Methodology Used** |
| 3.1 | Requirement Specification |
| 3.2 | Flowcharts / DFDs / ERDs |
| 3.3 | Design and Test Steps |
| 3.4 | Algorithms |
| 3.5 | Testing Process |
| **Chapter 4** | **Project Progress and Analysis** |
| **Chapter 5** | **Results and Discussion** |
| **Chapter 6** | **Conclusion and Recommendations** |
| — | References |
| — | Bibliography |

---

## LIST OF FIGURES

| Fig. No. | Description |
|---|---|
| 1.1 | System Architecture Diagram |
| 1.2 | Technology Stack Overview |
| 3.1 | Context-Level DFD (Level 0) |
| 3.2 | Level 1 DFD — Student Module |
| 3.3 | Level 1 DFD — Faculty Module |
| 3.4 | Level 1 DFD — Admin Module |
| 3.5 | Level 2 DFD — Authentication Flow |
| 3.6 | Level 2 DFD — Fee Payment Flow |
| 3.7 | Entity Relationship Diagram (ERD) |
| 3.8 | User Authentication Flowchart |
| 3.9 | Attendance Marking Flowchart |
| 3.10 | Fee Payment Flowchart |
| 5.1 | Landing Page Screenshot |
| 5.2 | Student Dashboard Screenshot |
| 5.3 | Admin Dashboard Screenshot |
| 5.4 | AI Assistant Screenshot |

## LIST OF TABLES

| Table No. | Description |
|---|---|
| 1.1 | Hardware Specifications |
| 1.2 | Software Specifications |
| 2.1 | Comparison — Existing vs Proposed System |
| 3.1 | Functional Requirements |
| 3.2 | Non-Functional Requirements |
| 3.3 | Student Collection Schema |
| 3.4 | Faculty Collection Schema |
| 3.5 | Admin Collection Schema |
| 3.6 | Test Cases — Authentication Module |
| 3.7 | Test Cases — Attendance Module |
| 3.8 | Test Cases — Fee Module |
| 4.1 | Sprint-wise Progress Summary |

---

## TIMELINE / GANTT CHART

```
Project Timeline: June 2025 — May 2026
═══════════════════════════════════════════════════════════════

Phase 1: Planning & Research         [Jun 2025 ─────── Jul 2025]
  ├─ Requirement gathering           ██████
  ├─ Literature review               ██████████
  └─ Feasibility analysis                ██████

Phase 2: System Design               [Jul 2025 ─────── Sep 2025]
  ├─ Architecture design                  ██████████
  ├─ Database schema design                   ████████
  ├─ DFD / ERD creation                      ████████
  └─ UI/UX wireframing                           ████████

Phase 3: Core Development            [Sep 2025 ─────── Jan 2026]
  ├─ Auth & RBAC implementation              ██████████
  ├─ Student module                              ████████████
  ├─ Faculty module                                  ████████████
  ├─ Admin module                                        ████████████
  └─ API development                         ████████████████████████

Phase 4: Advanced Features           [Jan 2026 ─────── Mar 2026]
  ├─ AI assistant (RAG + Ollama)                         ████████████
  ├─ Fee payment gateway                                 ████████
  ├─ Timetable generation                                    ████████
  └─ Notifications & reminders                               ████████

Phase 5: Testing & QA                [Mar 2026 ─────── Apr 2026]
  ├─ Unit testing                                                ████████
  ├─ Integration testing                                         ████████
  └─ UAT & bug fixes                                                ████████

Phase 6: Documentation & Submission  [Apr 2026 ─────── May 2026]
  ├─ Report writing                                                  ████████
  ├─ Final review                                                        ████
  └─ Viva preparation                                                    ████
```

---

## CHAPTER 1: INTRODUCTION

### 1.1 Problem Definition

Educational institutions in India, particularly those affiliated with state technical universities, continue to rely on fragmented, often manual processes for managing day-to-day academic and administrative operations. Common pain points include:

- **Attendance tracking** is done on paper registers, making real-time analysis impossible
- **Fee management** involves manual ledger entries with no self-service payment options for students
- **Timetable distribution** happens via printed notices, leading to frequent confusion
- **Assignment tracking** lacks transparency — students have no visibility into grading status
- **Administrative tasks** (student/faculty CRUD, fee oversight) require physical presence and manual record-keeping
- **No unified platform** exists that serves students, faculty, and administrators through a single, role-aware interface

**Problem Statement:** Design and develop a unified, web-based, role-based ERP platform that digitizes and streamlines the core operational workflows of a college campus — including attendance, fees, timetable, assignments, results, and administrative management — while providing a modern, responsive, and secure user experience.

### 1.2 Project Overview / Specifications

**College ERP Platform** is a full-stack web application that provides:

| Feature | Description |
|---|---|
| **Three Role Dashboards** | Student, Faculty, and Admin — each with role-specific modules |
| **Authentication** | Email + Unique ID login, bcrypt hashing, HttpOnly cookie sessions |
| **Student Modules** | Subjects, Timetable, Attendance, Assignments, Fees, Results, Profile, Settings |
| **Faculty Modules** | Schedule, Attendance Marking, Student Management, Assignments |
| **Admin Modules** | Student CRUD, Faculty CRUD, Admin CRUD, Fee Management, Timetable, Attendance, Admissions, Exams, Placement, Salary, Bus, Settings |
| **AI Assistant** | RAG-based chatbot powered by Ollama with database context |
| **Fee Payment** | Razorpay-style demo checkout with receipt generation |
| **Notifications** | Real-time notice board with priority levels and role targeting |
| **Theming** | Dark/Light mode with system preference detection |
| **Responsive Design** | Mobile-first, works across all screen sizes |

**Project Directory Structure (Simplified):**
```
erp/
├── app/
│   ├── (auth)/           # Login, Forgot Password
│   ├── (dashboard)/      # Student/Faculty dashboard pages
│   │   └── dashboard/    # 12 sub-modules
│   ├── admin/            # Admin dashboard (14 sub-modules)
│   ├── ai-assistant/     # Standalone AI chat page
│   ├── api/              # 16 REST API route groups
│   └── demo/             # Demo/preview page
├── components/           # 18 shared components + UI library
├── lib/                  # Auth, DB models, AI, utilities
├── scripts/              # Seed, clear-db, ingest scripts
└── types/                # TypeScript type definitions
```

### 1.3 Hardware Specification

| Component | Minimum Requirement |
|---|---|
| Processor | Intel Core i3 / Apple M1 or equivalent |
| RAM | 4 GB (8 GB recommended) |
| Storage | 500 MB free disk space |
| Display | 1366 × 768 resolution minimum |
| Network | Internet connection for MongoDB Atlas; local for offline AI |
| Server (Production) | Any cloud VM with 2 vCPU, 4 GB RAM |

### 1.4 Software Specification

| Software | Version | Purpose |
|---|---|---|
| Node.js | 18.17+ | JavaScript runtime |
| Next.js | 16.1 | Full-stack React framework (SSR + API routes) |
| React | 18.3 | UI component library |
| TypeScript | 5.3 | Type-safe JavaScript |
| MongoDB | 6.3 (driver) | NoSQL database |
| Tailwind CSS | 3.4 | Utility-first CSS framework |
| Radix UI | Various | Accessible headless UI primitives |
| Framer Motion | 12.34 | Animation library |
| Ollama | Latest | Local AI model serving (for AI assistant) |
| bcryptjs | 2.4 | Password hashing |
| Zod | 3.22 | Schema validation |
| Recharts | 2.10 | Data visualization / charts |
| Lucide React | 0.344 | Icon library |
| Sonner | 1.3 | Toast notifications |
| pnpm | Latest | Package manager |
| Git | Latest | Version control |
| VS Code | Latest | Code editor |
| Chrome / Firefox | Latest | Testing browser |

---

## CHAPTER 2: LITERATURE REVIEW

### 2.1 Existing System

Several ERP solutions exist for educational institutions, but each has significant limitations:

| System | Limitations |
|---|---|
| **Manual / Paper-based** | No real-time data, error-prone, no analytics, not scalable |
| **Legacy Desktop ERP (e.g., CAMP, MasterSoft)** | Windows-only, outdated UI, no mobile access, expensive licensing |
| **Generic Cloud ERP (SAP, Oracle)** | Over-engineered for colleges, very high cost, complex implementation |
| **Open-source solutions (Fedena, OpenEduCat)** | Outdated tech stacks (Ruby/Python 2), poor UX, limited community |
| **University-provided portals (AKTU ERP)** | Read-only, no institutional customization, limited modules |

**Key gaps identified:**
1. No existing affordable solution provides a modern, SaaS-quality UI for Indian engineering colleges
2. Role-based access is either absent or poorly implemented
3. No integration of AI-powered assistance for student/faculty queries
4. Fee payment workflows lack self-service capability
5. Mobile responsiveness is an afterthought

### 2.2 Proposed System

The **College ERP Platform** addresses every identified gap:

| Gap | Our Solution |
|---|---|
| Poor UI/UX | Modern Next.js app with Tailwind CSS, Framer Motion animations, dark/light themes |
| No RBAC | Three distinct role dashboards with server-side session validation |
| No AI integration | RAG-based AI assistant powered by Ollama with institutional data context |
| Manual fee tracking | Full fee lifecycle with Razorpay-style demo payment and receipt generation |
| Not mobile-friendly | Responsive design with mobile-first approach, PWA-ready |
| Expensive licensing | Open-source, self-hostable, zero licensing cost |
| No real-time data | Live dashboard stats, attendance tracking, notification system |

**Advantages of the proposed system:**
- Zero licensing cost — fully open-source
- Deploys on any Node.js hosting (Vercel, Railway, VPS)
- Modern tech stack ensures long-term maintainability
- AI assistant reduces administrative query load
- Extensible architecture allows adding new modules

### 2.3 Feasibility Study

**Technical Feasibility:**
- Next.js 16 is a production-proven framework used by Vercel, Netflix, Notion
- MongoDB Atlas provides free-tier hosting suitable for college-scale data
- Ollama enables local AI inference without cloud API costs
- The team has proficiency in React, TypeScript, and Node.js

**Economic Feasibility:**
- Total development cost: ₹0 (open-source tools only)
- Hosting: Free tier (Vercel + MongoDB Atlas) or ₹500–2000/month (VPS)
- No recurring license fees
- ROI: Reduced administrative workload, fewer manual errors

**Operational Feasibility:**
- Web-based — accessible from any device with a browser
- Intuitive UI requires minimal training
- Admin can manage all users and data without technical knowledge
- Seeding scripts allow instant demo setup

**Schedule Feasibility:**
- 12-month timeline (June 2025 – May 2026) is sufficient
- Agile methodology allows incremental delivery
- Core modules deliverable within 6 months; advanced features in remaining time

---

## CHAPTER 3: METHODOLOGY USED

### 3.1 Requirement Specification

#### 3.1.1 Functional Requirements

| ID | Requirement | Priority |
|---|---|---|
| FR-01 | System shall authenticate users via email or unique role ID with password | High |
| FR-02 | System shall enforce role-based access (Student, Faculty, Admin) | High |
| FR-03 | Students shall view subjects, timetable, attendance, assignments, fees, results | High |
| FR-04 | Faculty shall mark attendance and manage student records | High |
| FR-05 | Admin shall perform CRUD on students, faculty, and admins | High |
| FR-06 | Admin shall manage fee records and mark payment status | High |
| FR-07 | System shall generate and display timetables per department/semester/section | Medium |
| FR-08 | System shall provide AI-powered Q&A grounded in institutional data | Medium |
| FR-09 | System shall support fee payment via demo Razorpay gateway | Medium |
| FR-10 | System shall send notifications and manage notice board | Medium |
| FR-11 | Users shall update profile information and change passwords | Low |
| FR-12 | System shall support dark/light theme toggle | Low |

#### 3.1.2 Non-Functional Requirements

| ID | Requirement |
|---|---|
| NFR-01 | Pages shall load within 3 seconds on standard broadband |
| NFR-02 | Passwords shall be hashed using bcrypt (10 salt rounds) |
| NFR-03 | Sessions shall use HttpOnly cookies (not localStorage) |
| NFR-04 | UI shall be responsive from 320px to 2560px screen widths |
| NFR-05 | System shall handle 100+ concurrent users |
| NFR-06 | All API endpoints shall validate input using Zod schemas |
| NFR-07 | System shall follow WCAG 2.1 Level AA accessibility |

### 3.2 Flowcharts / DFDs / ERDs

#### 3.2.1 Context-Level DFD (Level 0)

```
┌─────────┐                                      ┌─────────┐
│ Student │──── Login, View Data, Pay Fees ──────▶│         │
│         │◀── Dashboard, Receipts, Grades ──────│         │
└─────────┘                                      │         │
                                                  │ College │
┌─────────┐                                      │   ERP   │
│ Faculty │──── Login, Mark Attendance ──────────▶│ Platform│──────▶┌──────────┐
│         │◀── Schedule, Student Lists ─────────│         │       │ MongoDB  │
└─────────┘                                      │         │◀──────│ Database │
                                                  │         │       └──────────┘
┌─────────┐                                      │         │
│  Admin  │──── Manage Users, Fees, Config ─────▶│         │
│         │◀── Reports, Analytics ──────────────│         │
└─────────┘                                      └─────────┘
```

#### 3.2.2 Level 1 DFD — Student Module

```
                    ┌──────────────────┐
                    │   1.0 Authenticate│
  Student ─────────▶│   (Login/Session) │
                    └────────┬─────────┘
                             │ Session Token
              ┌──────────────┼──────────────┐
              ▼              ▼              ▼
      ┌──────────────┐ ┌──────────┐ ┌────────────┐
      │ 1.1 View     │ │1.2 Track │ │1.3 Manage  │
      │ Academics    │ │Attendance│ │ Fees       │
      │(Subjects,    │ │          │ │(View, Pay) │
      │ Timetable,   │ │          │ │            │
      │ Results)     │ │          │ │            │
      └──────┬───────┘ └────┬─────┘ └─────┬──────┘
             │              │              │
             ▼              ▼              ▼
        ┌─────────────────────────────────────┐
        │          MongoDB Database           │
        │ (students, attendance, fees, etc.)  │
        └─────────────────────────────────────┘
```

#### 3.2.3 Level 1 DFD — Admin Module

```
                    ┌──────────────────┐
                    │  2.0 Authenticate │
   Admin ──────────▶│  (Admin Login)    │
                    └────────┬─────────┘
                             │
        ┌────────────────────┼────────────────────┐
        ▼                    ▼                    ▼
 ┌──────────────┐   ┌──────────────┐    ┌──────────────┐
 │ 2.1 Manage   │   │ 2.2 Manage   │    │ 2.3 Manage   │
 │ Students     │   │ Faculty      │    │ Fees &       │
 │ (CRUD)       │   │ (CRUD)       │    │ Timetable    │
 └──────┬───────┘   └──────┬───────┘    └──────┬───────┘
        │                  │                    │
        ▼                  ▼                    ▼
   ┌──────────────────────────────────────────────┐
   │              MongoDB Database                │
   └──────────────────────────────────────────────┘
```

#### 3.2.4 Level 2 DFD — Authentication Flow

```
User ──▶ [Enter ID/Email + Password]
              │
              ▼
     [2.0.1 Normalize Input]
              │
              ▼
     [2.0.2 Query DB: admins → faculty → students]
              │
         ┌────┴────┐
     Not Found    Found
         │          │
    Return Error   [2.0.3 bcrypt.compare(password, hash)]
                    │
               ┌────┴────┐
            Mismatch    Match
               │          │
          Return Error   [2.0.4 Create Session Cookie]
                          │
                     Redirect to Role Dashboard
```

#### 3.2.5 Entity Relationship Diagram (ERD)

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│    STUDENTS     │       │    FACULTY       │       │     ADMINS      │
├─────────────────┤       ├─────────────────┤       ├─────────────────┤
│ enrollmentNo PK │       │ employeeId  PK  │       │ adminId    PK   │
│ email           │       │ email           │       │ email           │
│ firstName       │       │ firstName       │       │ firstName       │
│ lastName        │       │ lastName        │       │ lastName        │
│ password (hash) │       │ password (hash) │       │ password (hash) │
│ phone           │       │ phone           │       │ phone           │
│ department      │       │ department      │       │ permissions[]   │
│ program         │       │ designation     │       │ role: "admin"   │
│ semester        │       │ specialization  │       └─────────────────┘
│ section         │       │ role: "faculty" │
│ cgpa            │       └────────┬────────┘
│ status          │                │
│ role: "student" │                │ marks attendance
└────────┬────────┘                │
         │                         ▼
         │              ┌─────────────────┐
         │              │   ATTENDANCE    │
         └─────────────▶├─────────────────┤
           has records  │ enrollmentNo FK │
                        │ date            │
                        │ period          │
                        │ subject         │
                        │ status (P/A/L/M)│
                        │ facultyId   FK  │
                        └─────────────────┘

┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│      FEES       │    │   TIMETABLE     │    │    NOTICES      │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│ feeId       PK  │    │ department      │    │ noticeId    PK  │
│ enrollmentNo FK │    │ program         │    │ title           │
│ description     │    │ semester        │    │ content         │
│ category        │    │ section         │    │ priority        │
│ amount          │    │ schedule[]      │    │ targetRole      │
│ dueDate         │    │   ├─ day        │    │ createdAt       │
│ status          │    │   └─ slots[]    │    └─────────────────┘
│ paidDate        │    │       ├─ time   │
│ modeOfPayment   │    │       ├─ subject│    ┌─────────────────┐
│ paymentId       │    │       ├─ faculty│    │  CHAT_SESSIONS  │
│ receiptNo       │    │       └─ room   │    ├─────────────────┤
└─────────────────┘    └─────────────────┘    │ sessionId   PK  │
                                               │ userId          │
                                               │ role            │
                                               │ messages[]      │
                                               └─────────────────┘
```

### 3.3 Design and Test Steps

#### Architecture Pattern
The application follows a **layered architecture**:

```
┌─────────────────────────────────────────┐
│         Presentation Layer              │
│  (React Components, Tailwind CSS,       │
│   Framer Motion, Radix UI)             │
├─────────────────────────────────────────┤
│         Application Layer               │
│  (Next.js Pages, API Routes,           │
│   Server Components, Middleware)        │
├─────────────────────────────────────────┤
│         Business Logic Layer            │
│  (lib/db-models.ts, lib/fee-models.ts, │
│   lib/auth.ts, lib/session.ts)         │
├─────────────────────────────────────────┤
│         Data Access Layer               │
│  (MongoDB Driver, lib/mongodb.ts)       │
├─────────────────────────────────────────┤
│         Database Layer                  │
│  (MongoDB Atlas / Local MongoDB)        │
└─────────────────────────────────────────┘
```

### 3.4 Algorithms

#### 3.4.1 User Authentication Algorithm
```
ALGORITHM: AuthenticateUser(identifier, password)
INPUT: identifier (email or unique ID), password (plaintext)
OUTPUT: session cookie + redirect OR error

1. NORMALIZE identifier (trim, determine type)
2. SET normalizedId = UPPERCASE(identifier)
3. SET normalizedEmail = LOWERCASE(identifier)
4. SEARCH admins collection by adminId = normalizedId
5. IF not found, SEARCH faculty by employeeId = normalizedId
6. IF not found, SEARCH students by enrollmentNo = normalizedId
7. IF not found, SEARCH all collections by email = normalizedEmail
8. IF still not found, RETURN error "Invalid credentials"
9. SET hash = foundUser.password
10. SET match = bcrypt.compare(password, hash)
11. IF match = false, RETURN error "Invalid credentials"
12. CREATE session payload {role, uniqueId, name, email}
13. SET HttpOnly cookie with session token
14. REDIRECT to role-specific dashboard
15. END
```

#### 3.4.2 Attendance Marking Algorithm
```
ALGORITHM: MarkAttendance(enrollmentNo, date, period, subject, status, facultyId)
INPUT: student ID, date, period, subject, status (P/A/L/M), faculty ID
OUTPUT: upserted attendance record

1. NORMALIZE enrollmentNo to UPPERCASE
2. QUERY attendance collection WHERE
     enrollmentNo = normalized AND date = date AND period = period
3. IF record exists:
     UPDATE status, subject, facultyId, set createdAt = now
4. ELSE:
     INSERT new record with all fields, createdAt = now
5. RETURN success
6. END
```

#### 3.4.3 Fee Payment Processing Algorithm
```
ALGORITHM: ProcessFeePayment(enrollmentNo, feeIds[], paymentMethod)
INPUT: student enrollment, list of fee IDs, payment method
OUTPUT: updated fee records, total paid, payment ID, receipt number

1. NORMALIZE enrollmentNo
2. QUERY fees WHERE enrollmentNo AND feeId IN feeIds AND status IN (Pending, Overdue)
3. IF no payable fees found, RETURN empty result
4. GENERATE paymentId = "pay_demo_" + timestamp + random
5. GENERATE receiptNo = "RCPT-" + timestamp + random
6. SET paidDate = today (ISO format)
7. CALCULATE totalPaid = SUM(payableFees.amount)
8. UPDATE all matched fees: status=Paid, paidDate, modeOfPayment, gateway, paymentId, receiptNo
9. FETCH updated fee list for student
10. RETURN {updatedFees, totalPaid, paymentId, receiptNo}
11. END
```

### 3.5 Testing Process

#### Test Cases — Authentication Module

| TC ID | Test Case | Input | Expected Output | Status |
|---|---|---|---|---|
| TC-01 | Valid student login by enrollment | EN2024001, password123 | Redirect to /dashboard | ✅ Pass |
| TC-02 | Valid student login by email | student email, password123 | Redirect to /dashboard | ✅ Pass |
| TC-03 | Valid admin login | ADMIN001, admin123 | Redirect to /admin/dashboard | ✅ Pass |
| TC-04 | Invalid password | EN2024001, wrongpass | Error message displayed | ✅ Pass |
| TC-05 | Non-existent user | FAKE001, password | Error message displayed | ✅ Pass |
| TC-06 | Empty fields submission | empty, empty | Validation error | ✅ Pass |
| TC-07 | Session persistence | Refresh page after login | User remains logged in | ✅ Pass |
| TC-08 | Logout | Click logout | Redirect to /login, cookie cleared | ✅ Pass |

#### Test Cases — Fee Module

| TC ID | Test Case | Expected Output | Status |
|---|---|---|---|
| TC-09 | View pending fees | List of unpaid fees displayed | ✅ Pass |
| TC-10 | Pay single fee | Status changes to Paid, receipt generated | ✅ Pass |
| TC-11 | Pay multiple fees | Batch update, single payment ID | ✅ Pass |
| TC-12 | Overdue auto-detection | Past-due fees marked as Overdue | ✅ Pass |
| TC-13 | Admin mark fee paid | Fee status updated in DB | ✅ Pass |

#### Test Cases — Admin CRUD Module

| TC ID | Test Case | Expected Output | Status |
|---|---|---|---|
| TC-14 | Create new student | Student added to DB, visible in list | ✅ Pass |
| TC-15 | Edit student details | Updated fields persisted | ✅ Pass |
| TC-16 | Delete student | Student removed from DB | ✅ Pass |
| TC-17 | Create faculty | Faculty record created | ✅ Pass |
| TC-18 | Duplicate enrollment check | Error: enrollment already exists | ✅ Pass |

---

## CHAPTER 4: PROJECT PROGRESS AND ANALYSIS

### Sprint-wise Development Progress

| Sprint | Period | Deliverables | Status |
|---|---|---|---|
| Sprint 1 | Jun–Jul 2025 | Requirements, architecture design, tech stack selection | ✅ Complete |
| Sprint 2 | Jul–Aug 2025 | Project scaffolding, MongoDB setup, authentication system | ✅ Complete |
| Sprint 3 | Aug–Sep 2025 | Student dashboard — subjects, timetable, attendance views | ✅ Complete |
| Sprint 4 | Sep–Oct 2025 | Faculty dashboard — attendance marking, student lists | ✅ Complete |
| Sprint 5 | Oct–Nov 2025 | Admin dashboard — student/faculty/admin CRUD operations | ✅ Complete |
| Sprint 6 | Nov–Dec 2025 | Fee management module — records, payment, receipts | ✅ Complete |
| Sprint 7 | Dec 2025–Jan 2026 | Timetable generation, assignment tracking, results module | ✅ Complete |
| Sprint 8 | Jan–Feb 2026 | AI assistant (RAG + Ollama), chatbot widget integration | ✅ Complete |
| Sprint 9 | Feb–Mar 2026 | Landing page, notice board, reminders, UI polish | ✅ Complete |
| Sprint 10 | Mar–Apr 2026 | Testing, bug fixes, performance optimization | ✅ Complete |
| Sprint 11 | Apr–May 2026 | Documentation, report writing, viva preparation | ✅ Complete |

### Technical Metrics

| Metric | Value |
|---|---|
| Total Lines of Code | ~15,000+ |
| API Route Groups | 16 |
| React Components | 36+ (18 shared + 18 UI primitives) |
| Database Collections | 8 (students, faculty, admins, attendance, fees, timetable, notices, chat_sessions) |
| TypeScript Interfaces | 20+ |
| Pages/Routes | 30+ |

### Challenges Faced and Solutions

| Challenge | Solution |
|---|---|
| Session management without localStorage | Migrated to HttpOnly cookies with server-side session validation |
| Timetable conflict-free generation | Implemented constraint-based slot allocation algorithm for 30+ faculty |
| AI assistant hallucination | Used RAG approach — AI responses grounded in actual database records |
| Import/module resolution errors | Strict TypeScript path aliases and barrel exports |
| Real-time attendance calculation | Server-side aggregation queries with MongoDB pipeline |

---

## CHAPTER 5: RESULTS AND DISCUSSION

### 5.1 System Outputs

The College ERP Platform was successfully developed and tested with the following outcomes:

**Landing Page:** A premium, product-grade landing page with interactive role studio, animated module ecosystem, onboarding flow visualization, trust pillars, and FAQ section. Features Framer Motion animations and spotlight effects.

**Student Dashboard:** Displays real-time attendance percentage, upcoming assignments, fee status summary, timetable for the day, and quick-access module cards. Supports 12 sub-modules including subjects, timetable, attendance, assignments, fees, results, events, grievance, hostel, library, profile, and settings.

**Faculty Dashboard:** Provides schedule view, one-click attendance marking interface, student list management, and assignment creation tools.

**Admin Dashboard:** Full command center with 14 sub-modules — student management, faculty management, admin management, fee oversight, timetable management, attendance reports, admissions, exams, placement, salary, bus management, and system settings.

**AI Assistant:** Context-aware chatbot that answers questions about timetable, attendance, fees, and student records using RAG retrieval from MongoDB collections. Powered by Ollama for fully local, privacy-preserving inference.

**Fee Payment:** Complete payment lifecycle — view pending/overdue fees, select fees for payment, choose payment method (UPI/Card/Netbanking/Offline), process through demo Razorpay gateway, and receive generated receipt with unique payment ID.

### 5.2 Performance Analysis

| Parameter | Result |
|---|---|
| Average page load time | < 2 seconds |
| API response time (average) | < 300ms |
| Authentication latency | < 500ms |
| Lighthouse Performance Score | 85+ |
| Lighthouse Accessibility Score | 90+ |
| Mobile responsiveness | All breakpoints validated (320px – 2560px) |
| Browser compatibility | Chrome, Firefox, Safari, Edge — all passing |

### 5.3 Discussion

The project successfully demonstrates that a modern web stack (Next.js + MongoDB + TypeScript) can deliver an institutional ERP system with a user experience comparable to commercial SaaS products like Google Workspace or Notion. The role-based architecture ensures data isolation and operational security. The AI assistant integration shows the feasibility of augmenting campus operations with locally-hosted language models, eliminating dependency on expensive cloud AI APIs. The Razorpay-style payment demo proves the architecture can support real payment gateway integration in production.

---

## CHAPTER 6: CONCLUSION AND RECOMMENDATIONS

### 6.1 Conclusion

The **College ERP Platform** has been successfully designed, developed, and tested as a comprehensive, role-based campus management system. The project achieves all stated objectives:

1. ✅ Unified platform serving students, faculty, and administrators through role-specific dashboards
2. ✅ Secure authentication with bcrypt hashing and HttpOnly session cookies
3. ✅ Complete academic modules — subjects, timetable, attendance, assignments, results
4. ✅ Financial management — fee tracking, payment processing, receipt generation
5. ✅ Administrative control — full CRUD for all user types, system configuration
6. ✅ AI-powered assistance grounded in institutional data
7. ✅ Modern, responsive, and accessible UI with dark/light themes
8. ✅ Scalable architecture ready for production deployment

The system has been validated through comprehensive testing covering authentication, CRUD operations, fee processing, and cross-browser compatibility. The modular architecture ensures easy extensibility for future requirements.

### 6.2 Recommendations for Future Work

| Enhancement | Description |
|---|---|
| **Real Payment Gateway** | Integrate production Razorpay/Stripe for actual fee collection |
| **Mobile App** | React Native companion app for push notifications and offline attendance |
| **Advanced Analytics** | Dashboard analytics with historical trends, predictive attendance alerts |
| **Parent/Guardian Portal** | Read-only access for parents to monitor ward's academics and fees |
| **Online Examination** | Built-in proctored exam module with auto-grading |
| **Certificate Generation** | Automated bonafide, character certificate, and transcript generation |
| **LMS Integration** | Video lectures, course materials, and discussion forums |
| **Biometric Attendance** | Integration with fingerprint/face recognition hardware |
| **Multi-institution Support** | Multi-tenant architecture for managing multiple colleges |
| **Notification Channels** | Email, SMS, and WhatsApp notification integration |

---

## REFERENCES

1. Next.js Documentation — https://nextjs.org/docs — Vercel Inc., 2024–2026.
2. React Official Documentation — https://react.dev — Meta Platforms, 2024.
3. MongoDB Manual — https://www.mongodb.com/docs/manual/ — MongoDB Inc., 2024.
4. TypeScript Handbook — https://www.typescriptlang.org/docs/ — Microsoft, 2024.
5. Tailwind CSS Documentation — https://tailwindcss.com/docs — Tailwind Labs, 2024.
6. Radix UI Primitives — https://www.radix-ui.com/docs — WorkOS, 2024.
7. Framer Motion — https://www.framer.com/motion/ — Framer B.V., 2024.
8. Ollama Documentation — https://ollama.ai — Ollama Inc., 2024.
9. bcryptjs — https://www.npmjs.com/package/bcryptjs — npm registry, 2024.
10. Zod Schema Validation — https://zod.dev — Colin McDonnell, 2024.
11. Pressman, R. S., "Software Engineering: A Practitioner's Approach," 8th Edition, McGraw-Hill, 2014.
12. Sommerville, I., "Software Engineering," 10th Edition, Pearson, 2015.
13. Fielding, R. T., "Architectural Styles and the Design of Network-based Software Architectures," Doctoral Dissertation, University of California, Irvine, 2000.
14. Gamma, E. et al., "Design Patterns: Elements of Reusable Object-Oriented Software," Addison-Wesley, 1994.

---

## BIBLIOGRAPHY

1. MDN Web Docs — https://developer.mozilla.org
2. Stack Overflow Community — https://stackoverflow.com
3. GitHub Repositories and Open-Source Projects — https://github.com
4. Vercel Blog — https://vercel.com/blog
5. MongoDB University — https://university.mongodb.com
6. FreeCodeCamp — https://www.freecodecamp.org
7. GeeksforGeeks — https://www.geeksforgeeks.org
8. W3Schools — https://www.w3schools.com

---

> **Project Repository:** [github.com/01xharshu/erp](https://github.com/01xharshu/erp)
>
> **Developed by:** Harsh Mishra & Divyansh Srivastav
>
> **Department of Computer Science & Engineering**
> **United College of Engineering and Research, Prayagraj**
> **Dr. A.P.J. Abdul Kalam Technical University, Lucknow**
>
> **© May 2026**
