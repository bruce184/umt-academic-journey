-- 0. Create and switch to the database
CREATE DATABASE University_Management;
USE University_Management;

-- ---------------------------------------------------------------------------
-- 1. departments: each academic unit
CREATE TABLE IF NOT EXISTS departments (
    dept_id      VARCHAR(10)    PRIMARY KEY,
    dept_name    VARCHAR(100)   NOT NULL
);

-- ---------------------------------------------------------------------------
-- 2. students: personal data + home department
CREATE TABLE IF NOT EXISTS students (
    student_id    VARCHAR(10)    PRIMARY KEY,
    name          VARCHAR(100)   NOT NULL,
    dob           DATE,
    address       VARCHAR(255),
    phone_number  VARCHAR(15),
    dept_id       VARCHAR(10),
    CONSTRAINT fk_students_dept
        FOREIGN KEY (dept_id) REFERENCES departments(dept_id)
);

-- ---------------------------------------------------------------------------
-- 3. teachers: instructors & TAs, each belongs to one department
CREATE TABLE IF NOT EXISTS teachers (
    teacher_id     VARCHAR(10)    PRIMARY KEY,
    name           VARCHAR(100)   NOT NULL,
    dob            DATE,
    phone_number   VARCHAR(15),
    is_instructor  BOOLEAN        NOT NULL DEFAULT TRUE,
    is_assistant   BOOLEAN        NOT NULL DEFAULT FALSE,
    dept_id        VARCHAR(10),
    CONSTRAINT fk_teachers_dept
        FOREIGN KEY (dept_id) REFERENCES departments(dept_id)
);

-- ---------------------------------------------------------------------------
-- 4. semesters: academic periods
CREATE TABLE IF NOT EXISTS semesters (
    sem_id   VARCHAR(10)    PRIMARY KEY,
    year     INT            NOT NULL
);

-- ---------------------------------------------------------------------------
-- 5. subjects: module catalog, linked to exactly one department
CREATE TABLE IF NOT EXISTS subjects (
    module_id   VARCHAR(10)    PRIMARY KEY,
    roe         CHAR(1)        NOT NULL
                               CHECK (roe IN ('R','E')),  -- R = Required, E = Elective
    name        VARCHAR(100)   NOT NULL,
    credit      INT            NOT NULL,
    dept_id     VARCHAR(10)    NOT NULL,
    CONSTRAINT fk_subjects_dept
        FOREIGN KEY (dept_id) REFERENCES departments(dept_id)
);

-- ---------------------------------------------------------------------------
-- 6. classes: specific offerings of subjects each semester
CREATE TABLE IF NOT EXISTS classes (
    class_id             VARCHAR(10)    PRIMARY KEY,
    module_id            VARCHAR(10)    NOT NULL,
    number_of_students   INT            DEFAULT 0,
    capacity             INT            NOT NULL,
    year                 INT            NOT NULL,
    sem_id               VARCHAR(10)    NOT NULL,
    CONSTRAINT fk_classes_subject
        FOREIGN KEY (module_id) REFERENCES subjects(module_id),
    CONSTRAINT fk_classes_semester
        FOREIGN KEY (sem_id) REFERENCES semesters(sem_id)
);

-- ---------------------------------------------------------------------------
-- 7. class_teachers: who (instructor/TA) teaches which class
CREATE TABLE IF NOT EXISTS class_teachers (
    class_id    VARCHAR(10)    NOT NULL,
    teacher_id  VARCHAR(10)    NOT NULL,
    role        VARCHAR(50),               -- e.g. 'Primary Instructor', 'TA'
    PRIMARY KEY (class_id, teacher_id),
    CONSTRAINT fk_ct_classes
        FOREIGN KEY (class_id) REFERENCES classes(class_id),
    CONSTRAINT fk_ct_teachers
        FOREIGN KEY (teacher_id) REFERENCES teachers(teacher_id)
);

-- ---------------------------------------------------------------------------
-- 8. enrollments: which student is in which class + grade/status
CREATE TABLE IF NOT EXISTS enrollments (
    class_id    VARCHAR(10)    NOT NULL,
    student_id  VARCHAR(10)    NOT NULL,
    grade       CHAR(2),                    -- e.g. 'A+', 'B'
    status      VARCHAR(20),                -- e.g. 'Passed', 'Failed'
    PRIMARY KEY (class_id, student_id),
    CONSTRAINT fk_enrollments_classes
        FOREIGN KEY (class_id) REFERENCES classes(class_id),
    CONSTRAINT fk_enrollments_students
        FOREIGN KEY (student_id) REFERENCES students(student_id)
);

-- ---------------------------------------------------------------------------
-- 9. subject_prerequisites: self‑referencing chain of prerequisites
CREATE TABLE IF NOT EXISTS subject_prerequisites (
    module_id         VARCHAR(10)    NOT NULL,
    prerequisite_id   VARCHAR(10)    NOT NULL,
    PRIMARY KEY (module_id, prerequisite_id),
    CONSTRAINT fk_sp_subject
        FOREIGN KEY (module_id) REFERENCES subjects(module_id),
    CONSTRAINT fk_sp_prereq
        FOREIGN KEY (prerequisite_id) REFERENCES subjects(module_id)
);

-- ---------------------------------------------------------------------------
-- 10. schedules: room & timeslot assignments for classes
CREATE TABLE IF NOT EXISTS schedules (
    room        VARCHAR(50)    NOT NULL,
    time_slot   VARCHAR(20)    NOT NULL,    -- e.g. 'Mon-1', 'Wed-3'
    class_id    VARCHAR(10)    NOT NULL,
    PRIMARY KEY (room, time_slot, class_id),
    CONSTRAINT fk_schedules_classes
        FOREIGN KEY (class_id) REFERENCES classes(class_id)
);