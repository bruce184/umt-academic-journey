-- 4. Bảng Subject (Môn học)
CREATE TABLE Subject (
    ModuleID VARCHAR(10) NOT NULL,
    Credit INT NULL,             -- Giả sử dùng Credit, bỏ qua NoE
    DeptID VARCHAR(10) NULL,     -- FK Department (Belongs_to) sẽ thêm sau
    PRIMARY KEY (ModuleID)
);
ALTER TABLE Subject
ADD COLUMN TeacherID VARCHAR(10) NULL;