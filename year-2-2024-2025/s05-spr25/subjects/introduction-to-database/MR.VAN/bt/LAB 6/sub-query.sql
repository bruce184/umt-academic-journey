USE employeedatabase;

SELECT e.DepartmentID, count(*) as SLNV from employee e 
GROUP BY e.DepartmentID;

SELECT ProjectID, count(*) from workson
group by ProjectID;

SELECT ProjectID, count(*) from workson 
-- where ProjectID != 1: điều kiện lọc BẢNG 
GROUP BY ProjectID  -- 'group by' cái này thì 'select' cái đó 
HAVING count(*) > 1 ;
-- having: điều kiện lọc sau khi group by 
-- VỀ BẢN CHẤT, 2 cái cùng chức năng nhưng KHÁC CONTEXT DÙNG 

SELECT e.EmployeeID, e.FullName, count(*) 
from employee e left join workson w 
ON e.EmployeeID = w.EmployeeID;
-- GROUP BY e.employeeID, e.FullName;
-- count(*) lấy luôn giá trị null, nếu nêu rõ tên cột thì ko lấy nếu NULL


-- SELECT 
--     c.customer_id, 
--     c.customer_name, 
--     IFNULL(SUM(o.order_total), 0) AS total_order_value
-- FROM 
--     customer c
-- LEFT JOIN 
--     order o ON c.customer_id = o.customer_id
-- GROUP BY 
--     c.customer_id, c.customer_name;

