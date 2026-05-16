-- Seed file for test runs: idempotent inserts
BEGIN;

-- Ensure terms table exists (compat)
CREATE TABLE IF NOT EXISTS terms (
  id SERIAL PRIMARY KEY,
  label VARCHAR(50),
  start_date DATE,
  end_date DATE
);

INSERT INTO terms (label, start_date, end_date)
SELECT '2025-S1', NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM terms WHERE label = '2025-S1');

-- Department
INSERT INTO departments (department_name)
SELECT 'Computer Science'
WHERE NOT EXISTS (SELECT 1 FROM departments WHERE department_name = 'Computer Science');

-- Users
INSERT INTO users (department_id, full_name, email, is_active)
SELECT d.department_id, 'Student One', 'student01', true
FROM departments d
WHERE d.department_name = 'Computer Science'
AND NOT EXISTS (SELECT 1 FROM users u WHERE u.email = 'student01');

INSERT INTO users (department_id, full_name, email, is_active)
SELECT d.department_id, 'Student Two', 'student02', true
FROM departments d
WHERE d.department_name = 'Computer Science'
AND NOT EXISTS (SELECT 1 FROM users u WHERE u.email = 'student02');

INSERT INTO users (department_id, full_name, email, is_active)
SELECT d.department_id, 'Lecturer One', 'lect01', true
FROM departments d
WHERE d.department_name = 'Computer Science'
AND NOT EXISTS (SELECT 1 FROM users u WHERE u.email = 'lect01');

INSERT INTO users (department_id, full_name, email, is_active)
SELECT d.department_id, 'Admin One', 'admin01', true
FROM departments d
WHERE d.department_name = 'Computer Science'
AND NOT EXISTS (SELECT 1 FROM users u WHERE u.email = 'admin01');

-- Accounts (plain password to match test harness which compares directly)
INSERT INTO accounts (user_name, user_id, password, created_at, user_role)
SELECT 'student01', u.user_id, 'P@ssw0rd', NOW(), 'STUDENT'
FROM users u
WHERE u.email = 'student01'
AND NOT EXISTS (SELECT 1 FROM accounts a WHERE a.user_name = 'student01');

INSERT INTO accounts (user_name, user_id, password, created_at, user_role)
SELECT 'student02', u.user_id, 'P@ssw0rd', NOW(), 'STUDENT'
FROM users u
WHERE u.email = 'student02'
AND NOT EXISTS (SELECT 1 FROM accounts a WHERE a.user_name = 'student02');

INSERT INTO accounts (user_name, user_id, password, created_at, user_role)
SELECT 'lect01', u.user_id, 'P@ssw0rd', NOW(), 'LECTURER'
FROM users u
WHERE u.email = 'lect01'
AND NOT EXISTS (SELECT 1 FROM accounts a WHERE a.user_name = 'lect01');

INSERT INTO accounts (user_name, user_id, password, created_at, user_role)
SELECT 'admin01', u.user_id, 'P@ssw0rd', NOW(), 'ADMIN'
FROM users u
WHERE u.email = 'admin01'
AND NOT EXISTS (SELECT 1 FROM accounts a WHERE a.user_name = 'admin01');

-- Students & Lecturers profiles
INSERT INTO students (user_id, cohort_year, major)
SELECT u.user_id, 2023, 'CS'
FROM users u
WHERE u.email = 'student01' AND NOT EXISTS (SELECT 1 FROM students s WHERE s.user_id = u.user_id);

INSERT INTO students (user_id, cohort_year, major)
SELECT u.user_id, 2023, 'CS'
FROM users u
WHERE u.email = 'student02' AND NOT EXISTS (SELECT 1 FROM students s WHERE s.user_id = u.user_id);

INSERT INTO lecturers (user_id, salary, specialization)
SELECT u.user_id, 1000.00, 'Databases'
FROM users u
WHERE u.email = 'lect01' AND NOT EXISTS (SELECT 1 FROM lecturers l WHERE l.user_id = u.user_id);

-- Courses (DB101, WEB201)
INSERT INTO courses (department_id, course_name, course_credit)
SELECT d.department_id, 'DB101', 3 FROM departments d
WHERE d.department_name = 'Computer Science'
AND NOT EXISTS (SELECT 1 FROM courses c WHERE c.course_name = 'DB101');

