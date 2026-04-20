-- db/init.sql
-- Tạo database và 2 bảng với quan hệ 1-1

CREATE DATABASE IF NOT EXISTS companydb;
USE companydb;

-- Bảng employees (thông tin chung)
CREATE TABLE IF NOT EXISTS employees (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    position VARCHAR(100) NOT NULL
);

-- Bảng employee_details (thông tin chi tiết, 1-1 với employees)
CREATE TABLE IF NOT EXISTS employee_details (
    id INT PRIMARY KEY,
    salary DECIMAL(10,2) NOT NULL,
    address VARCHAR(255) NOT NULL,
    CONSTRAINT fk_employee_details_employee
        FOREIGN KEY (id) REFERENCES employees(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

-- Sample data (tùy chọn)
INSERT INTO employees (name, position) VALUES
('Alice Nguyen', 'Software Engineer'),
('Bob Tran', 'Project Manager'),
('Charlie Le', 'HR Specialist'),
('Duyen Pham', 'QA Engineer'),
('Minh Hoang', 'DevOps Engineer');

INSERT INTO employee_details (id, salary, address) VALUES
(1, 2500.00, '123 Nguyen Trai, District 5, HCMC'),
(2, 3500.00, '456 Le Loi, District 1, HCMC'),
(3, 3000.00, '234 Vo Van Tan, District 3, HCMC'),
(4, 1800.00, '789 Tran Hung Dao, District 3, HCMC'),
(5, 4200.00, '321 Pham Ngu Lao, District 1, HCMC');
