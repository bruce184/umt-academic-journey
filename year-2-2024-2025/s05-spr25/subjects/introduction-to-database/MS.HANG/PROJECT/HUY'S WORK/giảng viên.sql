-- 2. Bảng Teacher (Giảng viên)
CREATE TABLE Teacher (
    TeacherID VARCHAR(10) NOT NULL,
    Name VARCHAR(100) NULL,
    DoB DATE NULL,
    Phone_Number VARCHAR(15) NULL,
    DeptID VARCHAR(10) NULL, -- FK sẽ thêm sau
    PRIMARY KEY (TeacherID)
);