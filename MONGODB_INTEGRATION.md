# MongoDB Integration - Complete Setup

## Environment Configuration

Your MongoDB connection string has been added to `.env.local`:

```
MONGODB_URI="mongodb+srv://<db_username>:<db_password>@cluster0.8haraqx.mongodb.net/?appName=Cluster0"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"
```

**Important**: Replace `<db_username>` and `<db_password>` with your actual MongoDB credentials.

## Database Architecture

### User Model (`models/User.ts`)
- **enrollmentId** (String, unique) - Primary identifier (e.g., EN2024001)
- **name** (String) - Full name
- **email** (String, unique) - Email address
- **password** (String) - Hashed with bcryptjs
- **role** (String) - student, faculty, or admin
- **department** (String) - Department name
- **semester** (Number) - 1-8 for students
- **phone** (String) - Contact number
- **avatar** (String) - Profile picture URL
- **isActive** (Boolean) - Account status
- **lastLogin** (Date) - Last login timestamp
- **timestamps** - createdAt, updatedAt

## API Endpoints

### 1. Register User
**POST** `/api/auth/register`

Request:
```json
{
  "enrollmentId": "EN2024001",
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword",
  "role": "student",
  "department": "Computer Science",
  "semester": 4
}
```

### 2. Login User
**POST** `/api/auth/login`

Request:
```json
{
  "enrollmentId": "EN2024001",
  "password": "securepassword"
}
```

Response:
```json
{
  "message": "Login successful",
  "user": {
    "_id": "...",
    "enrollmentId": "EN2024001",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "student",
    "department": "Computer Science",
    "semester": 4,
    "lastLogin": "2026-02-19T12:00:00.000Z"
  }
}
```

The user data is stored in an HTTP-only cookie for security.

### 3. Logout User
**POST** `/api/auth/logout`

Clears the user session cookie.

## Security Features

- Passwords are hashed using bcryptjs with salt rounds of 10
- HTTP-only cookies prevent XSS attacks
- Passwords are never returned in API responses
- Unique constraints on enrollmentId and email prevent duplicates
- Environment variables protect sensitive credentials

## Database Collections

After first use, MongoDB will automatically create:
- **users** - User accounts and authentication data
- Additional collections for courses, attendance, grades, etc. (to be added)

## Testing the Integration

1. **Register a new user**:
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "enrollmentId": "EN2024001",
    "name": "Test Student",
    "email": "test@example.com",
    "password": "password123",
    "role": "student",
    "department": "Computer Science",
    "semester": 4
  }'
```

2. **Login with credentials**:
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "enrollmentId": "EN2024001",
    "password": "password123"
  }'
```

## Next Steps

1. Install dependencies: `npm install`
2. Verify MongoDB connection string in `.env.local`
3. Start dev server: `npm run dev`
4. Test API endpoints using the curl commands above
5. Create additional models for Courses, Attendance, Grades, etc.
6. Update login form to use `/api/auth/login` endpoint
7. Update registration form to use `/api/auth/register` endpoint

## Troubleshooting

- **Connection timeout**: Verify MongoDB URI and network access
- **Authentication failed**: Check username/password in connection string
- **Duplicate key error**: Clear users collection if testing with same enrollmentId
- **ECONNREFUSED**: Ensure MongoDB server is running (for local MongoDB)
