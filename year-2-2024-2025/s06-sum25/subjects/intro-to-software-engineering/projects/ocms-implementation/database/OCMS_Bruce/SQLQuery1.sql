--CREATE DATABASE OCMS1;

USE OCMS1;
GO

-- 1) DROP existing trigger & tables (child ? parent)
IF OBJECT_ID('trg_ci_limit', 'TR') IS NOT NULL
    DROP TRIGGER trg_ci_limit;
GO

DROP TABLE IF EXISTS tuition_payments;
DROP TABLE IF EXISTS attendance_records;
DROP TABLE IF EXISTS submissions;
DROP TABLE IF EXISTS assignments;
DROP TABLE IF EXISTS materials;
DROP TABLE IF EXISTS announcements;
DROP TABLE IF EXISTS class_instructors;
DROP TABLE IF EXISTS enrollments;
DROP TABLE IF EXISTS schedules;
DROP TABLE IF EXISTS classes;
DROP TABLE IF EXISTS courses;
DROP TABLE IF EXISTS semesters;
DROP TABLE IF EXISTS degree_list;
DROP TABLE IF EXISTS admins;
DROP TABLE IF EXISTS lecturers;
DROP TABLE IF EXISTS students;
DROP TABLE IF EXISTS users;
GO

-- 2) CORE ENTITIES

-- 2.1 users
CREATE TABLE users (
    user_id       VARCHAR(10)    NOT NULL PRIMARY KEY,
    username      VARCHAR(50)    NOT NULL,
    password_hash VARCHAR(255)   NOT NULL,
    full_name     VARCHAR(100)   NOT NULL,
    role          VARCHAR(20)    NOT NULL
                   CHECK(role IN ('student','lecturer','admin')),
    date_of_birth DATE            NULL,
    address       VARCHAR(255)   NULL,
    phone_number  VARCHAR(15)    NULL,
	email         VARCHAR(255)   NULL,
    created_at    DATETIME       NOT NULL DEFAULT GETDATE()
);
GO

CREATE TABLE students (
    student_id    VARCHAR(10)    NOT NULL PRIMARY KEY,
	CONSTRAINT fk_students_users   FOREIGN KEY(student_id)
        REFERENCES users(user_id)
        ON UPDATE CASCADE
        ON DELETE NO ACTION
);
GO

CREATE TRIGGER trg_only_insert_students
ON students
INSTEAD OF INSERT
AS
BEGIN
    INSERT INTO students (student_id)
    SELECT i.student_id
    FROM inserted i
    JOIN users u ON i.student_id = u.user_id
    WHERE u.role = 'student';
END;
GO

CREATE TABLE lecturers (
    lecturer_id    VARCHAR(10)    NOT NULL PRIMARY KEY,
	CONSTRAINT fk_lecturers_users   FOREIGN KEY(lecturer_id)
        REFERENCES users(user_id)
        ON UPDATE CASCADE
        ON DELETE NO ACTION
);
GO

CREATE TRIGGER trg_only_insert_lecturers
ON lecturers
INSTEAD OF INSERT
AS
BEGIN
    INSERT INTO lecturers (lecturer_id)
    SELECT i.lecturer_id
    FROM inserted i
    JOIN users u ON i.lecturer_id = u.user_id
    WHERE u.role = 'lecturer';
END;
GO

CREATE TABLE admins (
    admin_id    VARCHAR(10)    NOT NULL PRIMARY KEY,
	CONSTRAINT fk_admins_users   FOREIGN KEY(admin_id)
        REFERENCES users(user_id)
        ON UPDATE CASCADE
        ON DELETE NO ACTION
);
GO

CREATE TRIGGER trg_only_insert_admins
ON admins
INSTEAD OF INSERT
AS
BEGIN
    INSERT INTO admins (admin_id)
    SELECT i.admin_id
    FROM inserted i
    JOIN users u ON i.admin_id = u.user_id
    WHERE u.role = 'admin';
END;
GO

-- 2.2 semesters
CREATE TABLE semesters (
    semester_code VARCHAR(20) NOT NULL,
    year          INT         NOT NULL,
    CONSTRAINT pk_semesters PRIMARY KEY(semester_code,year)
);
GO

