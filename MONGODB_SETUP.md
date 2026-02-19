## MongoDB Setup for College ERP

### Status: Routes Fixed - Ready for Database Integration

All main routes are now working:
- **`/`** - Landing page with role selection
- **`/login`** - User authentication
- **`/demo`** - Interactive demo mode with Student/Faculty/Admin roles
- **`/dashboard`** - Protected dashboard (requires login)

---

## MongoDB Connection Setup

To enable persistent data storage, you need to provide your MongoDB connection URI.

### Option 1: MongoDB Atlas (Cloud - Recommended)

1. Go to [cloud.mongodb.com](https://cloud.mongodb.com)
2. Sign up or log in to your account
3. Create a new project or use an existing one
4. Create a cluster (free tier available)
5. Go to "Connect" → "Drivers" → "Node.js"
6. Copy the connection string
7. Replace `<password>` with your database password
8. The format will be: `mongodb+srv://username:password@cluster.mongodb.net/college-erp?retryWrites=true&w=majority`

### Option 2: Local MongoDB

If running MongoDB locally:
- Connection string: `mongodb://localhost:27017/college-erp`
- Make sure MongoDB service is running on port 27017

---

## Adding the Environment Variable

Once you have your MongoDB URI, add it to your Vercel project:

1. **For Local Development:**
   - Create a `.env.local` file in the project root:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/college-erp
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

2. **For Vercel Production:**
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Add `MONGODB_URI` with your MongoDB connection string
   - Save and redeploy

---

## Required Environment Variables

| Variable | Example | Purpose |
|----------|---------|---------|
| MONGODB_URI | `mongodb+srv://user:pass@cluster.mongodb.net/college-erp` | MongoDB database connection |
| NEXT_PUBLIC_APP_URL | `http://localhost:3000` | Public application URL |

---

## What Happens After Setup

Once MongoDB is connected:
- User authentication data will be persisted
- Student/Faculty/Admin profiles will be stored
- Dashboard data (attendance, grades, etc.) will be saved
- All features will work with real database backend

---

## Next Steps

1. **Get MongoDB URI** - Follow the setup steps above
2. **Add to Environment Variables** - Set MONGODB_URI in Vercel or .env.local
3. **Restart Dev Server** - `npm run dev`
4. **Test Routes:**
   - Visit `http://localhost:3000` → Landing page
   - Visit `http://localhost:3000/demo` → Interactive demo
   - Visit `http://localhost:3000/login` → Login page
   - Sign up/login → Access dashboard

---

## Database Schema

The application will create the following collections in MongoDB:
- `users` - User accounts (students, faculty, admins)
- `students` - Student profile data
- `faculty` - Faculty profile data
- `courses` - Course information
- `attendance` - Attendance records
- `grades` - Grade records
- `assignments` - Assignment data
- `fees` - Fee information

---

## Support

If you encounter any issues:
1. Check that MongoDB is running
2. Verify the connection string is correct
3. Ensure the database name is correct
4. Check that your IP is whitelisted (if using MongoDB Atlas)

---

## Routes Summary

All routes are now working and ready for database integration:

✅ `/` - Landing page (public)
✅ `/demo?mode=student|faculty|admin` - Demo with role selection (public)
✅ `/login` - Login page (public)
✅ `/dashboard` - Dashboard (protected, requires login)
✅ `/dashboard/attendance` - Attendance tracking (protected)
✅ `/dashboard/results` - Grade results (protected)
✅ And all other dashboard sub-routes

**Please provide your MongoDB URI to proceed with database integration!**
