-- Assignment 7 - Gom nhóm
-- Câu 7
/*Với mỗi nhân viên:
		  tham gia trên 2 đề án, 
cho biết: họ tên nhân viên (E), 
		  họ tên quản lý, 
          họ tên trưởng phòng của nhân viên*/
SELECT E.EMPID, CONCAT(E.LASTNAME, ' ', E.MIDDLENAME, ' ', E.FIRSTNAME) AS EMP_FULLNAME,
       CONCAT(M.LASTNAME, ' ', M.MIDDLENAME, ' ', M.FIRSTNAME) AS MNG_FULLNAME,
       CONCAT(H.LASTNAME, ' ', H.MIDDLENAME, ' ', H.FIRSTNAME) AS HEAD_FULLNAME,
	   COUNT(DISTINCT W.PROJECTID) AS COUNT_PRJ
FROM EMPLOYEE E JOIN WORKS_ON W ON E.EMPID = W.EMPID -- LẤY RA NHÂN VIÊN THAM GIA DỰ ÁN
				JOIN EMPLOYEE M ON M.EMPID = E.SUPERVISOR -- LẤY RA M LÀ NGƯỜI QUẢN LÝ E
                JOIN DEPARTMENT D ON D.DEPTID = E.DEPTID -- LẤY RA PHÒNG D MÀ E THUỘC VỀ
                JOIN EMPLOYEE H ON H.EMPID = D.DEPTMANAGER -- LẤY TRƯỞNG PHÒNG H CỦA PHÒNG D
GROUP BY E.EMPID
HAVING COUNT(DISTINCT W.PROJECTID) > 2;


/*DEMO: GROUPING AND AGGREGATION FUNCTION 
Aggregate Function: (HÀM KẾT HỢP)
   Min(A), Max(A), Avg(A), Sum(A) return the min, max, avg, and sum of the column/attribute A, respectively.
   Count(*) return the number of rows.
   Count(A) and Count(Distinct A) return the number of values A and distinct values A, respectively.
Syntax:
	SELECT ... 
    FROM ... 
    WHERE <conditions for row filtering>
    GROUP BY colA, colB, ..., col -- Group rows which have the same values on colA, ..., colN.
    HAVING <condition for group filtering>
	ORDER BY ...

Aggregation function will be applied on each group.

Note [Important]: An attribute used in HAVING, ORDER BY, or SELECT (executed after GROUP BY): 
	- SHOULD be EITHER declared in GROUP BY statement
    - OR, used as a parameter in an aggregation function.
*/
-- All rows of the resulting table are in one unique group.
-- In HAVING, ORDER BY, or SELECT statements, an attribute/column must be used with an aggregation function.
-- Number of group = 1.
SELECT SUM(SALARY), MIN(SALARY), MAX(SALARY), AVG(SALARY)
FROM EMPLOYEE;

SELECT COUNT(*) Nb_Emp, COUNT(DISTINCT SUPERVISOR) Nb_Supervisor, COUNT(SUPERVISOR) Nb_NonNull
FROM EMPLOYEE;

-- Rows with the same value of DEPTID will be placed in one group
-- Number of group = Number of different DEPTID values.
SELECT DEPTID, SUM(SALARY) sumSalary, MIN(SALARY) minSalary, MAX(SALARY) maxSalary, AVG(SALARY) avgSalary
FROM EMPLOYEE
GROUP BY DEPTID;