-- 2.3 courses
CREATE TABLE courses (
    course_code VARCHAR(10)  NOT NULL PRIMARY KEY,
    course_name VARCHAR(100) NOT NULL,
    credit      INT          NOT NULL,
    course_type CHAR(1)      NOT NULL
                 CHECK(course_type IN ('L','P','T'))
);
GO

-- 2.4 classes
CREATE TABLE classes (
    class_id           VARCHAR(15) NOT NULL PRIMARY KEY,
    course_code        VARCHAR(10) NOT NULL,
    semester_code      VARCHAR(20) NOT NULL,
    year               INT         NOT NULL,
    capacity           INT         NOT NULL,
    current_enrollment INT         NOT NULL DEFAULT 0,

    CONSTRAINT fk_classes_course   FOREIGN KEY(course_code)
        REFERENCES courses(course_code)
        ON UPDATE CASCADE
        ON DELETE NO ACTION,
    CONSTRAINT fk_classes_semester FOREIGN KEY(semester_code,year)
        REFERENCES semesters(semester_code,year)
        ON UPDATE CASCADE
        ON DELETE NO ACTION
);
GO

--2.5 degrees
CREATE TABLE degree_list (
	user_id         VARCHAR(10) NOT NULL PRIMARY KEY,
	degree          VARCHAR(35) NOT NULL,
	graduation_date DATETIME    NOT NULL,
	GPA             DECIMAL(2, 1) NOT NULL
	CONSTRAINT fk_degree_users FOREIGN KEY(user_id)
        REFERENCES users(user_id)
        ON UPDATE CASCADE
        ON DELETE NO ACTION
);
GO

-- 3) SCHEDULING & ENROLLMENT

