# MongoDB Authentication - Complete Checklist

## Pre-Implementation (✅ Already Done)

- [x] Created MongoDB connection utility (`lib/mongodb.ts`)
- [x] Created Student model with password hashing (`lib/db-models.ts`)
- [x] Created seed script (`scripts/seed.mjs`)
- [x] Updated authentication API (`app/api/auth/route.ts`)
- [x] Updated login form (`components/login-form.tsx`)
- [x] Added bcryptjs and mongodb to dependencies
- [x] Created comprehensive documentation

## Your Action Items (⏳ To Do)

### 1. Update package.json Scripts (5 min)

- [ ] Open `package.json`
- [ ] Find the `"scripts"` section
- [ ] Add this line:
  ```json
  "seed": "node scripts/seed.mjs"
  ```
- [ ] Should look like:
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

### 2. Verify MongoDB URI (5 min)

- [ ] Go to Vercel Project Settings
- [ ] Navigate to "Environment Variables"
- [ ] Confirm `MONGODB_URI` is set
- [ ] Format should be: `mongodb+srv://user:pass@cluster.xxxx.mongodb.net/?...`
- [ ] If not set, add it now

### 3. Install Dependencies (2 min)

- [ ] Dependencies auto-install when you save `package.json`
- [ ] Or manually run: `npm install`
- [ ] Check for errors in terminal

### 4. Seed Database (5 min)

- [ ] Run: `npm run seed`
- [ ] Watch for output confirming 3 students created
- [ ] Should see:
  - `[v0] Connected to MongoDB`
  - `[v0] Created student: EN2024001`
  - `[v0] Created student: EN2024002`
  - `[v0] Created student: EN2024003`
  - Test credentials displayed

### 5. Start Development Server (2 min)

- [ ] Run: `npm run dev`
- [ ] Wait for "ready - started server on"
- [ ] Server should be at `http://localhost:3000`

### 6. Test Login (10 min)

**Test 1: Valid Credentials**
- [ ] Navigate to `http://localhost:3000/login`
- [ ] Enter:
  - Enrollment: `EN2024001`
  - Password: `password123`
- [ ] Click "Login"
- [ ] Should redirect to `/dashboard`
- [ ] Should show success toast

**Test 2: Invalid Password**
- [ ] Go back to login page
- [ ] Enter:
  - Enrollment: `EN2024001`
  - Password: `wrongpassword`
- [ ] Should see "Invalid credentials" error
- [ ] Should NOT redirect

**Test 3: Non-existent User**
- [ ] Go back to login page
- [ ] Enter:
  - Enrollment: `EN9999999`
  - Password: `password123`
- [ ] Should see "Invalid credentials" error
- [ ] Should NOT redirect

**Test 4: Different Student**
- [ ] Go back to login page
- [ ] Enter:
  - Enrollment: `EN2024002`
  - Password: `password123`
- [ ] Should redirect to `/dashboard`
- [ ] Should show Priya Singh's profile

### 7. Verify Database (Optional)

- [ ] Go to MongoDB Atlas dashboard
- [ ] Select your cluster
- [ ] Click "Collections"
- [ ] Open `college_erp` → `students`
- [ ] Should see 3 documents
- [ ] Each has `password` field with `$2b$10$...` hash

## Troubleshooting Checklist

### Seed Script Fails

- [ ] Is `MONGODB_URI` set locally? `echo $MONGODB_URI`
- [ ] Is MongoDB Atlas cluster running? Check Atlas dashboard
- [ ] Are credentials in URI correct?
- [ ] Try: `npm install` first, then `npm run seed`
- [ ] Check for typos in `scripts/seed.mjs`

### Login API Returns 500 Error

- [ ] Check browser console for detailed error
- [ ] Is `MONGODB_URI` in environment variables?
- [ ] Is MongoDB connection working? (test in seed script)
- [ ] Are all dependencies installed? `npm install`
- [ ] Check server logs for MongoDB errors

### Login Page Not Loading

- [ ] Is dev server running? `npm run dev`
- [ ] Is it on correct port? Should be `:3000`
- [ ] Are node_modules installed? `npm install`
- [ ] Try clearing browser cache
- [ ] Try different browser

### After Login, Dashboard Doesn't Load

- [ ] Check browser console for errors
- [ ] Verify token is saved: `localStorage.getItem('authToken')`
- [ ] Verify student data saved: `localStorage.getItem('studentData')`
- [ ] Check if `/dashboard` page exists

### "Cannot find module" Error

- [ ] Run: `npm install`
- [ ] Delete `node_modules`: `rm -rf node_modules`
- [ ] Clear npm cache: `npm cache clean --force`
- [ ] Reinstall: `npm install`

### Password Still Using Mock Data

- [ ] Did you restart dev server after changes?
- [ ] Did `npm run seed` complete successfully?
- [ ] Check you're using `EN2024001` (not different number)
- [ ] Try different test account `EN2024002`

## Files to Verify

- [ ] `/lib/mongodb.ts` exists (30+ lines)
- [ ] `/lib/db-models.ts` exists (60+ lines)
- [ ] `/scripts/seed.mjs` exists (80+ lines)
- [ ] `/app/api/auth/route.ts` updated (70+ lines)
- [ ] `/components/login-form.tsx` updated (150+ lines)
- [ ] `package.json` has bcryptjs and mongodb
- [ ] `package.json` has seed script

## Documentation References

Use these when you need help:

- 🚀 **Quick Start**: `QUICK_START.md` (test credentials & setup)
- 📋 **Setup Instructions**: `SETUP_INSTRUCTIONS.md` (step-by-step)
- 📚 **Technical Details**: `MONGODB_IMPLEMENTATION.md` (how it works)
- 🏗️ **Architecture**: `IMPLEMENTATION_VISUAL_GUIDE.md` (diagrams)
- ⚙️ **Setup Guide**: `MONGODB_AUTH_SETUP.md` (database schema)

## Success Indicators

You'll know it's working when:

✅ `npm run seed` completes without errors
✅ Login with EN2024001/password123 redirects to dashboard
✅ Invalid credentials show error
✅ Different users can login with their credentials
✅ Browser localStorage shows authToken and studentData
✅ MongoDB Atlas shows 3 student documents with hashed passwords

## Next Steps (After Login Works)

1. Update dashboard to pull real data from MongoDB
2. Create admin panel for student management
3. Add password change functionality
4. Implement "Forgot Password" feature
5. Add JWT tokens instead of base64
6. Add rate limiting on login attempts
7. Implement 2FA/OTP verification
8. Add email verification for new registrations

## Need Help?

📖 Check `SETUP_INSTRUCTIONS.md` for detailed command explanations
🔍 Review `MONGODB_IMPLEMENTATION.md` for how authentication works
📊 Look at `IMPLEMENTATION_VISUAL_GUIDE.md` for architecture diagrams
❓ Error message? Search troubleshooting section above

---

## Quick Command Reference

```bash
# Install dependencies
npm install

# Add seed script, then:
npm run seed

# Start dev server
npm run dev

# Run type checking
npm run type-check

# Build for production
npm build

# Test API directly
curl -X POST http://localhost:3000/api/auth \
  -H "Content-Type: application/json" \
  -d '{"enrollmentNo":"EN2024001","password":"password123"}'
```

## Test Credentials (Use These!)

Copy/paste one at a time to test:

**Account 1:**
```
Enrollment: EN2024001
Password: password123
```

**Account 2:**
```
Enrollment: EN2024002
Password: password123
```

**Account 3:**
```
Enrollment: EN2024003
Password: password123
```

---

**Start with Step 1** - Update package.json scripts section. Let me know if you hit any issues!
