-- ======================================
-- PHẦN 2: NHẬP DỮ LIỆU MẪU
-- ======================================
USE LAB_1379_MVC

-- Chèn dữ liệu mẫu vào bảng ProductCategory
INSERT INTO ProductCategory (CategoryName) VALUES 
(N'Electronics'),
(N'Books'),
(N'Clothing'),
(N'Home Appliances');
GO

-- Chèn dữ liệu mẫu vào bảng Supplier
INSERT INTO Supplier (SupplierName, Address, Phone) VALUES 
(N'ABC Electronics Co.', N'123 Main Street, HCM City', '0901234567'),
(N'Bookstore Vietnam', N'45 Le Loi, Hanoi', '0912345678'),
(N'Fashion Trend Co.', N'22 Nguyen Trai, HCM City', '0923456789'),
(N'HomeCare Ltd.', N'89 Tran Hung Dao, Da Nang', '0934567890');
GO

-- Chèn dữ liệu mẫu vào bảng Product
INSERT INTO Product (ProductName, Description, Price, StockQuantity, CategoryId, SupplierId) VALUES 
(N'Samsung Galaxy S22', N'Latest Samsung smartphone with 5G', 19999.99, 50, 1, 1),
(N'iPhone 14 Pro Max', N'Apple flagship phone 2023', 29999.99, 30, 1, 1),
(N'The Great Gatsby', N'Classic novel by F. Scott Fitzgerald', 150.50, 200, 2, 2),
(N'Men''s T-shirt', N'100% cotton t-shirt, various sizes', 250.00, 100, 3, 3),
(N'Air Fryer', N'3-liter capacity air fryer', 2200.00, 40, 4, 4);
GO
