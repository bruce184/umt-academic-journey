USE classicmodels;

SELECT * FROM customers;
SELECT * FROM employees;
SELECT * FROM offices;

SELECT country as Country, 
	   city as City, 
	   COUNT(customerNumber) as NumberOfCustomer 
FROM customers
GROUP BY city, country
HAVING COUNT(customerNumber) > 2;

SELECT o.country as Country, 
	   o.city as City, 
	   COUNT(e.employeeNumber) as NumberOfEmployee
FROM employees e JOIN offices o ON e.officeCode = o.officeCode
GROUP BY ROLLUP (country, city)
ORDER BY country, city 

-- coalesce(): find the first non-null value of that attribute 
SELECT COALESCE(o.country, Country), 
	   COALESCE(o.city, City), 
	   COUNT(e.employeeNumber) as NumberOfEmployee
FROM employees e JOIN offices o ON e.officeCode = o.officeCode
GROUP BY ROLLUP (country, city)
ORDER BY country, city 

SELECT COALESCE(country), 
	   COALESCE(YEAR(o.orderDate), 1) as 'Year',
	   COALESCE(o.status),
	   COUNT(orderNumber) as 'Status'
FROM orders o JOIN customers c ON o.customerNumber = c.customerNumber
GROUP BY CUBE(country, YEAR(o.orderDate), o.status)
ORDER BY country, YEAR(o.orderDate), o.status