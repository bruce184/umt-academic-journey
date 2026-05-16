-- 7. Bảng Registration (Đăng ký - Bảng nối Student-Class 'Distribution')
CREATE TABLE Registration (
    StudentID VARCHAR(15) NOT NULL, 
    ClassID VARCHAR(15) NOT NULL,   
    Grade DECIMAL(4,2) NULL,
    Status VARCHAR(50) NULL,
    PRIMARY KEY (StudentID, ClassID) 
);