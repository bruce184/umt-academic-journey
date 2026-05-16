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