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