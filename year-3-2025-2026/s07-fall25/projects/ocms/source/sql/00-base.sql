-- Base(department,users,accounts,profiles,audit-log)

-- =========================================
-- B1. DEPARTMENTS
-- =========================================
CREATE TABLE IF NOT EXISTS departments (
    department_id   SERIAL PRIMARY KEY,
    department_name VARCHAR(100) NOT NULL UNIQUE
);

-- =========================================
-- B2. USERS (thông tin chung)
-- =========================================
CREATE TABLE IF NOT EXISTS users (
    user_id       SERIAL PRIMARY KEY,
    department_id INT REFERENCES departments(department_id),
    full_name     VARCHAR(100) NOT NULL,
    dob           DATE,
    gender        VARCHAR(10),
    email         VARCHAR(255) NOT NULL UNIQUE,
    phone         VARCHAR(20),
    avatar_url    TEXT,
    is_active     BOOLEAN NOT NULL DEFAULT TRUE,
    locale        VARCHAR(10) DEFAULT 'vi_VN'
);

-- =========================================
-- B3. ACCOUNTS (login)
-- =========================================
CREATE TABLE IF NOT EXISTS accounts (
    user_name  VARCHAR(50) PRIMARY KEY,
    user_id    INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    password   VARCHAR(255) NOT NULL,      -- hash ở tầng ứng dụng
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    user_role  VARCHAR(50) NOT NULL        -- 'STUDENT','LECTURER','ADMIN',...
);

-- =========================================
-- B4. STUDENT / LECTURER / STAFF PROFILES
-- =========================================
CREATE TABLE IF NOT EXISTS students (
    user_id     INT PRIMARY KEY
                REFERENCES users(user_id) ON DELETE CASCADE,
    cohort_year INT,
    major       VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS lecturers (
    user_id         INT PRIMARY KEY
                    REFERENCES users(user_id) ON DELETE CASCADE,
    salary          NUMERIC(12,2),
    specialization  VARCHAR(100),
    employment_type VARCHAR(50)             -- full-time, part-time,...
);

CREATE TABLE IF NOT EXISTS staff (
    user_id   INT PRIMARY KEY
              REFERENCES users(user_id) ON DELETE CASCADE,
    salary    NUMERIC(12,2),
    hire_date DATE,
    end_date  DATE,
    position  VARCHAR(100)
);

-- =========================================
-- B5. AUDIT LOG
-- (Giả định: dùng log_id bigserial cho dễ trigger)
-- =========================================
CREATE TABLE IF NOT EXISTS audit_logs (
    log_id       BIGSERIAL PRIMARY KEY,
    user_id      INT REFERENCES users(user_id),
    action_type  VARCHAR(20) NOT NULL,     -- 'INSERT','UPDATE','DELETE'
    entity       VARCHAR(50) NOT NULL,     -- tên bảng
    description  TEXT,
    log_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
