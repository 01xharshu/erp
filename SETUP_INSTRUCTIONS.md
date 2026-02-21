# Step-by-Step: Getting MongoDB Auth Working

## Step 1: Update package.json with seed script

Edit your `package.json` and find the `"scripts"` section. Add the seed command:

```json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "next lint",
  "type-check": "tsc --noEmit",
  "seed": "node scripts/seed.mjs"
}
```

## Step 2: Install dependencies

The new packages (bcryptjs and mongodb) will be automatically installed when v0 detects the package.json change. You can also manually run:

```bash
npm install
```

## Step 3: Verify MongoDB URI

Check that your Vercel project has the `MONGODB_URI` environment variable set:

**In Vercel Dashboard:**
1. Go to your project
2. Settings → Environment Variables
3. Confirm `MONGODB_URI` is set and looks like:
   ```
   mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

If not set, add it now from the Vars section in the v0 sidebar.

## Step 4: Seed your database

Run the seed script to create test students with hashed passwords:

```bash
npm run seed
```

You should see output like:
```
[v0] Starting database seeding...
[v0] Cleared existing students
[v0] Created student: EN2024001
[v0] Created student: EN2024002
[v0] Created student: EN2024003
[v0] Seeding completed successfully!

=== Test Credentials ===
Enrollment No: EN2024001
Password: password123

Enrollment No: EN2024002
Password: password123

Enrollment No: EN2024003
Password: password123
========================
```

## Step 5: Start development server

```bash
npm run dev
```

Server will start at `http://localhost:3000`

## Step 6: Test the login

1. Open http://localhost:3000/login
2. Enter:
   - **Enrollment No**: EN2024001
   - **Password**: password123
3. Click "Login"
4. You should be redirected to `/dashboard`

## What's Happening Behind the Scenes

```
┌─────────────────────────────────────────────────────────┐
│  Step 1: You enter credentials in login form            │
│  Enrollment: EN2024001                                  │
│  Password:   password123                                │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│  Step 2: Form submits to POST /api/auth                 │
│  Body: { enrollmentNo, password }                       │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│  Step 3: API connects to MongoDB                        │
│  Using MONGODB_URI from env vars                        │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│  Step 4: Query students collection                      │
│  Find: { enrollmentNo: "EN2024001" }                    │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│  Step 5: Verify password with bcrypt                    │
│  Compare: input password vs stored hashed password      │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│  Step 6: If match → Return token + student data        │
│  If no match → Return error                             │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│  Step 7: Store token in localStorage                    │
│  Redirect to /dashboard                                 │
└─────────────────────────────────────────────────────────┘
```

## Test Additional Scenarios

### Test Invalid Password
- Enrollment: EN2024001
- Password: wrongpassword
- Result: "Invalid credentials" error

### Test Non-existent User
- Enrollment: EN9999999
- Password: password123
- Result: "Invalid credentials" error

### Test Different Student
- Enrollment: EN2024002
- Password: password123
- Result: Login success (different student profile)

## Database Inspection

If you want to verify the data in MongoDB directly:

**MongoDB Atlas:**
1. Go to Atlas dashboard
2. Select your cluster
3. Click "Collections"
4. Look at `college_erp` → `students`
5. You should see 3 documents with hashed passwords like: `$2b$10$...`

**In Code (for debugging):**
```typescript
import { getDatabase } from "@/lib/mongodb";

const db = await getDatabase();
const students = await db.collection("students").find({}).toArray();
console.log("[v0] All students:", students);
```

## Adding New Students Programmatically

Create a simple API endpoint to add students (only for testing):

```typescript
// app/api/students/add/route.ts
import { getDatabase } from "@/lib/mongodb";
import { createStudent } from "@/lib/db-models";

export async function POST(request: Request) {
  const body = await request.json();
  const db = await getDatabase();
  
  const student = await createStudent(db, {
    enrollmentNo: body.enrollmentNo,
    email: body.email,
    firstName: body.firstName,
    lastName: body.lastName,
    password: body.password,
    phone: body.phone,
    department: body.department,
    semester: body.semester,
    cgpa: body.cgpa,
  });

  return Response.json({ success: true, student });
}
```

Then POST to this endpoint:
```bash
curl -X POST http://localhost:3000/api/students/add \
  -H "Content-Type: application/json" \
  -d '{
    "enrollmentNo": "EN2024004",
    "email": "student4@college.edu",
    "firstName": "New",
    "lastName": "Student",
    "password": "password123",
    "phone": "+91-1234567890",
    "department": "IT",
    "semester": 1,
    "cgpa": 0
  }'
```

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Seed script not found | Check file exists at `/scripts/seed.mjs` |
| "Cannot find module 'mongodb'" | Run `npm install` |
| MongoDB connection error | Verify MONGODB_URI env variable |
| Login still fails after seeding | Check MongoDB has 3 documents in students collection |
| Password doesn't match | Ensure seed script ran successfully, passwords are hashed |
| Port 3000 already in use | Run `lsof -i :3000` then `kill -9 <PID>` |

## Next Steps

Once login is working:
1. Update dashboard to use MongoDB for real student data
2. Create admin panel for user management
3. Add password change functionality
4. Implement password reset
5. Add JWT tokens instead of base64
6. Add rate limiting on login
7. Add 2FA support

---

**You're all set!** Your login system now uses real MongoDB authentication with secure hashed passwords instead of hardcoded credentials.
