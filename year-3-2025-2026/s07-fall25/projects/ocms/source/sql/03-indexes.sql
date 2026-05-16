-- =========================================
-- E. INDEXES PHỤ (tối ưu query)
-- =========================================
CREATE INDEX IF NOT EXISTS idx_users_department_id
    ON users(department_id);

CREATE INDEX IF NOT EXISTS idx_courses_department_id
    ON courses(department_id);

CREATE INDEX IF NOT EXISTS idx_enrollments_student
    ON enrollments(student_id);

CREATE INDEX IF NOT EXISTS idx_enrollments_opening_course
    ON enrollments(opening_course_code);

CREATE INDEX IF NOT EXISTS idx_assessments_course
    ON assessments(course_id);

CREATE INDEX IF NOT EXISTS idx_teaching_assignments_lecturer
    ON teaching_assignments(lecturer_id);

CREATE INDEX IF NOT EXISTS idx_gradings_enrollment
    ON gradings(enrollment_id);

CREATE INDEX IF NOT EXISTS idx_requests_user
    ON requests(user_id);
