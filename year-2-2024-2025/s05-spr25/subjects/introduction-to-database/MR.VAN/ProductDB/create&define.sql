CREATE DATABASE ProductDB;
USE ProductDB;

CREATE TABLE ProductCategory (
    CategoryId INT PRIMARY KEY AUTO_INCREMENT ,
    CategoryName NVARCHAR(100) NOT NULL
);

CREATE TABLE Supplier (
    SupplierId INT PRIMARY KEY AUTO_INCREMENT ,
    SupplierName NVARCHAR(200) NOT NULL,
    Address NVARCHAR(200),
    Phone VARCHAR(20)
);

CREATE TABLE Product (
    ProductId INT PRIMARY KEY AUTO_INCREMENT ,
    ProductName NVARCHAR(200) NOT NULL,
    Description TEXT,
    Price FLOAT,
    StockQuantity INT,
    CategoryId INT,
    SupplierId INT,
    CONSTRAINT FK_Product_Category FOREIGN KEY (CategoryId) REFERENCES ProductCategory(CategoryId),
    CONSTRAINT FK_Product_Supplier FOREIGN KEY (SupplierId) REFERENCES Supplier(SupplierId)
);
