USE classicmodels;

-- 1. DATA EXPLORATION 
SELECT TOP 5 * FROM orders;
SELECT TOP 5 * FROM orderdetails;
SELECT TOP 5 * FROM products;
SELECT TOP 5 * FROM customers;


-- 2. FACT, DIMENSION 
/*
Measures: quantityOrdered, priceEach
Dimensions:
    Time        → orders.orderDate
    Product     → products.productLine
    Customer    → customers.country
*/

-- 3. SLICING
SELECT SUM(od.quantityOrdered*od.priceEach) as OrderRevenue 
FROM orders o JOIN orderdetails od ON o.orderNumber = od.orderNumber
WHERE o.orderNumber = 10100

-- Revenue by Product Line: because of the proccessing order (ORDER BY is processed after SELECT) -> "Revenue" at ORDER BY is valid 
SELECT p.productLine, 
       SUM(od.quantityOrdered * od.priceEach) AS Revenue
FROM orderdetails od JOIN products p ON p.productCode = od.productCode
GROUP BY p.productLine
ORDER BY Revenue DESC;

-- Revenue by Year
SELECT YEAR(o.orderDate) AS OrderYear,
       SUM(od.quantityOrdered * od.priceEach) AS Revenue
FROM orders o JOIN orderdetails od ON od.orderNumber = o.orderNumber
GROUP BY YEAR(o.orderDate)
ORDER BY OrderYear;

-- Revenue by Customer
SELECT o.customerNumber AS Customer, 
       SUM(od.quantityOrdered * od.priceEach) AS Revenue
FROM orders o JOIN orderdetails od ON od.orderNumber = o.orderNumber
GROUP BY o.customerNumber
ORDER BY Customer;


-- 4. DICING
-- Revenue by Year, Product Line, and Customer's Country
SELECT YEAR(o.orderDate) AS OrderYear, 
       p.productLine, 
       c.country, 
       SUM(od.quantityOrdered * od.priceEach) AS Revenue
FROM orders o JOIN orderdetails od ON od.orderNumber = o.orderNumber
              JOIN products p      ON p.productCode = od.productCode
              JOIN customers c     ON c.customerNumber = o.customerNumber
WHERE YEAR(o.orderDate) BETWEEN 2003 AND 2005 AND c.country IN ('USA','France','UK')
GROUP BY YEAR(o.orderDate), 
         p.productLine, 
         c.country
ORDER BY OrderYear, 
         Revenue DESC;

-- 5. DRILL-DOWN
-- Year --> Month
SELECT YEAR(o.orderDate)  AS OrderYear, 
       MONTH(o.orderDate) AS OrderMonth, 
       SUM(od.quantityOrdered * od.priceEach) AS Revenue
FROM orders o JOIN orderdetails od ON od.orderNumber = o.orderNumber
GROUP BY YEAR(o.orderDate), 
         MONTH(o.orderDate)
ORDER BY OrderYear, OrderMonth;

-- Product Line --> Product
SELECT p.productLine AS ProductLine, 
       od.productCode AS ProductCode, 
       SUM(od.quantityOrdered * od.priceEach) AS Revenue
FROM orders o JOIN orderdetails od ON od.orderNumber = o.orderNumber
              JOIN products p ON p.productCode = od.productCode
GROUP BY p.productLine, 
         od.productCode
ORDER BY ProductLine, 
         ProductCode;

-- 6. ROLL-UP
/* Example 1: Calculate order revenue by country at two levels:
   - (Year, Month) detail
   - Year subtotal (and grand total) using ROLLUP

   Revenue = quantityOrdered * priceEach
*/

------------------------------------------------------------
-- Solution A: Standard GROUP BY (no yearly subtotal)
------------------------------------------------------------
SELECT c.country AS Country, 
       YEAR(o.orderDate)  AS [Year], 
       MONTH(o.orderDate) AS [Month], 
       SUM(d.quantityOrdered * d.priceEach) AS Sales