INSERT INTO courses (department_id, course_name, course_credit)
SELECT d.department_id, 'WEB201', 3 FROM departments d
WHERE d.department_name = 'Computer Science'
AND NOT EXISTS (SELECT 1 FROM courses c WHERE c.course_name = 'WEB201');

-- Opening courses (codes)
INSERT INTO opening_courses (opening_course_code, course_id, semester, academic_year, quantity)
SELECT 'DB101-2025-S1', c.course_id, 'S1', '2025', 30 FROM courses c
WHERE c.course_name = 'DB101' AND NOT EXISTS (SELECT 1 FROM opening_courses oc WHERE oc.opening_course_code = 'DB101-2025-S1');

INSERT INTO opening_courses (opening_course_code, course_id, semester, academic_year, quantity)
SELECT 'WEB201-2025-S1', c.course_id, 'S1', '2025', 1 FROM courses c
WHERE c.course_name = 'WEB201' AND NOT EXISTS (SELECT 1 FROM opening_courses oc WHERE oc.opening_course_code = 'WEB201-2025-S1');

-- course_offerings (compat table)
-- ensure terms row exists
INSERT INTO course_offerings (course_id, term_id, day_of_week, start_time, end_time, room_name, class_group, capacity, is_open_for_registration, lecturer_id)
SELECT c.course_id, t.id, 'Mon', '08:00', '10:00', 'R101', 'A', 30, true, l.user_id
FROM courses c, terms t, lecturers l
WHERE c.course_name = 'DB101' AND t.label = '2025-S1' AND l.user_id = (SELECT user_id FROM users WHERE email='lect01')
AND NOT EXISTS (SELECT 1 FROM course_offerings co JOIN courses cc ON co.course_id = cc.course_id WHERE cc.course_name = 'DB101');

INSERT INTO course_offerings (course_id, term_id, day_of_week, start_time, end_time, room_name, class_group, capacity, is_open_for_registration, lecturer_id)
SELECT c.course_id, t.id, 'Tue', '10:00', '12:00', 'R102', 'B', 1, true, l.user_id
FROM courses c, terms t, lecturers l
WHERE c.course_name = 'WEB201' AND t.label = '2025-S1' AND l.user_id = (SELECT user_id FROM users WHERE email='lect01')
AND NOT EXISTS (SELECT 1 FROM course_offerings co JOIN courses cc ON co.course_id = cc.course_id WHERE cc.course_name = 'WEB201');

-- Make WEB201 full by registering student02 to that offering (capacity 1)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM course_offerings co JOIN courses c ON co.course_id = c.course_id WHERE c.course_name='WEB201') THEN
    INSERT INTO student_registrations (student_id, term_id, offering_id)
    SELECT u.user_id, t.id, co.id
    FROM users u, terms t, course_offerings co, courses c
    WHERE u.email = 'student02' AND t.label = '2025-S1' AND co.course_id = c.course_id AND c.course_name = 'WEB201'
    AND NOT EXISTS (
      SELECT 1 FROM student_registrations sr WHERE sr.student_id = u.user_id AND sr.offering_id = co.id
    );
  END IF;
END$$;

COMMIT;

-- End seed

-- Additional seeds: teaching assignments, enrollments, announcements, notifications, attendance
BEGIN;

-- teaching_assignments -> link lecturer to opening_courses
INSERT INTO teaching_assignments (opening_course_code, lecturer_id)
SELECT oc.opening_course_code, l.user_id
FROM opening_courses oc, lecturers l, users u
WHERE oc.opening_course_code = 'DB101-2025-S1' AND l.user_id = (SELECT user_id FROM users WHERE email='lect01')
AND NOT EXISTS (SELECT 1 FROM teaching_assignments ta WHERE ta.opening_course_code = 'DB101-2025-S1' AND ta.lecturer_id = l.user_id);

-- enrollments: enroll student01 in DB101 opening (for attendance/tests)
INSERT INTO enrollments (student_id, opening_course_code, enrollment_date, status)
SELECT u.user_id, 'DB101-2025-S1', CURRENT_DATE, 'ENROLLED'
FROM users u
WHERE u.email = 'student01' AND NOT EXISTS (SELECT 1 FROM enrollments e WHERE e.student_id = u.user_id AND e.opening_course_code = 'DB101-2025-S1');

