CREATE TABLE Instructor(
	Instructor_Id Char(5) Primary key, 
    Instructor_Name VARCHAR(150) NOT NULL,
    department_id VARCHAR(5),
    salary INT DEFAULT 1000
    
);
CREATE TABLE Department (
	department_id VARCHAR(5) PRIMARY KEY,
    department_Name VARCHAR(50) NOT NULL,
    office VARCHAR(5),
    department_head varchar(5),
    FOREIGN KEY(department_head) REFERENCES  Instructor(Instructor_Id)
);

ALTER TABLE Instructor
ADD FOREIGN KEY (department_id) REFERENCES Department(department_id);

CREATE TABLE Course(
	course_id char(5) Primary Key, 
    course_name VARCHAR(50) NOT NULL UNIQUE,
    credit INT CHECK (credit between 3 and 5),
	department_id VARCHAR(5),
    FOREIGN KEY (department_id) REFERENCES Department(department_id)
);
CREATE TABLE Section(
	course_id char(5) NOT NULL,
    semester VARCHAR(5) NOT NULL, 
    year INT NOT NULL,
    PRIMARY KEY (course_id,semester,year)    
);
CREATE TABLE Teaching(
	course_id char(5) NOT NULL,
    FOREIGN KEY (course_id) REFERENCES Course(course_id),
	semester VARCHAR(5) NOT NULL, 
	year INT NOT NULL,
	instructor_Id CHAR(5) NOT NULL, 
	role varchar(10),
	PRIMARY KEY (course_id,semester,year,instructor_Id),
    FOREIGN KEY (instructor_Id) REFERENCES Instructor(instructor_Id),
	FOREIGN KEY (course_id,semester,year) REFERENCES Section(course_id,semester,year)
);

CREATE TABLE PhongBan(
	department_id VARCHAR(5) PRIMARY KEY,
    departmen_Name VARCHAR(50) NOT NULL,
    office VARCHAR(5)
);

ALTER TABLE PhongBan
-- 	ADD EMAIL VARCHAR(100),
    DROP COLUMN PHONE,
    ADD PHONEEXT VARCHAR(10);
    