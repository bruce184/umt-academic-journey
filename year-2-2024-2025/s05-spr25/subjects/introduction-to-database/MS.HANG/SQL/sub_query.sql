USE employeemanagement;

/* DEMO: NESTED QUERY */

-- ---------------------- EXERCISE 1 ------------------------
/*Subquery with Comparison Operator.
	where colA = (select X from ...)
    X: single value having the same data type with colA.
*/
-- Solution #1.
SELECT E.EMPID, E.LASTNAME, E.SALARY 
FROM EMPLOYEE E
WHERE E.SALARY = (SELECT MAX(SALARY) FROM EMPLOYEE);

-- Solution #2.
SELECT E.EMPID, E.LASTNAME, E.SALARY
FROM EMPLOYEE E
WHERE E.SALARY > ALL (
    SELECT E2.SALARY
    FROM EMPLOYEE E2
    WHERE E2.SALARY <> E.SALARY
);

-- Solution #3.
SELECT E.EMPID, E.LASTNAME, E.SALARY
FROM EMPLOYEE E
WHERE NOT EXISTS (
    SELECT 1 
    FROM EMPLOYEE E2 
    WHERE E2.SALARY > E.SALARY
);


-- ---------------------- EXERCISE 2 ------------------------
-- Find the employees whose salary is greater than the salary 
-- of any employee in department number 5
-- --- Solution #1 --- 
SELECT E.EMPID, E.LASTNAME, E.SALARY
FROM EMPLOYEE E
WHERE E.SALARY > ANY (SELECT SALARY -- MỨC LƯƠNG NHÂN VIÊN PHÒNG 5
				  FROM EMPLOYEE 
                  WHERE DEPTID = 5);
-- --- Solution #2 --- 
SELECT E.EMPID, E.LASTNAME, E.SALARY 
FROM EMPLOYEE E
WHERE E.SALARY > ANY (SELECT SALARY FROM EMPLOYEE 
				      WHERE EMPID = '005' OR EMPID = '003');                 
       
       
/*Subquery with IN or NOT IN Operator.
	colA IN (select X from ...): True if colA is equal to any value in X.
    colA NOT IN (select X from ...): True if colA is not equal to any value in X.
    X: single column having the same data type with colA. */
-- Find employees who are managers of the department. --
-- --- Solution #1 --- 
SELECT E.EMPID, E.LASTNAME, E.SALARY 
FROM EMPLOYEE E
WHERE E.EMPID IN (SELECT DEPTMANAGER FROM DEPARTMENT);
-- <=> E.EMPID = ANY (SELECT DEPTMANAGER FROM DEPARTMENT)

-- --- Solution #2: Find those aren't --- 
SELECT E.EMPID, E.LASTNAME, E.SALARY 
FROM EMPLOYEE E
WHERE E.EMPID NOT IN (SELECT DEPTMANAGER FROM DEPARTMENT);
-- E.EMPID <> ALL (SELECT DEPTMANAGER FROM DEPARTMENT);
    
    
/*Subquery with Comparison Operator and ALL/SOME/ANY.
	colA > ALL (select X from ...): True if colA is greater than every value in X.
    colA > SOME | ANY (select X from ...): True if colA is greater than at least one value in X.
    X: single column having the same data type with colA. */
SELECT E.EMPID, E.LASTNAME, E.SALARY -- Find employees who have the highest salary.
FROM EMPLOYEE E
WHERE E.SALARY >= ALL(SELECT SALARY FROM EMPLOYEE);


/*Subquery with EXISTS or NOT EXISTS Operator.
	exists (select * from ...): True if the subquery return at least one row.
    not exists (select * from ...): True if the subquery return nothing. */
-- Find employees who have the highest salary --
SELECT E.EMPID, E.LASTNAME, E.SALARY 
FROM EMPLOYEE E
WHERE NOT EXISTS (SELECT * FROM EMPLOYEE E2 WHERE E2.SALARY > E.SALARY);

-- Find employees who have the highest salary of each department.
-- --- Solution #1 --- 
SELECT E.DEPTID, E.EMPID, E.LASTNAME, E.SALARY
FROM EMPLOYEE E
WHERE E.SALARY >= ALL(SELECT E2.SALARY 
					  FROM EMPLOYEE E2
                      WHERE E2.DEPTID = E.DEPTID);
