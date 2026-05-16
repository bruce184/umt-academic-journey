-- Academic(courses,opening-courses,enrollments,assessments,teaching-assignments,gradings)

-- =========================================
-- C1. COURSES
-- =========================================
CREATE TABLE IF NOT EXISTS courses (
    course_id      SERIAL PRIMARY KEY,
    department_id  INT REFERENCES departments(department_id),
    course_name    VARCHAR(255) NOT NULL,
    course_credit  INT NOT NULL CHECK (course_credit >= 0)
);

-- =========================================
-- C2. OPENING COURSES (lớp mở từng kỳ)
-- =========================================
CREATE TABLE IF NOT EXISTS opening_courses (
    opening_course_code VARCHAR(20) PRIMARY KEY,
    course_id           INT NOT NULL REFERENCES courses(course_id),
    semester            VARCHAR(20) NOT NULL,     -- 'Fall','Spring',...
    academic_year       VARCHAR(9)  NOT NULL,     -- '2024-2025'
    quantity            INT NOT NULL CHECK (quantity >= 0)
);

-- =========================================
-- C3. ENROLLMENTS (đăng ký lớp)
-- =========================================
CREATE TABLE IF NOT EXISTS enrollments (
    enrollment_id       SERIAL PRIMARY KEY,
    student_id          INT NOT NULL
                         REFERENCES students(user_id),
    opening_course_code VARCHAR(20) NOT NULL
                         REFERENCES opening_courses(opening_course_code),
    enrollment_date     DATE NOT NULL DEFAULT CURRENT_DATE,
    status              VARCHAR(20) NOT NULL DEFAULT 'ENROLLED',
    final_grade         NUMERIC(4,1)
);

-- =========================================
-- C4. ASSESSMENTS (bài kiểm tra)
-- =========================================
CREATE TABLE IF NOT EXISTS assessments (
    assessment_id SERIAL PRIMARY KEY,
    course_id     INT NOT NULL REFERENCES courses(course_id),
    title         VARCHAR(255) NOT NULL,
    due_at        TIMESTAMPTZ,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ratio         NUMERIC(5,2) NOT NULL CHECK (ratio >= 0 AND ratio <= 100)
);

-- =========================================
                        ON DELETE CASCADE,
    lecturer_id         INT NOT NULL
                        REFERENCES lecturers(user_id),
    role                VARCHAR(50),
    PRIMARY KEY (opening_course_code, lecturer_id)
);

-- =========================================
-- C6. GRADINGS (điểm từng bài)
-- =========================================
CREATE TABLE IF NOT EXISTS gradings (
        assessment_id INT NOT NULL
                                    REFERENCES assessments(assessment_id)
                                    ON DELETE CASCADE,
        enrollment_id INT NOT NULL
                                    REFERENCES enrollments(enrollment_id)
                                    ON DELETE CASCADE,
        grade         NUMERIC(4,1),
        PRIMARY KEY (assessment_id, enrollment_id)
);

-- =========================
-- Compatibility tables (from 07-compat-academic.sql)
-- course_offerings + student_registrations
-- =========================
CREATE TABLE IF NOT EXISTS course_offerings (
    id SERIAL PRIMARY KEY,
    course_id INT REFERENCES courses(course_id),
    term_id INT REFERENCES terms(id),
    day_of_week VARCHAR(20),
    start_time TIME,
    end_time TIME,
    room_name VARCHAR(128),
    class_group VARCHAR(32),
    capacity INT DEFAULT 0,
    is_open_for_registration BOOLEAN DEFAULT TRUE,
    lecturer_id INT REFERENCES lecturers(user_id)
);

CREATE TABLE IF NOT EXISTS student_registrations (
    student_id INT NOT NULL REFERENCES students(user_id) ON DELETE CASCADE,
    term_id INT REFERENCES terms(id),
    offering_id INT REFERENCES course_offerings(id) ON DELETE CASCADE,
    registered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (student_id, offering_id)
);

-- =========================================
-- Lecturer extras: announcements, attendance, materials, notifications
-- (merged from 05-lecturer-extras.sql)
-- =========================================
CREATE TABLE IF NOT EXISTS announcements (
    id BIGSERIAL PRIMARY KEY,
    course_id INTEGER REFERENCES courses(course_id) ON DELETE SET NULL,
    opening_course_code VARCHAR NULL REFERENCES opening_courses(opening_course_code) ON DELETE SET NULL,
    lecturer_id INTEGER NULL REFERENCES lecturers(user_id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    content TEXT,
    type VARCHAR(64) DEFAULT 'ANNOUNCEMENT',
    course_name TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_announcements_lecturer
    ON announcements(lecturer_id);

CREATE INDEX IF NOT EXISTS idx_announcements_course
    ON announcements(course_id);

-- Attendance records table
CREATE TABLE IF NOT EXISTS attendance_records (
    id BIGSERIAL PRIMARY KEY,
    opening_course_code VARCHAR NOT NULL REFERENCES opening_courses(opening_course_code) ON DELETE CASCADE,
    student_id INTEGER NOT NULL REFERENCES students(user_id) ON DELETE CASCADE,
    lecturer_id INTEGER NULL REFERENCES lecturers(user_id) ON DELETE SET NULL,
    date DATE NOT NULL,
    present BOOLEAN NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_attendance_class_date
    ON attendance_records(opening_course_code, date);

CREATE INDEX IF NOT EXISTS idx_attendance_student
    ON attendance_records(student_id);

-- Materials table
CREATE TABLE IF NOT EXISTS materials (
    id BIGSERIAL PRIMARY KEY,
    course_id INTEGER NULL REFERENCES courses(course_id) ON DELETE SET NULL,
    opening_course_code VARCHAR NULL REFERENCES opening_courses(opening_course_code) ON DELETE SET NULL,
    lecturer_id INTEGER NULL REFERENCES lecturers(user_id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    file_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_materials_course
    ON materials(course_id);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id BIGSERIAL PRIMARY KEY,
    course_id INTEGER NULL REFERENCES courses(course_id) ON DELETE SET NULL,
    lecturer_id INTEGER NULL REFERENCES lecturers(user_id) ON DELETE SET NULL,
    message TEXT NOT NULL,
    type VARCHAR(64) DEFAULT 'Announcement',
    payload JSONB NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_course
    ON notifications(course_id);

-- =========================================
-- Compatibility/alias columns for courses (merged from 07-compat-course-columns.sql)
-- Ensure compatibility alias columns for courses so controllers can use c.id, c.course_code, c.credits
-- =========================================
BEGIN;

ALTER TABLE courses ADD COLUMN IF NOT EXISTS id integer GENERATED ALWAYS AS (course_id) STORED;

ALTER TABLE courses ADD COLUMN IF NOT EXISTS course_code VARCHAR(64);
UPDATE courses SET course_code = course_name WHERE course_code IS NULL;

ALTER TABLE courses ADD COLUMN IF NOT EXISTS credits INTEGER;
UPDATE courses SET credits = course_credit WHERE credits IS NULL;

COMMIT;
