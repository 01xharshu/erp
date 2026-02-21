# MongoDB Authentication Setup Guide

## Overview
Your College ERP Portal now uses MongoDB for real authentication instead of hardcoded demo credentials. Passwords are securely hashed using bcryptjs before storage.

## What Changed

### 1. **Dependencies Added**
- `mongodb@^6.3.0` - MongoDB driver for Node.js
- `bcryptjs@^2.4.3` - Password hashing library

### 2. **New Files Created**

#### `/lib/mongodb.ts`
- MongoDB connection utility with connection pooling
- Exports `connectToDatabase()` and `getDatabase()` functions
- Automatically uses cached connection for performance

#### `/lib/db-models.ts`
- Student schema/model with TypeScript interfaces
- Password hashing: `hashPassword(password)` - creates bcrypt hash
- Password verification: `verifyPassword(password, hash)` - compares password with hash
- Database operations:
  - `createStudent()` - Creates new student with hashed password
  - `findStudentByEnrollment()` - Finds student by enrollment number
  - `findStudentByEmail()` - Finds student by email
  - `updateStudentPassword()` - Updates password (auto-hashed)

#### `/scripts/seed.mjs`
- Seed script to populate MongoDB with test data
- Creates 3 test students with hashed passwords
- Run with: `npm run seed` (after adding to package.json scripts)

### 3. **Updated Files**

#### `/app/api/auth/route.ts`
- **OLD**: Hardcoded credentials (EN2024001 / password123)
- **NEW**: Validates against MongoDB with password hashing
- Returns student data on successful login

#### `/components/login-form.tsx`
- **OLD**: Used mock `login()` function from mockData
- **NEW**: Makes actual API call to `/api/auth`
- Stores authentication token and student data in localStorage
- Removed demo hints from UI

## Database Schema

### Students Collection

```javascript
{
  _id: ObjectId,
  enrollmentNo: String,      // e.g., "EN2024001"
  email: String,             // e.g., "student1@college.edu"
  firstName: String,         // e.g., "Harshul"
  lastName: String,          // e.g., "Sharma"
  password: String,          // bcrypt hashed password
  phone: String,             // "+91-9876543210"
  department: String,        // "Computer Science"
  semester: Number,          // 4
  cgpa: Number,              // 8.5
  createdAt: Date,           // ISO Date
  updatedAt: Date            // ISO Date
}
```

## Setup Instructions

### Step 1: Set MongoDB URI
Make sure your `MONGODB_URI` environment variable is set in Vercel project settings:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority
```

### Step 2: Install Dependencies
Dependencies are automatically installed after `package.json` is updated.

### Step 3: Add Seed Script to package.json
Add this to your package.json scripts section:
```json
"scripts": {
  "seed": "node scripts/seed.mjs"
}
```

### Step 4: Seed Database
Run the seed script to create test students:
```bash
npm run seed
```

This will create 3 test students with the following credentials:

#### Student 1
- **Enrollment No**: EN2024001
- **Email**: student1@college.edu
- **Password**: password123
- **Name**: Harshul Sharma
- **Department**: Computer Science
- **Semester**: 4
- **CGPA**: 8.5

#### Student 2
- **Enrollment No**: EN2024002
- **Email**: student2@college.edu
- **Password**: password123
- **Name**: Priya Singh
- **Department**: Electronics
- **Semester**: 3
- **CGPA**: 8.2

#### Student 3
- **Enrollment No**: EN2024003
- **Email**: student3@college.edu
- **Password**: password123
- **Name**: Rajesh Kumar
- **Department**: Mechanical
- **Semester**: 2
- **CGPA**: 7.8

## Testing the Login

1. Start your development server: `npm run dev`
2. Navigate to the login page
3. Use any of the test credentials above
4. Example:
   - Enrollment: `EN2024001`
   - Password: `password123`

## Security Features

✅ **Passwords are hashed** using bcryptjs with 10-salt rounds
✅ **No plaintext passwords** stored in database
✅ **Password verification** uses constant-time comparison (bcrypt)
✅ **MongoDB connection** uses connection pooling for performance
✅ **Error handling** prevents credential enumeration (same error for invalid user or password)

## Future Improvements

Consider implementing:
- ✅ JWT tokens instead of base64 encoding
- ✅ Password reset functionality
- ✅ Email verification for new accounts
- ✅ Rate limiting on login attempts
- ✅ Session management with Redis
- ✅ Two-factor authentication (2FA)
- ✅ OAuth integration (Google, GitHub)

## Updating Student Data

To change a student's password:
```typescript
import { updateStudentPassword } from "@/lib/db-models";
import { getDatabase } from "@/lib/mongodb";

const db = await getDatabase();
await updateStudentPassword(db, "EN2024001", "newPassword123");
```

The new password is automatically hashed before storage.
