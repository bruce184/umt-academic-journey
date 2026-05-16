Lecturer endpoints - DB schema assumptions

This document lists the database tables and columns expected by the DB-backed implementations in `src/models/lecturer.m.js` and the controller wiring in `src/controllers/lecturer.c.js`.

These are *assumptions* used to implement queries and should be aligned with your actual schema or migrated accordingly.

Tables (recommended columns)

- lecturers
  - id (PK)
  - full_name
  - username
  - email

- courses
  - id (PK)
  - course_code
  - course_name
  - credits

- course_offerings
  - id (PK)
  - course_id (FK -> courses.id)
  - lecturer_id (FK -> lecturers.id)
  - day_of_week (int or smallint)
  - start_time (time or timestamptz)
  - end_time (time or timestamptz)
  - room_name (string)
  - class_group (string)

- students
  - id (PK)
  - student_id (string)
  - full_name

- student_registrations
  - id (PK)
  - student_id (FK -> students.id)
  - offering_id (FK -> course_offerings.id)
  - term_id (optional)

- attendance_records
  - id (PK)
  - class_id (FK -> course_offerings.id)
  - student_id (FK -> students.id)
  - present (boolean)
  - date (date)

- announcements (or notifications)
  - id (PK)
  - course_id (FK -> courses.id) nullable
  - lecturer_id (FK -> lecturers.id) nullable
  - course_name (string) optional (denormalized)
  - title (text)
  - content (text)
  - type (string)
  - created_at (timestamptz)

- tests (or assignments)
  - id (PK)
  - course_id (FK -> courses.id)
  - code (string)
  - title (string)
  - type ("Quiz"|"Assignment"|"Exam")
  - due_date (timestamptz)
  - total_points (numeric)
  - status (string)
  - weight (numeric) optional for weighted grade calculation

- grades
  - id (PK)
  - student_id (FK -> students.id)
  - course_id (FK -> courses.id)
  - test_id (FK -> tests.id)
  - score (numeric)

Notes & migration guidance
- The code falls back to file-based storage (`readData` / `writeData`) if DB tables are missing. This allows running without migrating the DB immediately.
- If your real schema uses different column/table names, update the query field names in `src/models/lecturer.m.js` accordingly.
- Consider adding indexes on frequently queried columns: `announcements(lecturer_id)`, `student_registrations(offering_id)`, `attendance_records(class_id, date)`.

Testing tips
- Create a few test rows for `course_offerings`, `courses`, `students`, and `student_registrations` and confirm the Lecturer UI endpoints return expected results.
- Use the API routes under `/api/lecturers` (see `src/routers/lecturer.r.js`) for quick CURL checks.

If you want, I can produce SQL migration scripts (Knex migration files) for these tables next.