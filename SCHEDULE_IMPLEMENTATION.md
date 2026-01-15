# Schedule Upload Implementation for Admins

## Overview

Implemented a complete schedule management system that allows admins to upload and manage course schedules.

## Changes Made

### 1. **Fixed Schedule Model** ([src/models/Schedule.js](src/models/Schedule.js))

- **Bug Fix**: Changed export from `mongoose.model("Course", courseSchema)` to `mongoose.model("Schedule", scheduleSchema)`
- **Added courseId**: Added reference to Course model to link schedules to specific courses
- **Improved Fields**: Enhanced field descriptions in the schema

### 2. **Implemented Schedule Controller** ([src/controllers/scheduleController.js](src/controllers/scheduleController.js))

Implemented 6 controller methods:

- `getSchedules()` - Get all schedules with optional course filtering
- `getSchedule()` - Get a single schedule by ID
- `createSchedule()` - Create new schedule (Admin only, validates course exists)
- `updateSchedule()` - Update existing schedule (Admin only)
- `deleteSchedule()` - Delete a schedule (Admin only)
- `getCourseSchedules()` - Get all schedules for a specific course

### 3. **Added Schedule Validators** ([src/utils/validators.js](src/utils/validators.js))

- `createScheduleValidator` - Validates all required fields:
  - courseId (must be valid MongoDB ID)
  - title (3-200 characters)
  - description (minimum 10 characters)
  - week (positive number)
  - facilitator (required)
  - date (ISO8601 format)
- `updateScheduleValidator` - Optional field validation for updates

### 4. **Created Schedule Routes** ([src/routes/scheduleRoutes.js](src/routes/scheduleRoutes.js))

**Public Routes:**

- `GET /api/schedules` - Get all schedules with optional courseId filter
- `GET /api/schedules/:id` - Get single schedule
- `GET /api/schedules/courses/:courseId` - Get schedules for a course

**Admin Routes (Protected):**

- `POST /api/schedules` - Create new schedule
- `PUT /api/schedules/:id` - Update schedule
- `DELETE /api/schedules/:id` - Delete schedule

All admin routes require Bearer token authentication via `protect` middleware

### 5. **Registered Routes in Server** ([src/server.js](src/server.js))

- Added `/api/schedules` route mounting
- Updated API documentation with schedules endpoint

## API Usage Examples

### Create Schedule (Admin)

```bash
POST /api/schedules
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "courseId": "507f1f77bcf86cd799439011",
  "title": "Week 1: Introduction to Course",
  "description": "Overview of course objectives and introduction to week 1 topics",
  "week": 1,
  "facilitator": "John Doe",
  "date": "2026-01-20T10:00:00Z"
}
```

### Get All Schedules

```bash
GET /api/schedules
# Optional: ?courseId=507f1f77bcf86cd799439011
```

### Get Course Schedules

```bash
GET /api/schedules/courses/507f1f77bcf86cd799439011
```

### Update Schedule (Admin)

```bash
PUT /api/schedules/507f1f77bcf86cd799439012
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "week": 2,
  "facilitator": "Jane Smith",
  "date": "2026-01-27T10:00:00Z"
}
```

### Delete Schedule (Admin)

```bash
DELETE /api/schedules/507f1f77bcf86cd799439012
Authorization: Bearer <admin-token>
```

## Security Features

- ✅ Admin authentication required for create/update/delete operations
- ✅ Course existence validation
- ✅ MongoDB ID validation
- ✅ Request body validation with express-validator
- ✅ Rate limiting on all routes
- ✅ CORS enabled for cross-origin requests

## Database Schema

```javascript
Schedule {
  courseId: ObjectId (ref: Course) [required],
  title: String [required, 3-200 chars],
  description: String [required, min 10 chars],
  week: Number [required, min 0],
  facilitator: String [required],
  date: String [required, ISO8601 format],
  timestamps: { createdAt, updatedAt }
}
```

## Next Steps (Optional)

- Add CSV/Excel file upload support for bulk schedule creation
- Add email notifications when schedules are updated
- Add schedule conflict detection
- Add filtering by date range