-- announcements: add one announcement for DB101 by lect01
INSERT INTO announcements (course_id, opening_course_code, lecturer_id, title, content, type, course_name, created_at)
SELECT c.course_id, 'DB101-2025-S1', l.user_id, 'Welcome to DB101', 'First lecture on Monday', 'ANNOUNCEMENT', c.course_name, NOW()
FROM courses c, users u, lecturers l
WHERE c.course_name = 'DB101' AND l.user_id = (SELECT user_id FROM users WHERE email='lect01')
AND NOT EXISTS (SELECT 1 FROM announcements a WHERE a.title = 'Welcome to DB101' AND a.opening_course_code = 'DB101-2025-S1');

-- notifications: add one notification for DB101
INSERT INTO notifications (course_id, lecturer_id, message, type, created_at)
SELECT c.course_id, l.user_id, 'Class postponed by 1 day', 'Announcement', NOW()
FROM courses c, lecturers l
WHERE c.course_name = 'DB101' AND l.user_id = (SELECT user_id FROM users WHERE email='lect01')
AND NOT EXISTS (SELECT 1 FROM notifications n WHERE n.message = 'Class postponed by 1 day' AND n.lecturer_id = l.user_id);

-- attendance_records: mark student01 present for DB101-2025-S1 today
INSERT INTO attendance_records (opening_course_code, student_id, lecturer_id, date, present, created_at)
SELECT 'DB101-2025-S1', u.user_id, l.user_id, CURRENT_DATE, true, NOW()
FROM users u, lecturers l
WHERE u.email = 'student01' AND l.user_id = (SELECT user_id FROM users WHERE email='lect01')
AND NOT EXISTS (SELECT 1 FROM attendance_records ar WHERE ar.opening_course_code = 'DB101-2025-S1' AND ar.student_id = u.user_id AND ar.date = CURRENT_DATE);

COMMIT;

-- ==================================================================
-- Merged additional seed operations (from seed-additional.sql)
-- These are idempotent inserts that complement the above seeds.
-- ==================================================================
BEGIN;

-- teaching_assignments: use ON CONFLICT to avoid duplicate key errors
INSERT INTO teaching_assignments (opening_course_code, lecturer_id)
SELECT 'DB101-2025-S1', (SELECT user_id FROM users WHERE email='lect01')
ON CONFLICT (opening_course_code, lecturer_id) DO NOTHING;

-- enrollments: enroll student01 in DB101 opening
INSERT INTO enrollments (student_id, opening_course_code, enrollment_date, status)
SELECT (SELECT user_id FROM users WHERE email='student01'), 'DB101-2025-S1', CURRENT_DATE, 'ENROLLED'
ON CONFLICT DO NOTHING;

-- announcements: add one announcement for DB101 by lect01
INSERT INTO announcements (course_id, opening_course_code, lecturer_id, title, content, type, course_name, created_at)
SELECT c.course_id, 'DB101-2025-S1', (SELECT user_id FROM users WHERE email='lect01'), 'Welcome to DB101', 'First lecture on Monday', 'ANNOUNCEMENT', c.course_name, NOW()
FROM courses c
WHERE c.course_name = 'DB101'
ON CONFLICT DO NOTHING;

-- notifications: add one notification for DB101
INSERT INTO notifications (course_id, lecturer_id, message, type, created_at)
SELECT c.course_id, (SELECT user_id FROM users WHERE email='lect01'), 'Class postponed by 1 day', 'Announcement', NOW()
FROM courses c
WHERE c.course_name = 'DB101'
ON CONFLICT DO NOTHING;

-- attendance_records: mark student01 present for DB101-2025-S1 today
INSERT INTO attendance_records (opening_course_code, student_id, lecturer_id, date, present, created_at)
SELECT 'DB101-2025-S1', (SELECT user_id FROM users WHERE email='student01'), (SELECT user_id FROM users WHERE email='lect01'), CURRENT_DATE, true, NOW()
ON CONFLICT DO NOTHING;

COMMIT;

-- Ensure a lecturer profile exists for user_id = 1 (helps tests that use default /lecturers/1/* endpoints)
INSERT INTO lecturers (user_id, salary, specialization)
SELECT 1, 1200.00, 'General'
WHERE NOT EXISTS (SELECT 1 FROM lecturers WHERE user_id = 1);

-- Ensure teaching assignment for lecturer id 1 exists for DB101 opening
INSERT INTO teaching_assignments (opening_course_code, lecturer_id)
SELECT 'DB101-2025-S1', 1
ON CONFLICT (opening_course_code, lecturer_id) DO NOTHING;