-- Calculate the salaries of each department (gender don't matter) 
SELECT E.DEPTID, D.DEPTNAME, SUM(SALARY), MIN(SALARY), MAX(SALARY), AVG(SALARY)
FROM EMPLOYEE E JOIN DEPARTMENT D ON E.DEPTID = D.DEPTID
GROUP BY DEPTID;

-- Rows with the same values of (DEPTID, DEPTNAME, GENDER) will be placed in one group
-- Number of group = Number of different combinations of (DEPTID, DEPTNAME, GENDER)
-- Like the above but gender matter
SELECT E.DEPTID, D.DEPTNAME, E.GENDER, SUM(SALARY), MIN(SALARY), MAX(SALARY), AVG(SALARY)
FROM EMPLOYEE E JOIN DEPARTMENT D ON E.DEPTID = D.DEPTID
GROUP BY DEPTID, D.DEPTNAME, E.GENDER;

SELECT E.DEPTID, D.DEPTNAME, SUM(SALARY), MIN(SALARY), MAX(SALARY), AVG(SALARY)
FROM EMPLOYEE E JOIN DEPARTMENT D ON E.DEPTID = D.DEPTID
GROUP BY DEPTID, D.DEPTNAME
HAVING AVG(SALARY) BETWEEN 30000 AND 50000;

SELECT E.EMPID, E.LASTNAME, COUNT(DISTINCT PROJECTID) AS NB_PRO, 
							COUNT(TASKNUMBER) AS NB_TASK
FROM EMPLOYEE E JOIN WORKS_ON W ON E.EMPID = W.EMPID
GROUP BY E.EMPID, E.LASTNAME
ORDER BY COUNT(TASKNUMBER) DESC, E.EMPID;


/* List the employee ID, last name, first name, 
and the number of projects managed by the 'Điều hành' department 
that the employee has participated in. */
SELECT E.EMPID, E.LASTNAME, E.MIDDLENAME, E.FIRSTNAME, 
	  COUNT(DISTINCT W.PROJECTID) AS COUNT_PROJECT
FROM EMPLOYEE E JOIN WORKS_ON W ON E.EMPID = W.EMPID
			   JOIN PROJECT P ON W.PROJECTID = P.PROJECTID
			   JOIN DEPARTMENT D ON D.DEPTID = P.DEPTID
WHERE DEPTNAME = 'Điều hành'
GROUP BY E.EMPID;
   

/* DEMO: NESTED QUERY */

/*Subquery with Comparison Operator.
	where colA = (select X from ...)
    X: single value having the same data type with colA.
*/
-- Find employees who have the highest salary (Solution #1).
SELECT E.EMPID, E.LASTNAME, E.SALARY 
FROM EMPLOYEE E
WHERE E.SALARY = (SELECT MAX(SALARY) FROM EMPLOYEE);
-- Find employees who have the highest salary (Solution #2).
-- Find employees who have the highest salary (Solution #3).


-- Find the employees whose salary is greater than the salary of any employee in department number 5
SELECT E.EMPID, E.LASTNAME, E.SALARY
FROM EMPLOYEE E
WHERE E.SALARY > ANY (SELECT SALARY -- MỨC LƯƠNG NHÂN VIÊN PHÒNG 5
				  FROM EMPLOYEE 
                  WHERE DEPTID = 5);

SELECT E.EMPID, E.LASTNAME, E.SALARY 
FROM EMPLOYEE E
WHERE E.SALARY > ANY (SELECT SALARY FROM EMPLOYEE 
				      WHERE EMPID = '005' OR EMPID = '003');                 
                      
/*Subquery with IN or NOT IN Operator.
	colA IN (select X from ...): True if colA is equal to any value in X.
    colA NOT IN (select X from ...): True if colA is not equal to any value in X.
    X: single column having the same data type with colA. */
    
SELECT E.EMPID, E.LASTNAME, E.SALARY -- Find employees who are managers of the department.
FROM EMPLOYEE E
WHERE E.EMPID IN (SELECT DEPTMANAGER FROM DEPARTMENT);
-- <=> E.EMPID = ANY (SELECT DEPTMANAGER FROM DEPARTMENT)

SELECT E.EMPID, E.LASTNAME, E.SALARY -- Find employees who are managers of the department.
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

SELECT E.EMPID, E.LASTNAME, E.SALARY -- Find employees who have the highest salary.
FROM EMPLOYEE E
WHERE NOT EXISTS (SELECT * FROM EMPLOYEE E2 WHERE E2.SALARY > E.SALARY);

-- Example: Find employees who have the highest salary of each department.
SELECT E.DEPTID, E.EMPID, E.LASTNAME, E.SALARY
FROM EMPLOYEE E
WHERE E.SALARY >= ALL(SELECT E2.SALARY 
					  FROM EMPLOYEE E2
                      WHERE E2.DEPTID = E.DEPTID);

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
SELECT E.EMPID, (YEAR(curdate()) - YEAR(E.DOB)) AGE
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
SELECT E.EMPID, CONCAT(E.LASTNAME, ' ', E.MIDDLENAME, ' ', E.FIRSTNAME) FULLNAME, COUNT(DISTINCT W.PROJECTID)
FROM EMPLOYEE E JOIN WORKS_ON W ON E.EMPID = W.EMPID
			    JOIN PROJECT P ON W.PROJECTID = W.PROJECTID
WHERE P.DEPTID = 4
GROUP BY E.EMPID
HAVING COUNT(DISTINCT W.PROJECTID) = (SELECT COUNT(*) FROM PROJECT WHERE DEPTID = 4);

/* PRACTICE: */
--  9. List the name of the department that has the fewest employees.
SELECT dept.deptname, count(distinct e.empid) as NB_EMP
FROM employee e JOIN department dept ON e.deptid = dept.deptid
GROUP BY dept.deptname
HAVING count(distinct e.empid) <= ALL (	SELECT count(distinct e.empid) as NB_EMP
										FROM employee e JOIN department dept ON e.deptid = dept.deptid
										GROUP BY dept.deptname);


-- 10. List the location that has the highest number of departments located there.
SELECT loca.location, count(loca.deptid) AS NB_DEPT
FROM dept_location loca
GROUP BY loca.location
HAVING count(loca.deptid) >= ALL (	SELECT count(loca.deptid) AS NB_DEPT
									FROM dept_location loca 
									GROUP BY loca.location);


-- 11. List the full name of the employee who has the most dependents.
SELECT concat(e.lastname, " ", e.middlename, " ", e.firstname, " ") AS Fullname, count(*) AS NB_DEPENDENT
FROM employee e JOIN dependent de ON e.empid = de.empid
GROUP BY e.empid
HAVING count(*) >= ALL (	SELECT count(*) AS NB_DEPENDENT
							FROM dependent de 
							GROUP BY de.empid);

-- 12. List the name and code of the project that has the highest number of tasks.
SELECT p.projectname, p.projectid, count(t.projectid) AS NB_TASKS
FROM project p JOIN task t ON p.projectid = t.projectid
GROUP BY p.projectid
HAVING count(t.projectid) >= ALL (	SELECT count(t.projectid) AS NB_TASKS
									FROM task t 
									GROUP BY t.projectid);


-- 13. List the employee who has participated in the highest number of tasks.
SELECT wk.empid, count(distinct wk.tasknumber) AS NB_TASK
FROM works_on wk JOIN task t ON wk.projectid = t.projectid
GROUP BY wk.empid
HAVING  count(distinct wk.tasknumber) = (
	SELECT MAX(task_count)
    FROM (
        SELECT COUNT(DISTINCT wk2.tasknumber) AS task_count
        FROM works_on wk2 JOIN task t2 ON wk2.projectid = t2.projectid
        GROUP BY wk2.empid
    ) AS sub
);


-- 14. List the employee who has participated in the highest number of projects.
SELECT e.empid, count(distinct wk.projectid) as NB_PROJECT
FROM works_on wk JOIN employee e ON wk.empid = e.empid 
GROUP BY e.empid 
HAVING count(distinct wk.projectid) >= ALL (	SELECT count(distinct wk.projectid) as NB_PROJECT
												FROM works_on wk 
												GROUP BY wk.empid);

-- 15. List the project with the fewest employees participating in it.
SELECT w.projectid, COUNT(DISTINCT w.empid) AS NB_EMP
FROM works_on w
GROUP BY w.projectid
HAVING COUNT(DISTINCT w.empid) = (
    SELECT MIN(emp_count)
    FROM (
        SELECT COUNT(DISTINCT w2.empid) AS emp_count
        FROM works_on w2
        GROUP BY w2.projectid
    ) AS subq
);

SELECT w.projectid, COUNT(DISTINCT w.empid) AS NB_EMP
FROM works_on w
GROUP BY w.projectid
HAVING COUNT(DISTINCT w.empid) <= ALL (	SELECT COUNT(DISTINCT w.empid) AS NB_EMP
										FROM works_on w
										GROUP BY w.projectid
);