FROM orders o JOIN customers c ON o.customerNumber = c.customerNumber
              JOIN orderdetails d ON d.orderNumber = o.orderNumber
GROUP BY c.country, 
         YEAR(o.orderDate), 
         MONTH(o.orderDate)
ORDER BY c.country, 
         [Year], 
         [Month];


------------------------------------------------------------
-- Solution B: ROLLUP (adds subtotals and grand total)
-- Detail: Country + Year + Month
-- Subtotals: Country + Year, Country, and Grand Total
------------------------------------------------------------
-- 
SELECT c.country AS Country,
       COALESCE(CONVERT(char(5), YEAR(o.orderDate)), 'Total')  AS [Year],
       COALESCE(CONVERT(char(5), MONTH(o.orderDate)), 'Total') AS [Month],
       SUM(d.quantityOrdered * d.priceEach) AS Sales
FROM orders o JOIN customers c ON o.customerNumber = c.customerNumber
              JOIN orderdetails d ON d.orderNumber = o.orderNumber
GROUP BY ROLLUP (
    c.country,
    YEAR(o.orderDate),
    MONTH(o.orderDate)
)
HAVING c.country IS NOT NULL   -- uncomment to remove the grand total
ORDER BY
    c.country,
    YEAR(o.orderDate),
    MONTH(o.orderDate);
        
-- Count the number of customers by (country, state) and by country
SELECT 
    COALESCE(c.country, 'All countries') AS Country, 
    COALESCE(c.state, 'All states')      AS State, 
    COUNT(c.customerNumber)              AS NbCustomers
FROM customers c 
GROUP BY ROLLUP(c.country, c.state)
ORDER BY c.country, 
         c.state;


-- B. CUBE: Multidimensional analysis across multiple dimensions
-- Example 3: Count the number of orders by combinations of dimensions:
               -- country, order year, and order status (example focused on USA)
SELECT 
    COALESCE(c.country, '-')                            AS Country, 
    COALESCE(CONVERT(char(5), YEAR(o.orderDate)), '-')  AS [Year], 
    COALESCE(o.status, '-')                             AS Status, 
    COUNT(o.orderNumber)                                AS NbOrders
FROM orders o JOIN customers c ON o.customerNumber = c.customerNumber
GROUP BY CUBE(c.country, YEAR(o.orderDate), o.status)
-- HAVING c.country = 'USA'
ORDER BY c.country DESC, 
         YEAR(o.orderDate) DESC;

-- 7. Pivot
-- EXAMPLE 3: COUNT THE NUMBER OF ORDERS IN THREE COUNTRIES ('FRANCE', 'USA', 'UK') BY YEAR
-- SOLUTION USING STANDARD GROUPING
SELECT c.country, YEAR(o.orderDate) AS [Year], COUNT(o.orderNumber) AS NbOrder
FROM orders o JOIN customers c ON o.customerNumber = c.customerNumber
WHERE c.country IN ('France', 'USA', 'UK')
GROUP BY c.country, YEAR(o.orderDate)
ORDER BY country, YEAR(o.orderDate);


-- SOLUTION USING PIVOT ON COUNTRY (ROTATE COUNTRY FROM ROWS TO COLUMNS)
-- Must have a "source table" in order to pivot
-- Elements in the "source table" has different roles: one that will be kept, one that will be convert into columns, one that basis to compute values 
SELECT [Year], 
       [France] AS Order_France, 
       [USA] AS Order_USA, 
       [UK] AS Order_UK
FROM (
    SELECT YEAR(o.orderDate) AS [Year], 
           o.orderNumber, 
           c.country
    FROM orders o JOIN customers c ON o.customerNumber = c.customerNumber
    WHERE c.country IN ('France', 'USA', 'UK')
) AS SourceTable
PIVOT (
    COUNT(orderNumber)
    FOR country IN ([France], [USA], [UK])
) AS PivotTable
ORDER BY [Year];


