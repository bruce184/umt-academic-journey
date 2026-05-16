use employeemanagement;

-- ----------- PRACTICE ---------- 
-- 9. List the name of the department that has the fewest employees.
 SELECT  D.DEPTID, D.DEPTNAME, COUNT(*) AS NB_EMP 
 FROM EMPLOYEE E JOIN DEPARTMENT D ON E.DEPTID = D.DEPTID 
 GROUP BY D.DEPTID
 HAVING COUNT(*) <= ALL (SELECT COUNT(*) FROM EMPLOYEE E
						GROUP BY E.DEPTID);
 
 -- 10. List the location that has the highest number of departments located there.
SELECT LO.LOCATION, COUNT(*) AS NB_DEPARTMENT
FROM DEPARTMENT D JOIN DEPT_LOCATION LO ON D.DEPTID = LO.DEPTID
GROUP BY LO.LOCATION
HAVING COUNT(*) > ALL (	SELECT COUNT(*) AS NB_DEPARTMENT
						FROM DEPARTMENT D 
						GROUP BY D.DEPTID ) ;

-- 11. List the full name of the employee who has the most dependents.
SELECT CONCAT(E.LASTNAME, ' ', E.MIDDLENAME, ' ', E.FIRSTNAME) AS FULLNAME, COUNT(*) AS NB_DEPENDENT
FROM EMPLOYEE E JOIN DEPENDENT DP ON E.EMPID = DP.EMPID 
GROUP BY E.EMPID
HAVING COUNT(*) > ALL (	SELECT COUNT(*) AS NB_DEPENDENT
						FROM DEPENDENT DP
						GROUP BY DP.EMPID );

-- 12. List the name and code of the project that has the highest number of tasks.


-- 13. List the employee who has participated in the highest number of tasks.


-- 14. List the employee who has participated in the highest number of projects.


-- 15. List the project with the fewest employees participating in it.
