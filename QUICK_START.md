## MONGODB DATA FLOW GUIDE

Your College ERP system now saves and retrieves data from MongoDB. Here's how it works:

### Step 1: Add Test Data to MongoDB
Run this command in your terminal:
```bash
curl -X POST http://localhost:3000/api/seed
```

This creates 4 test users in your MongoDB cluster:
- Student 1: EN2024001 / password123
- Student 2: EN2024002 / password123
- Faculty: FAC001 / password123
- Admin: ADM001 / password123

### Step 2: Start Development Server
```bash
npm run dev
```

Visit: http://localhost:3000

### Step 3: Login with MongoDB Data
1. Click on landing page "Login" button
2. Use any test user credentials from above (e.g., EN2024001 / password123)
3. The system queries MongoDB to verify your login
4. On successful login, your user data from MongoDB is stored in your session

### Step 4: View Your MongoDB Data on Dashboard
After login, the dashboard displays data fetched from MongoDB:
- Your enrollment ID
- Your name
- Your department and semester
- Your role (student/faculty/admin)
- Last login timestamp

### How Data Flows:

**Login Flow:**
User enters credentials → POST /api/auth/login → MongoDB queries User collection → Password verified with bcryptjs → User data returned → Stored in HTTP-only cookie → Redirected to dashboard

**Dashboard Data Flow:**
Page loads → Frontend fetches /api/user/profile → API reads cookie → MongoDB query → User data displayed

**Test With Curl:**
```bash
# Seed data (creates test users)
curl -X POST http://localhost:3000/api/seed

# Login with MongoDB
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"enrollmentId":"EN2024001","password":"password123"}'

# Get profile (after login)
curl http://localhost:3000/api/user/profile
```

### Files Created:
- `/app/api/seed/route.ts` - Creates test data
- `/app/api/auth/login/route.ts` - MongoDB authentication
- `/app/api/auth/register/route.ts` - New user registration
- `/app/api/auth/logout/route.ts` - Logout
- `/app/api/user/profile/route.ts` - Fetch user profile
- `/models/User.ts` - MongoDB schema with password hashing
- `/lib/mongodb.ts` - MongoDB connection manager

### Next Steps:
1. Run `npm install` to ensure dependencies are installed
2. Run `npm run dev` to start dev server
3. Visit http://localhost:3000 → Go to /api/seed to add test data
4. Login with EN2024001 / password123
5. Check dashboard for your MongoDB data