-- SOLUTION USING PIVOT ON YEAR (ROTATE YEAR FROM ROWS TO COLUMNS)
SELECT Country, 
       [2003] AS Order_2003,
       [2004] AS Order_2004, 
       [2005] AS Order_2005
FROM (
    SELECT YEAR(o.orderDate) AS [Year], 
           o.orderNumber, 
           c.country
    FROM orders o JOIN customers c ON o.customerNumber = c.customerNumber
    WHERE c.country IN ('France', 'USA', 'UK')
) AS SourceTable
PIVOT (
    COUNT(orderNumber)
    FOR Year IN ([2003], [2004], [2005])
) AS PivotTable
ORDER BY Country;

-- SOLUTION USING PIVOT ON YEAR FOR TOTAL SALES (ROTATE YEAR FROM ROWS TO COLUMNS)


-- EXAMPLE 4: COUNT THE TOTAL NUMBER OF ORDERS IN EACH COUNTRY BY YEAR
-- SOLUTION USING STANDARD GROUPING

SELECT Country, YEAR(o.orderDate) AS [Year], COUNT(o.orderNumber) AS NbOrder
FROM orders o JOIN customers c ON o.customerNumber = c.customerNumber
GROUP BY c.country, YEAR(o.orderDate)
ORDER BY country;


-- SOLUTION USING PIVOT ON YEAR (ROTATE YEAR FROM ROWS TO COLUMNS)

SELECT Country, [2003] AS Order_2003, [2004] AS Order_2004, [2005] AS Order_2005
FROM
   (SELECT YEAR(o.orderDate) AS [Year], c.country, o.orderNumber 
    FROM orders o JOIN customers c ON o.customerNumber = c.customerNumber) AS SourceTable
PIVOT (
    COUNT(orderNumber)
    FOR YEAR IN ([2003], [2004], [2005])
) AS PivotTable
ORDER BY country;


-- EXAMPLE 5: CALCULATE TOTAL SALES REVENUE IN EACH COUNTRY BY YEAR
-- SOLUTION USING STANDARD GROUPING

SELECT Country, YEAR(o.orderDate) AS [Year], SUM(d.quantityOrdered*d.priceEach) AS Sales
FROM orders o JOIN customers c ON o.customerNumber = c.customerNumber
              JOIN orderdetails d ON d.orderNumber = o.orderNumber
GROUP BY c.country, YEAR(o.orderDate)
ORDER BY country, YEAR(o.orderDate);


-- SOLUTION USING PIVOT ON YEAR (ROTATE YEAR FROM ROWS TO COLUMNS)

SELECT Country, COALESCE([2003],0) AS Sales_2003, COALESCE([2004],0) AS Sales_2004, COALESCE([2005],0) AS Sales_2005
FROM
   (SELECT YEAR(o.orderDate) AS [Year], c.country, d.quantityOrdered*d.priceEach AS Sales
    FROM orders o JOIN customers c ON o.customerNumber = c.customerNumber
                  JOIN orderdetails d ON d.orderNumber = o.orderNumber
) AS SourceTable
PIVOT (
    SUM(Sales)
    FOR YEAR IN ([2003], [2004], [2005])
) AS PivotTable
ORDER BY country;


-- EXAMPLE 6: CALCULATE TOTAL SALES REVENUE IN EACH COUNTRY FOR THE FIRST THREE MONTHS OF EACH YEAR
-- SOLUTION USING STANDARD GROUPING

SELECT Country, YEAR(o.orderDate) AS [Year], MONTH(o.orderDate) AS [Month], SUM(d.quantityOrdered*d.priceEach) AS Sales
FROM orders o JOIN customers c ON o.customerNumber = c.customerNumber
              JOIN orderdetails d ON d.orderNumber = o.orderNumber
GROUP BY c.country, YEAR(o.orderDate), MONTH(o.orderDate)
HAVING MONTH(o.orderDate) IN (1, 2, 3)
ORDER BY c.country, YEAR(o.orderDate), MONTH(o.orderDate);


