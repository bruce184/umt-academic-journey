-- 6. Bảng Class (Lớp học)
CREATE TABLE Class (
    ClassID VARCHAR(15) NOT NULL,
    Capacity INT NULL,
    `Time slot` VARCHAR(50) NULL,
    `Day of the week` VARCHAR(10) NULL,
    Room VARCHAR(20) NULL,
    `Number of students` INT NULL,
    TeacherID VARCHAR(10) NULL, 
    Teacher_Role VARCHAR(50) NULL,
    ModuleID VARCHAR(10) NULL,
    SemID VARCHAR(10) NULL,       
    PRIMARY KEY (ClassID)
);