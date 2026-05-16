-- Create Database 
CREATE DATABASE UnivsersityDB;
USE UnivsersityDB;

-- Create Tables
CREATE TABLE Courses (
	IdHP INT PRIMARY KEY IDENTITY(1,1),
	MaHP CHAR(100) NOT NULL UNIQUE,
	TenHP NVARCHAR(100) NOT NULL, 
)

CREATE TABLE Grades (
	MaDiem CHAR(100) NOT NULL PRIMARY KEY,
	MaSV CHAR(100) NOT NULL, 
	MaHP CHAR(100) REFERENCES Courses(MaHP),
	Diem DECIMAL(4, 2) NOT NULL 
		 CHECK (Diem BETWEEN 0 AND 10)
	
	CONSTRAINT FK_Grades_Students 
		FOREIGN KEY (MaHP) REFERENCES Courses(MaHP)
)

-- Insert Sample Data 
INSERT INTO dbo.Courses (MaHP, TenHP) VALUES
('DB001', 'Database Fundamentals'),
('DB002', 'Advanced Database Programming'),
('SE001', 'Introduction to Software Engineering'),
('NW001', 'Computer Networks');

INSERT INTO dbo.Grades (MaDiem, MaSV, Diem) VALUES
('D0001', 'SV001', 8.50),
('D0002', 'SV001', 7.75),
('D0003', 'SV002', 9.25),
('D0004', 'SV003', 6.00),
('D0005', 'SV004', 8.00)

-- Create Login 
CREATE LOGIN lect1 WITH PASSWORD = 'lec123@@@@';
CREATE LOGIN lect2 WITH PASSWORD = 'lec123@@@@';

CREATE LOGIN stud1 WITH PASSWORD = 'stud123@@@@';
CREATE LOGIN stud2 WITH PASSWORD = 'stud123@@@@';

-- Create User 
CREATE USER lect1 FOR LOGIN lect1;
CREATE USER lect2 FOR LOGIN lect2;

CREATE USER stud1 FOR LOGIN stud1;
CREATE USER stud2 FOR LOGIN stud2;

-- Create Role
CREATE ROLE GiaoVien;
CREATE ROLE SinhVien;

-- Add users to roles
ALTER ROLE GiaoVien ADD MEMBER lect1;
ALTER ROLE GiaoVien ADD MEMBER lect2; 
ALTER ROLE SinhVien ADD MEMBER stud1;
ALTER ROLE SinhVien ADD MEMBER stud2;

-- Grant Permissions to Roles
----- Can stud2 execute a SELECT statement on the Courses table? -> YES
GRANT SELECT ON Grades TO SinhVien;
GRANT SELECT ON Courses TO SinhVien;
DENY INSERT, DELETE, UPDATE ON Grades TO SinhVien;
----- Revoke the SELECT privilege on the Courses table from the role StudentRole -> NOW NO
REVOKE SELECT ON Courses FROM SinhVien;

EXECUTE AS USER = 'stud1';
PRINT USER_NAME();
INSERT INTO Grades VALUES ('D0001', 'SV001', 'DB001', 8.50); -- PERMISSION DENIED
REVERT;

----- Verify whether stud2 can still access the Courses table. 
EXECUTE AS USER = 'stud2';
PRINT USER_NAME();
SELECT * FROM Courses; 
REVERT;

----- Grant the SELECT privilege on the Courses table directly to user stud2.
GRANT SELECT ON Courses TO stud2;

----- Verify whether stud2 can execute a SELECT statement. 
EXECUTE AS USER = 'stud2';
PRINT USER_NAME();
SELECT * FROM Grades; 
REVERT;

GRANT SELECT, INSERT, DELETE, UPDATE ON Courses TO GiaoVien;
REVOKE INSERT, DELETE ON Grades FROM GiaoVien;

EXECUTE AS USER = 'lect1';
PRINT USER_NAME();
INSERT INTO Grades VALUES ('D0001', 'SV001', 'DB001', 8.50); -- PERMISSION DENIED
REVERT;