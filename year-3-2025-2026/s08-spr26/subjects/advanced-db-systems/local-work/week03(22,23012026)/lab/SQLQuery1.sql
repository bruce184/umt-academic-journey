USE master

CREATE LOGIN gv11 WITH PASSWORD = 'gv123456@@@@';
CREATE LOGIN gv22 WITH PASSWORD = 'gv123456@@@@';
CREATE LOGIN gv33 WITH PASSWORD = 'gv123456@@@@';
CREATE LOGIN gv44 WITH PASSWORD = 'gv123456@@@@';
CREATE LOGIN gv55 WITH PASSWORD = 'gv123456@@@@';


CREATE LOGIN sv11 WITH PASSWORD = 'sv123456@@@@';
CREATE LOGIN sv22 WITH PASSWORD = 'sv123456@@@@';
CREATE LOGIN sv33 WITH PASSWORD = 'sv123456@@@@';

-- 2 ways to change the role of each account: GUI or Script like below 
--	sysadmin: the highest role there is
ALTER SERVER ROLE sysadmin ADD MEMBER gv22;

CREATE DATABASE QLDT;
USE QLDT;
GO 

CREATE USER sv11 FOR LOGIN sv11
ALTER ROLE db_owner DROP MEMBER gv33

-- Create a table 
CREATE TABLE dbo.DiemThi (
    DiemThiID INT IDENTITY(1,1) PRIMARY KEY,
    MaSV      VARCHAR(20)  NOT NULL,
    MaMon     VARCHAR(20)  NOT NULL,
    Diem      DECIMAL(4,2) NOT NULL CHECK (Diem >= 0 AND Diem <= 10),
    NgayNhap  DATE         NOT NULL DEFAULT (GETDATE())
);
GO
-- Grant 
GRANT SELECT, INSERT, DELETE, UPDATE ON dbo.DiemThi to gv44;
GRANT SELECT ON dbo.DiemThi TO sv11;
GRANT all ON dbo.DiemThi TO gv55;
DENY UPDATE ON dbo.DiemThi TO gv55;

-- Revoke
--  REVOKE DELETE, UPDATEEX ON DiemThi TO gv44
--  REVOKE UPDATE dbo.DiemThi to gv55

-- Practical Method for everytime a new user is added
CREATE ROLE grpSV

CREATE USER sv22 FOR LOGIN sv22 -- phải tạo user trước từ login mới thay đổi quyền hạn 
ALTER ROLE grpSV ADD MEMBER sv22
GRANT SELECT ON dbo.DiemThi TO grpSV 