-- SOLUTION #2: PIVOT MONTH
SELECT Country, 
       [Year], 
       COALESCE([1],0) AS Jan, 
       COALESCE([2],0) AS Feb, 
       COALESCE([3],0) AS Mar
FROM
   (SELECT YEAR(o.orderDate) AS [Year], MONTH(o.orderDate) AS [Month], c.country, d.quantityOrdered*d.priceEach AS Sales
    FROM orders o JOIN customers c ON o.customerNumber = c.customerNumber
                  JOIN orderdetails d ON d.orderNumber = o.orderNumber
) AS SourceTable
PIVOT (
    SUM(Sales)
    FOR Month IN ([1], [2], [3])
) AS PivotTable
ORDER BY Country, [Year];


-- EXERCISE 
/*Write an SQL query using ROLLUP to calculate total sales revenue by country, year, and month, including yearly subtotals, country subtotals, and a grand total, and display 'Total' instead of NULL values.*/
SELECT c.country AS Country,
       COALESCE(CONVERT(char(5), YEAR(o.orderDate)), 'Total')  AS [Year],
       COALESCE(CONVERT(char(5), MONTH(o.orderDate)), 'Total') AS [Month],
       SUM(d.quantityOrdered * d.priceEach) AS TotalSales
FROM orders o JOIN customers c ON o.customerNumber = c.customerNumber
              JOIN orderdetails d ON d.orderNumber = o.orderNumber
GROUP BY ROLLUP (
    c.country,
    YEAR(o.orderDate),
    MONTH(o.orderDate)
)
HAVING c.country IS NOT NULL  
ORDER BY
    c.country,
    YEAR(o.orderDate),
    MONTH(o.orderDate)

/* Explain which aggregation levels are produced by ROLLUP (country, YEAR(orderDate), MONTH(orderDate)) and why NULL values appear in the result.*/

/* Write an SQL query using PIVOT to show the number of orders per year for France, USA, and UK as separate columns.*/
SELECT Country, 
       [2003] AS Order_2003,
       [2004] AS Order_2004, 
       [2005] AS Order_2005
FROM (
    SELECT YEAR(o.orderDate) AS [Year], 
           o.orderNumber AS NumberOfOrder,
           c.country AS Country
    FROM orders o JOIN orderdetails od ON od.orderNumber = o.orderNumber
                  JOIN customers c ON c.customerNumber = o.customerNumber
    WHERE c.country IN ('France', 'USA', 'UK')
) AS SourceTable
PIVOT (
    COUNT(NumberOfOrder)
    FOR Year IN ([2003], [2004], [2005])
) AS PivotTable
ORDER BY Country;

/* Write an SQL query using PIVOT to display total sales revenue per country with the years 2003, 2004, and 2005 as columns and replace NULL values with 0.*/
SELECT Country, 
       ISNULL([2003], 0) AS TotalSalesRevenue_2003,
       ISNULL([2004], 0) AS TotalSalesRevenue_2004, 
       ISNULL([2005], 0) AS TotalSalesRevenue_2005
FROM (
    SELECT YEAR(o.orderDate) AS [Year], 
           (od.quantityOrdered * od.priceEach) AS Revenue,
           c.country AS Country
    FROM orders o JOIN orderdetails od ON od.orderNumber = o.orderNumber
                  JOIN customers c ON c.customerNumber = o.customerNumber

    WHERE c.country IN ('France', 'USA', 'UK')
) AS SourceTable
PIVOT (
    SUM(Revenue)
    FOR Year IN ([2003], [2004], [2005])
) AS PivotTable
ORDER BY Country;

/* In one sentence, explain the main difference between ROLLUP and PIVOT in SQL Server.*/\
ROLLUP is used to convert big parameters into smaller parameters, for example: Country into City, Yea into Month into Day
PIVOT is used to change the selected parameter from columns to rows