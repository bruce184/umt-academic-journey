-- Thêm khóa ngoại cho bảng Teacher
ALTER TABLE Teacher
ADD CONSTRAINT FK_Teacher_Department
FOREIGN KEY (DeptID) REFERENCES Department(DeptID);

-- Thêm khóa ngoại cho bảng Student
ALTER TABLE Student
ADD CONSTRAINT FK_Student_Department
FOREIGN KEY (DeptID) REFERENCES Department(DeptID);

-- Thêm khóa ngoại cho bảng Subject
ALTER TABLE Subject
ADD CONSTRAINT FK_Subject_Department -- Subject thuộc Department
FOREIGN KEY (DeptID) REFERENCES Department(DeptID);

-- Thêm khóa ngoại cho bảng Class
ALTER TABLE Class
ADD CONSTRAINT FK_Class_Teacher -- Teacher được gán cho Class (Assigned_to)
FOREIGN KEY (TeacherID) REFERENCES Teacher(TeacherID);

ALTER TABLE Class
ADD CONSTRAINT FK_Class_Subject -- Class thuộc Subject (Distribution)
FOREIGN KEY (ModuleID) REFERENCES Subject(ModuleID);

ALTER TABLE Class
ADD CONSTRAINT FK_Class_Semester -- Class thuộc Semester (Having)
FOREIGN KEY (SemID) REFERENCES Semester(SemID);

-- Thêm khóa ngoại cho bảng Registration
ALTER TABLE Registration
ADD CONSTRAINT FK_Registration_Student
FOREIGN KEY (StudentID) REFERENCES Student(StudentID);

ALTER TABLE Registration
ADD CONSTRAINT FK_Registration_Class
FOREIGN KEY (ClassID) REFERENCES Class(ClassID);

-- Thêm khóa ngoại cho bảng Prerequisites
ALTER TABLE Prerequisites
ADD CONSTRAINT FK_Prerequisites_Subject -- Môn học gốc
FOREIGN KEY (Subject_ModuleID) REFERENCES Subject(ModuleID);

ALTER TABLE Prerequisites
ADD CONSTRAINT FK_Prerequisites_PrereqSubject -- Môn học tiên quyết
FOREIGN KEY (Prerequisite_ModuleID) REFERENCES Subject(ModuleID);

ALTER TABLE Subject
ADD CONSTRAINT FK_Subject_Teacher_Role -- Tên của ràng buộc khóa ngoại
FOREIGN KEY (TeacherID) REFERENCES Teacher(TeacherID);