-- 3.1 schedules
CREATE TABLE schedules (
    schedule_id VARCHAR(15) PRIMARY KEY,
    class_id    VARCHAR(15)         NOT NULL,
    room        VARCHAR(50)         NOT NULL,
    time_slot   VARCHAR(30)         NOT NULL,

    CONSTRAINT uq_schedules UNIQUE(class_id,room,time_slot),
    CONSTRAINT fk_schedules_class FOREIGN KEY(class_id)
        REFERENCES classes(class_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);
GO

-- 3.2 enrollments
CREATE TABLE enrollments (
    class_id    VARCHAR(15) NOT NULL,
    student_id  VARCHAR(10) NOT NULL,
    enrolled_at DATETIME    NOT NULL DEFAULT GETDATE(),
    grade       FLOAT       NULL,
    status      VARCHAR(20) NOT NULL
	CHECK(status IN ('enrolled','completed','dropped','failed')),

    CONSTRAINT pk_enrollments PRIMARY KEY(class_id,student_id),
    CONSTRAINT fk_enrollments_class   FOREIGN KEY(class_id)
        REFERENCES classes(class_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    CONSTRAINT fk_enrollments_student FOREIGN KEY(student_id)
        REFERENCES students(student_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);
GO

CREATE TABLE class_instructors (
    class_id      VARCHAR(15) NOT NULL,
    instructor_id VARCHAR(10) NOT NULL UNIQUE,
    role          VARCHAR(20) NOT NULL
                  CHECK(role IN ('primary','assistant')),
	semester_code VARCHAR(20) NOT NULL,
    year          INT         NOT NULL,
    CONSTRAINT pk_class_instructors PRIMARY KEY(class_id, semester_code, year),
    CONSTRAINT fk_ci_class      FOREIGN KEY(class_id)
        REFERENCES classes(class_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    CONSTRAINT fk_ci_instructor FOREIGN KEY(instructor_id)
        REFERENCES lecturers(lecturer_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
	CONSTRAINT fk_semesters_instructor FOREIGN KEY(semester_code, year)
        REFERENCES semesters(semester_code, year)
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
);

GO

-- 4) LEARNING MATERIALS & ACTIVITIES

-- 4.1 announcements
CREATE TABLE announcements (
    announcement_id VARCHAR(15)    NOT NULL,
	class_id        VARCHAR(15)    NOT NULL,
    title           VARCHAR(200)   NOT NULL,
    content         VARCHAR(MAX)   NOT NULL,
    posted_at       DATETIME       NOT NULL DEFAULT GETDATE()
 
	CONSTRAINT pk_announcement PRIMARY KEY(announcement_id,class_id),
    CONSTRAINT fk_ann_class     FOREIGN KEY(class_id)
        REFERENCES classes(class_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);
GO

-- 4.2 materials
CREATE TABLE materials (
    material_id   VARCHAR(15)    NOT NULL,
	course_code   VARCHAR(10)    NOT NULL,
    title         VARCHAR(200)   NOT NULL,
    description   VARCHAR(MAX)   NULL,
    file_path     VARCHAR(255)   NOT NULL,
    class_id      VARCHAR(15)    NOT NULL,
	CONSTRAINT pk_materials PRIMARY KEY(course_code,material_id),
    CONSTRAINT fk_mat_course       FOREIGN KEY(course_code)
        REFERENCES courses(course_code)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);
GO

-- 4.3 assignments
CREATE TABLE assignments (
    assignment_id INT            IDENTITY(1,1) PRIMARY KEY,
    title         VARCHAR(200)   NOT NULL,
    description   VARCHAR(MAX)   NULL,
	due_date      DATETIME       NULL,
    max_score     DECIMAL(3,1)   NOT NULL DEFAULT 10.0,
    created_at    DATETIME       NOT NULL DEFAULT GETDATE(),
    class_id      VARCHAR(15)    NOT NULL,

    CONSTRAINT fk_asg_class      FOREIGN KEY(class_id)
        REFERENCES classes(class_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);
GO

-- 4.4 submissions
CREATE TABLE submissions (
    assignment_id INT         NOT NULL,
    student_id    VARCHAR(10) NOT NULL,
    submitted_at  DATETIME    NOT NULL DEFAULT GETDATE(),
    content       VARCHAR(MAX) NULL,
    file_path     VARCHAR(255) NULL,
    score         DECIMAL(3,1) NULL,

    CONSTRAINT pk_submissions PRIMARY KEY(assignment_id,student_id),
    CONSTRAINT fk_sub_asg        FOREIGN KEY(assignment_id)
        REFERENCES assignments(assignment_id)
        ON UPDATE NO ACTION
        ON DELETE CASCADE,
    CONSTRAINT fk_sub_student    FOREIGN KEY(student_id)
        REFERENCES students(student_id)
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
);
GO

-- 4.5 attendance_records
CREATE TABLE attendance_records (
    schedule_id     VARCHAR(15)     NOT NULL,
    student_id      VARCHAR(10)     NOT NULL,
    attendance_date DATE            NOT NULL,
    status          VARCHAR(20)     NOT NULL
                       CHECK(status IN ('present','absent','late','excused')),
    recorded_by     VARCHAR(10)     NOT NULL,
    recorded_at     DATETIME        NOT NULL DEFAULT GETDATE(),

    CONSTRAINT pk_attendance PRIMARY KEY(schedule_id,student_id),
    CONSTRAINT fk_att_schedule     FOREIGN KEY(schedule_id)
        REFERENCES schedules(schedule_id)
        ON UPDATE NO ACTION
        ON DELETE CASCADE,
    CONSTRAINT fk_att_student      FOREIGN KEY(student_id)
        REFERENCES students(student_id)
        ON UPDATE NO ACTION
        ON DELETE CASCADE,
    CONSTRAINT fk_att_recorded_by  FOREIGN KEY(recorded_by)
        REFERENCES class_instructors(instructor_id)
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
);
GO

-- 4.6 tuition_payments
CREATE TABLE tuition_payments (
    payment_id     INT            IDENTITY(1,1) PRIMARY KEY,
    student_id     VARCHAR(10)    NOT NULL,
    semester_code  VARCHAR(20)    NOT NULL,
    year           INT            NOT NULL,
    amount         DECIMAL(10,2)  NOT NULL,
    payment_date   DATE           NOT NULL DEFAULT CONVERT(date,GETDATE()),
    payment_method VARCHAR(50)    NOT NULL,
    status         VARCHAR(20)    NOT NULL
                       CHECK(status IN ('paid','pending','failed','refunded')),
    receipt_number VARCHAR(50)    NULL,
	CONSTRAINT fk_tp_student  FOREIGN KEY(student_id)
        REFERENCES students(student_id)
        ON UPDATE NO ACTION
        ON DELETE CASCADE,
    CONSTRAINT fk_tp_semester FOREIGN KEY(semester_code,year)
        REFERENCES semesters(semester_code,year)
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
);
GO