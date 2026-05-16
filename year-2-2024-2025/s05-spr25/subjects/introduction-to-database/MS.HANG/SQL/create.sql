create database EmployeeManagement;
use EmployeeManagement;
-- drop database EmployeeManagement;
-- ---------------------------------------------------------
-- Bước 1 : TẠO BẢNG VÀ KHÓA CHÍNH
-- ---------------------------------------------------------

create table Department 
(
	DeptName 	nvarchar(30),
	DeptID 		int NOT NULL,
	DeptManager char(9),
	StartDate 	datetime,
	primary key (DeptID)
);

create table Employee 
(
	LastName 	nvarchar(30),
	MiddleName 	nvarchar(30),
	FirstName 	nvarchar(30),
	EmpID 		char(9) NOT NULL,
	DOB 		datetime,
	Address 	varchar(50),
	Gender 		nchar(6),
	Salary 		float,
	Supervisor 	char(9),
	DeptID 		int,
	primary key (EmpID)	
);

create table Dept_Location
(
	DeptID 		int NOT NULL,
	Location 	nvarchar(30) NOT NULL,
	primary key (DeptID, Location)
);

create table Task
(
	ProjectID	int NOT NULL,
	TaskNumber	int NOT NULL,
	TaskName 	varchar(50),
	primary key (ProjectID, TaskNumber)
);

create table Works_on 
(
	EmpID		char(9) NOT NULL,
	ProjectID 	int NOT NULL,
	TaskNumber	int NOT NULL, 
	WorkingHour	decimal(5,1),
	primary key (EmpID, ProjectID, TaskNumber)
);

create table Dependent 
(
	EmpID 			char(9) NOT NULL,
	DependentName 	nvarchar(30) NOT NULL,
	Gender 			nchar(6),
	DOB 			datetime,
	Relationship 	nvarchar(16),
	primary key (EmpID, DependentName)
);

create table Project 
(
	ProjectName nvarchar(30),
	ProjectID 	int NOT NULL,
	Location 	varchar(30),
	DeptID 		int,
	primary key (ProjectID)
);