CREATE DATABASE university_management;
USE university_management;

-- 1. Bảng Department
CREATE TABLE Department (
    DeptID VARCHAR(10) NOT NULL,
    DeptName VARCHAR(255) NULL,
    PRIMARY KEY (DeptID)
);

-- 2. Bảng Teacher (Giảng viên) -- THIẾU IsInstructor, IsAssistants
CREATE TABLE Teacher (
    TeacherID VARCHAR(10) NOT NULL,
    Name VARCHAR(100) NULL,
    DoB DATE NULL,
    Phone_Number VARCHAR(15) NULL,
    DeptID VARCHAR(10) NULL, -- FK sẽ thêm sau
    PRIMARY KEY (TeacherID)
);

-- 3. Bảng Student (Sinh viên)
CREATE TABLE Student (
    StudentID VARCHAR(15) NOT NULL,
    Name VARCHAR(100) NULL,
    DoB DATE NULL,
    Phone_Number VARCHAR(15) NULL,
    Address VARCHAR(255) NULL,
    DeptID VARCHAR(10) NULL, -- FK sẽ thêm sau
    PRIMARY KEY (StudentID)
);

-- 4. Bảng Subject (Môn học) --- THIẾU THUỘC TÍNH PREREQUISTES, VẪN CÓ THUỘC TÍNH ROE
CREATE TABLE Subject (
    ModuleID VARCHAR(10) NOT NULL,
    Credit INT NULL,             -- Giả sử dùng Credit, bỏ qua NoE
    DeptID VARCHAR(10) NULL,     -- FK Department (Belongs_to) sẽ thêm sau
    PRIMARY KEY (ModuleID)
);

-- 5. Bảng Semester (Học kỳ) -- THIẾU PK: CẢ 2 MỚI ĐÚNG 
CREATE TABLE Semester (
    SemID VARCHAR(10) NOT NULL,
    Year INT NULL,
    PRIMARY KEY (SemID)
);

-- 6. Bảng Class (Lớp học) -- THIẾU NHIỀU QUÁ 
CREATE TABLE Class (
    ClassID VARCHAR(15) NOT NULL,
    Capacity INT NULL,
    `Time slot` VARCHAR(50) NULL,
    `Day of the week` VARCHAR(10) NULL,
    Room VARCHAR(20) NULL,
    `Number of students` INT NULL,
    TeacherID VARCHAR(10) NULL,   -- FK thêm sau 
    Teacher_Role VARCHAR(50) NULL, -- SAI -> THÀNH BẢNG MỚI (N:N) - BẢNG THỨ 9
    ModuleID VARCHAR(10) NULL,    -- FK thêm sau 
    SemID VARCHAR(10) NULL,       -- FK thêm sau; THIẾU (XEM BẢNG Semester)
    PRIMARY KEY (ClassID)
);

-- 7. Bảng Registration (Đăng ký - Bảng nối Student-Class 'Distribution')
CREATE TABLE Registration ( -- ĐỔI TÊN THÀNH 'Enrolls'
    StudentID VARCHAR(15) NOT NULL, 
    ClassID VARCHAR(15) NOT NULL,   
    Grade DECIMAL(4,2) NULL,
    Status VARCHAR(50) NULL,
    PRIMARY KEY (StudentID, ClassID) 
);

-- 8. Bảng Prerequisites (Môn tiên quyết - Bảng nối Subject-Subject)
CREATE TABLE Prerequisites (
    Subject_ModuleID VARCHAR(10) NOT NULL,
    Prerequisite_ModuleID VARCHAR(10) NOT NULL,
    PRIMARY KEY (Subject_ModuleID, Prerequisite_ModuleID)
);

-- 10. THIẾU BẢNG 'Schedule' cho Multivalued Attribute 'Room'