-- --- Solution #2 --- 
SELECT E.DEPTID, E.EMPID, E.LASTNAME, E.SALARY
FROM EMPLOYEE E
WHERE E.SALARY = (SELECT MAX(E2.SALARY) 
					  FROM EMPLOYEE E2
                      WHERE E2.DEPTID = E.DEPTID);

SELECT E.EMPID, E.LASTNAME, E.SALARY
FROM EMPLOYEE E
WHERE NOT EXISTS (SELECT * FROM EMPLOYEE E2 
				  WHERE E2.SALARY > E.SALARY AND E2.DEPTID = E.DEPTID);


SELECT CURRENT_DATE, DAY(CURRENT_DATE), YEAR(CURRENT_DATE), 
	   timestampdiff(Day, '2024-03-18', CURRENT_DATE);



-- DEMO: 
-- 1. For departments with an average salary above 30.000, 
--    retrieve the department names and the number of employees in each department.
SELECT D.DEPTNAME, COUNT(E.EMPID) AS NB_EMP, AVG(E.SALARY) AS AVG_SALARY
FROM DEPARTMENT D JOIN EMPLOYEE E ON D.DEPTID = E.DEPTID
GROUP BY D.DEPTID
HAVING AVG(E.SALARY) > 32000;


-- 2. Retrieve the full names of employees whose salary is above the average salary of the 'Điều hành' department.
SELECT CONCAT(E.LASTNAME, ' ', E.MIDDLENAME, ' ', E.FIRSTNAME) FULLNAME
FROM EMPLOYEE E
WHERE E.SALARY > (SELECT AVG(E.SALARY)
				  FROM EMPLOYEE E JOIN DEPARTMENT D ON E.DEPTID = D.DEPTID
                  WHERE D.DEPTNAME = 'Điều hành');


-- 3.Retrieve the ID and age of employees who are involved in the largest number of projects.
SELECT E.EMPID, (YEAR(curdate()) - YEAR(E.DOB)) as AGE
FROM EMPLOYEE E JOIN WORKS_ON W ON E.EMPID = W.EMPID
GROUP BY E.EMPID
HAVING COUNT(DISTINCT W.PROJECTID) >= ALL (SELECT COUNT(DISTINCT W.PROJECTID)
										   FROM WORKS_ON W
										   GROUP BY W.EMPID);


-- 4.Retrieve the ID and names of departments with the smallest number of employees.
SELECT D.DEPTID, D.DEPTNAME, COUNT(*) AS NB_EMP -- count(e.empid) = count(*) = count(distinct e.empid)
FROM DEPARTMENT D JOIN EMPLOYEE E ON D.DEPTID = E.DEPTID
GROUP BY D.DEPTID
HAVING COUNT(*) <= ALL (SELECT COUNT(*) FROM EMPLOYEE E
						GROUP BY E.DEPTID);


-- 5.List the ID and name of employees who work on every project of the company.
SELECT E.EMPID, CONCAT(E.LASTNAME, ' ', E.MIDDLENAME, ' ', E.FIRSTNAME) FULLNAME
FROM EMPLOYEE E JOIN WORKS_ON W ON E.EMPID = W.EMPID
GROUP BY E.EMPID
HAVING COUNT(DISTINCT W.PROJECTID) = (SELECT COUNT(*) FROM PROJECT);


-- 6.List the ID and name of employees assigned to all projects led by department number 4.
SELECT E.EMPID, CONCAT(E.LASTNAME, ' ', E.MIDDLENAME, ' ', E.FIRSTNAME) FULLNAME,
				COUNT(DISTINCT W.PROJECTID), E.DEPTID
FROM EMPLOYEE E JOIN WORKS_ON W ON E.EMPID = W.EMPID
			    JOIN PROJECT P ON W.PROJECTID = W.PROJECTID
WHERE P.DEPTID = 4
GROUP BY E.EMPID
HAVING COUNT(DISTINCT W.PROJECTID) = (SELECT COUNT(*) FROM PROJECT WHERE DEPTID = 4);

SELECT * FROM PROJECT