# Quick Start Reference

## Test Credentials

Use these to test your login after running the seed script:

```
┌─────────────────────────────────────┐
│ TEST ACCOUNT 1                      │
├─────────────────────────────────────┤
│ Enrollment: EN2024001               │
│ Password:   password123             │
│ Name:       Harshul Sharma          │
│ Email:      student1@college.edu    │
│ Dept:       Computer Science        │
│ CGPA:       8.5                     │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ TEST ACCOUNT 2                      │
├─────────────────────────────────────┤
│ Enrollment: EN2024002               │
│ Password:   password123             │
│ Name:       Priya Singh             │
│ Email:      student2@college.edu    │
│ Dept:       Electronics             │
│ CGPA:       8.2                     │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ TEST ACCOUNT 3                      │
├─────────────────────────────────────┤
│ Enrollment: EN2024003               │
│ Password:   password123             │
│ Name:       Rajesh Kumar            │
│ Email:      student3@college.edu    │
│ Dept:       Mechanical              │
│ CGPA:       7.8                     │
└─────────────────────────────────────┘
```

## Setup Steps

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Set MongoDB URI** (in Vercel Project Settings → Environment Variables)
   ```
   MONGODB_URI=your_mongodb_connection_string
   ```

3. **Seed Database**
   First, add this to package.json scripts:
   ```json
   "seed": "node scripts/seed.mjs"
   ```
   
   Then run:
   ```bash
   npm run seed
   ```

4. **Start Dev Server**
   ```bash
   npm run dev
   ```

5. **Test Login**
   - Go to http://localhost:3000/login
   - Use any of the test credentials above

## Files Changed

| File | Change | Type |
|------|--------|------|
| `package.json` | Added bcryptjs, mongodb deps | Modified |
| `app/api/auth/route.ts` | Real MongoDB auth | Modified |
| `components/login-form.tsx` | API call instead of mock | Modified |
| `lib/mongodb.ts` | NEW: Connection utility | New |
| `lib/db-models.ts` | NEW: Student schema & queries | New |
| `scripts/seed.mjs` | NEW: Seed test data | New |

## How It Works

```
Login Form
    ↓
  [Submit]
    ↓
  POST /api/auth
    ↓
  Find Student in MongoDB
    ↓
  Verify Password (bcrypt)
    ↓
  Return Token + Student Data
    ↓
  Store in localStorage
    ↓
  Redirect to Dashboard
```

## Password Security

- Passwords are **hashed** using bcryptjs (10 rounds)
- Stored hashes **cannot** be reversed
- Each login uses **constant-time comparison**
- No plaintext passwords in database
- Password stored as: `$2b$10$...` (bcrypt format)

## Need to Add New Students?

Use the `createStudent` function in your admin panel:

```typescript
import { createStudent } from "@/lib/db-models";
import { getDatabase } from "@/lib/mongodb";

const db = await getDatabase();
await createStudent(db, {
  enrollmentNo: "EN2024004",
  email: "student4@college.edu",
  firstName: "New",
  lastName: "Student",
  password: "securePassword123",
  phone: "+91-1234567890",
  department: "IT",
  semester: 1,
  cgpa: 0,
});
```

## What's Next?

- Create admin panel for user management
- Add password change functionality
- Implement password reset via email
- Add JWT tokens (better than base64)
- Add rate limiting on login
- Add email verification
