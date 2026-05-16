-- INSERT INTO Instructor(Instructor_id, Instructor_Name) 
-- VALUES ('001', 'Huy Hoang') 

INSERT INTO department(department_id, department_Name, office) 
VALUES ('tech', 'technology', '311');

-- UPDATE instructor SET salary = 100000 WHERE Instructor_id = '1002';
UPDATE instructor SET department_id = 'TECH' WHERE Instructor_id = '100';

-- DELETE FROM instructor WHERE Instructor_Id = '1001';
-- SELECT *FROM instructor;
SELECT *FROM  department;
DELETE FROM department WHERE department_Id = 'tech'