## MongoDB Integration Testing Guide

### Automated Testing
Run the bash script to automatically test the entire flow:
```bash
chmod +x scripts/test-mongodb.sh
./scripts/test-mongodb.sh
```

### Manual Testing (Browser)

#### Test 1: Seed Test Data
1. Make sure dev server is running: `npm run dev`
2. Visit: `http://localhost:3000/api/seed`
3. Expected: JSON response with 4 created users
```json
{
  "message": "Seed data created successfully",
  "users": [...],
  "total": 4
}
```

#### Test 2: Login Flow
1. Visit: `http://localhost:3000/login`
2. Enter credentials:
   - Enrollment ID: `EN2024001`
   - Password: `password123`
3. Expected: Redirects to dashboard after successful login
4. Check browser console - should show no errors
5. Check Application tab → Cookies - should see `user` cookie

#### Test 3: View MongoDB Data
1. After login, dashboard loads
2. Check that user information displays:
   - Name: Aarav Singh
   - Enrollment ID: EN2024001
   - Department: Computer Science
   - Semester: 3
   - Role: student
3. This data comes from MongoDB, not mock data

#### Test 4: Logout
1. Click logout button in navbar
2. Expected: Redirects to login page
3. Try accessing dashboard again - should redirect to login

### Manual Testing (cURL Commands)

#### Seed data:
```bash
curl -X POST http://localhost:3000/api/seed
```

#### Login (get auth cookie):
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"enrollmentId":"EN2024001","password":"password123"}' \
  -c cookies.txt
```

#### Get user profile:
```bash
curl http://localhost:3000/api/user/profile \
  -b cookies.txt
```

#### Logout:
```bash
curl -X POST http://localhost:3000/api/auth/logout \
  -b cookies.txt
```

### Test Users in MongoDB

| ID | Enrollment | Password | Role | Department |
|---|---|---|---|---|
| 1 | EN2024001 | password123 | student | Computer Science |
| 2 | EN2024002 | password123 | student | Information Technology |
| 3 | FAC001 | password123 | faculty | Computer Science |
| 4 | ADM001 | password123 | admin | Administration |

### Expected MongoDB Workflow

1. **Seeding**: Test data inserted into `users` collection
2. **Login**: Username + password sent to `/api/auth/login`
   - MongoDB queries: `db.users.findOne({enrollmentId})`
   - Password verified with bcryptjs
   - HTTP-only cookie set with user data
3. **Dashboard**: Fetches `/api/user/profile`
   - Reads user cookie
   - Queries MongoDB: `db.users.findOne({enrollmentId})`
   - Returns user data to display
4. **Logout**: Clears session cookie

### Troubleshooting

**Problem**: "MongoDB connection failed"
- Check `.env.local` has correct MONGODB_URI
- Verify MongoDB cluster is running
- Check network access list in MongoDB Atlas

**Problem**: "Invalid credentials on login"
- Ensure test data was seeded (visit `/api/seed`)
- Check enrollment ID spelling (case-sensitive)
- Verify password is exactly "password123"

**Problem**: "Profile returns 404"
- Ensure you're logged in (check cookies)
- Clear browser cookies and login again

**Success Indicators**:
- 4 test users appear in MongoDB after seeding
- Login redirects to dashboard without mock data
- User profile displays real MongoDB data
- Logout clears session and redirects to login
