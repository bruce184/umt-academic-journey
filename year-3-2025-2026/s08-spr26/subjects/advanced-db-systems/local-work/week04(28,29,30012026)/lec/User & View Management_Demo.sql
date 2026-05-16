/* CSDL Quan lý sinh vien
    SinhVien (MaSV, HoTen, NamSinh, GioiTinh, DiemTB, MaLop)
    GiaoVien (MaGV, HoTen, NgaySinh, LoaiGV)
    MonHoc (MaMH, TenMH, SoChi)
    KetQua (MaSV, MaMH, LanThi, Diem)
    Lop (MaLop, NamBD, NamKT, SiSo)
    GV_Lop (MaLop, MaMH, MaGV)*/
/*
use master
go 
drop database QLSV
*/
create database QLSV
go
use QLSV
go
create table SinhVien 
(MaSV char(5), HoTen nvarchar(50), NamSinh int, GioiTinh nchar(3), DiemTB float, MaLop char(5))

create table GiaoVien 
(MaGV char(5), HoTen nvarchar(50), NgaySinh datetime, LoaiGV char(5))

create table MonHoc 
(MaMH char(5), TenMH nvarchar(50), SoChi int)

create table KetQua 
(MaSV char(5), MaMH char(5), LanThi int, Diem float)

create table Lop 
(MaLop char(5), NamBD int, NamKT int, SiSo int)

create table GV_Lop 
(MaLop char(5), MaMH char(5), MaGV char(5))

go

-- Nhập liệu
INSERT INTO Lop (MaLop, NamBD, NamKT, SiSo) VALUES 
        ('L1', 2022, 2026, 40), 
        ('L2', 2022, 2026, 38);

INSERT INTO SinhVien (MaSV, HoTen, NamSinh, GioiTinh, DiemTB, MaLop) VALUES
        ('SV1', N'Nguyễn An', 2004, N'Nam', 7.5, 'L1'),
        ('SV2', N'Trần Bình', 2004, N'Nam', 8.0, 'L1'),
        ('SV3', N'Lê Chi',    2004, N'Nữ',  7.8, 'L2'),
        ('SV4', N'Phạm Dung', 2004, N'Nữ',  8.2, 'L2');

INSERT INTO GiaoVien (MaGV, HoTen, NgaySinh, LoaiGV) VALUES
        ('GV1', N'Vũ Minh', '1980-05-12', 'CH'),
        ('GV2', N'Hoàng Lan', '1985-09-20', 'TG');

INSERT INTO MonHoc (MaMH, TenMH, SoChi) VALUES
        ('MH1', N'Cơ sở dữ liệu', 3),
        ('MH2', N'Lập trình SQL', 3);

-- GV01 dạy CSDL cho lớp L01
-- GV02 dạy SQL cho lớp L02
INSERT INTO GV_Lop (MaLop, MaMH, MaGV) VALUES
        ('L1', 'MH1', 'GV1'),
        ('L2', 'MH2', 'GV2');

INSERT INTO KetQua (MaSV, MaMH, LanThi, Diem) VALUES
        ('SV1', 'MH1', 1, 7.0),
        ('SV2', 'MH1', 1, 8.0),
        ('SV3', 'MH2', 1, 7.5),
        ('SV4', 'MH2', 1, 8.5);




/* A.BẢO MẬT CẤP SERVER (SERVER-LEVEL SECURITY)
 - Quản lý quyền truy cập thông qua tài khoản chứng thực login
*/
--1.Tạo login cho GV01, GV02, GV03, SV01, SV02, SV03.
CREATE LOGIN gv1 WITH PASSWORD = 'gv123456@@@@';
CREATE LOGIN gv2 WITH PASSWORD = 'gv123456@@@@';
CREATE LOGIN gv3 WITH PASSWORD = 'gv123456@@@@';
CREATE LOGIN sv1 WITH PASSWORD = 'sv123456@@@@';
CREATE LOGIN sv2 WITH PASSWORD = 'sv123456@@@@';
CREATE LOGIN sv3 WITH PASSWORD = 'sv123456@@@@';

-- Huỷ login: DROP LOGIN gv3

/* B.BẢO MẬT CẤP DATABASE (DATABASE-LEVEL SECURITY)
 - Quản lý quyền trong một database cụ thể (User, Role, Permission)
 - Các lệnh liên quan
EXECUTE AS USER = 'username' -- Giả lập thực thi lệnh với tài khoản username
    Lệnh cần kiểm tra
REVERT -- Trở lại tài khoản ban đầu

USER_NAME() cho biết tên user hiện tại.
*/

--2. Liên kết các login gv1, gv2 và gv3 với user tương ứng cùng tên
create user gv1 for login gv1;
create user gv2 for login gv2;
create user gv3 for login gv3;

create user sv1 for login sv1 with default_schema=QLSV;
create user sv2 for login sv2 with default_schema=QLSV;
create user sv3 for login sv3 with default_schema=QLSV;

--2. Cấp quyền thao tác trên bảng KetQua cho gv1 (tất cả), sv1 (chỉ xem)
GRANT SELECT, INSERT, DELETE, UPDATE ON KetQua TO gv1;
GRANT SELECT, INSERT, DELETE, UPDATE ON GiaoVien TO gv1;
GRANT SELECT ON KetQua TO sv1;

-- Kiểm tra quyền thao tác trên bảng KetQua cho sv1
EXECUTE AS USER = 'sv1'; -- giả lập là user này, với phạm vi quyền của user này
PRINT USER_NAME();
SELECT * FROM KetQua; -- OK
REVERT;

EXECUTE AS USER = 'sv1';
PRINT USER_NAME();
INSERT INTO KETQUA VALUES ('sv1', 'MH001', 1, 8); -- PERMISSION DENIED
REVERT;

-- Kiểm tra quyền thao tác trên bảng KetQua cho gv1
EXECUTE AS USER = 'gv1';
PRINT USER_NAME();
SELECT * FROM KetQua; -- OK
INSERT INTO KETQUA VALUES ('sv2', 'MH001', 1, 8); -- OK
REVERT;

--3. Thu hồi quyền đã cấp
REVOKE SELECT ON KetQua FROM gv1;

EXECUTE AS USER = 'gv1';
PRINT USER_NAME();
SELECT * FROM KetQua; -- PERMISSION DENIED
REVERT;


--4. Cấp quyền trên 2 cột MaSV, Diem của bảng kết quả
GRANT SELECT ON KETQUA(MaSV, Diem) TO gv1;

EXECUTE AS USER = 'gv1';
PRINT USER_NAME();
SELECT MaSV, Diem FROM KetQua -- OK
REVERT;

EXECUTE AS USER = 'gv1';
PRINT USER_NAME();
SELECT * FROM KetQua; -- PERMISSION DENIED: cannot select columns 'MaMH', 'LanThi' because they are not in the select list of the view or table
REVERT;

--5. Cấm quyền trên bảng sinh viên
DENY SELECT ON SINHVIEN to gv1

EXECUTE AS USER = 'gv1';
PRINT USER_NAME();
SELECT * FROM SinhVien; -- PERMISSION DENIED
REVERT;

--6. Cấp lại quyền
GRANT SELECT ON SINHVIEN to gv1

EXECUTE AS USER = 'gv1';
PRINT USER_NAME();
SELECT * FROM SinhVien; -- OK
REVERT;


/* C.BẢO MẬT CHO NHÓM NGƯỜI DÙNG
*/
--4. Tạo 3 nhóm vai trò GiaoVien, QuanLi, SinhVien
CREATE ROLE GiaoVien;
CREATE ROLE QuanLi;
CREATE ROLE SinhVien;

--5. GV01 thuộc nhóm quản lí;
--   GV02, GV03 thuộc nhóm giáo viên; 
--   các sinh viên thuộc nhóm sinhvien
ALTER ROLE QuanLi ADD MEMBER gv1;
ALTER ROLE GiaoVien ADD MEMBER gv1;
ALTER ROLE GiaoVien ADD MEMBER gv2; 
ALTER ROLE GiaoVien ADD MEMBER gv3;
ALTER ROLE SinhVien ADD MEMBER sv1;
ALTER ROLE SinhVien ADD MEMBER sv2;
ALTER ROLE SinhVien ADD MEMBER sv3;

--6. Cấm quyền trực tiếp
DENY DELETE, INSERT, UPDATE ON dbo.KetQua TO SinhVien;
DENY DELETE, INSERT, UPDATE ON dbo.KetQua TO gv1;

EXECUTE AS USER = 'sv1';
PRINT USER_NAME();
DELETE KETQUA WHERE 1=0 -- PERMISSION DENIED
REVERT;


--7. Cấp quyền sau khi DENY
GRANT DELETE, SELECT ON dbo.KetQua TO gv1;
EXECUTE AS USER = 'gv1';
PRINT USER_NAME();
DELETE KETQUA WHERE 1=0 -- OK
REVERT;

EXECUTE AS USER = 'gv1';
PRINT USER_NAME();
SELECT * FROM KETQUA -- OK
REVERT;

--8. Giáo viên được xem thông tin tất cả môn học, trừ gv1
GRANT SELECT ON MONHOC to GiaoVien
DENY SELECT ON MONHOC to gv1

EXECUTE AS USER = 'gv1';
PRINT USER_NAME();
SELECT * FROM MONHOC -- PERMISSION DENIED
REVERT;

EXECUTE AS USER = 'gv2';
PRINT USER_NAME();
SELECT * FROM MONHOC -- OK
REVERT;

--8. Giáo viên CHỈ được XEM kết quả các môn học do mình phụ trách.
-- Không cho role giáo viên thao tác trực tiếp bảng KetQua
DENY SELECT, INSERT, UPDATE, DELETE ON dbo.KetQua TO GiaoVien;
GO

-- Bảng Ảo, chỉ hiện thị dữ liệu theo quyền của user, khi truy cập
--  
CREATE VIEW vw_KetQua_GiaoVien 
AS
    SELECT kq.MaSV, sv.HoTen HoTenSV,sv.MaLop, kq.MaMH, mh.TenMH, kq.LanThi, kq.Diem
    FROM dbo.KetQua kq JOIN dbo.SinhVien sv ON sv.MaSV = kq.MaSV
                        JOIN dbo.MonHoc mh ON mh.MaMH = kq.MaMH
                        JOIN dbo.GV_Lop gl ON gl.MaLop = sv.MaLop AND gl.MaMH  = kq.MaMH
    WHERE gl.MaGV = USER_NAME();
GO

-- Cho phép thao tác qua view
GRANT SELECT ON vw_KetQua_GiaoVien TO GiaoVien;

-- EXECUTE AS USER = 'gv3';
-- EXECUTE AS USER = 'gv2';
EXECUTE AS USER = 'gv1';
-- Chỉ xem được phần mình dạy
SELECT * FROM dbo.vw_KetQua_GiaoVien;
REVERT;

--9. Quản lí được xem, cập nhật, thêm thông tin môn học, sinh
--viên và được phép cấp các quyền cho user khác.
GRANT SELECT,UPDATE, INSERT ON MONHOC
TO QUANLI WITH GRANT OPTION

GRANT SELECT,UPDATE, INSERT ON SINHVIEN
TO QUANLI WITH GRANT OPTION

------------- BAI TAP
-- THAO TÁC QUYỀN TRÊN VAI TRÒ (ROLE)
--1.Tất cả các sinh viên đều được phép xem thông tin các môn
--học hiện có ở trường.
grant select on monhoc to SinhVien

--2. Giáo viên GV03 không còn giảng dạy ở trường. Hãy hủy
--các quyền đã cấp cho GV03.
revoke all from GiaoVien cascade

--3. Cấm quyền truy cập thông tin của SV03 đã không còn học.
deny select to sv3

--4. Sinh viên chỉ được xem kết quả học tập cho các môn sinh viên theo học.
deny select, insert, update, delete on KETQUA to SinhVien

EXECUTE AS USER='sv1'
SELECT * FROM KETQUA -- PERMISSION DENIED
REVERT

GO
-- TẠO KHUNG NHÌN
CREATE OR ALTER VIEW vw_KetQua_SinhVien
AS
    SELECT * FROM KETQUA WHERE MASV = USER_NAME()
GO

-- Gán quyền sử dụng khung nhìn cho các giáo viên
GRANT SELECT ON vw_KetQua_SinhVien to SinhVien

EXECUTE AS USER='sv2'
SELECT * FROM vw_KetQua_SinhVien
REVERT -- Trả về người dùng mặc định (admin)


/* D.BẢO MẬT THÔNG QUA KHUNG NHÌN - VIEW
*/
/******************************* VIEW (KHUNG NHÌN) DEMO ********************************
 A. Khung nhìn (View): Bảng ảo được hình thành từ các bảng vật lý trong CSDL.
 - Lợi ích: 
    + Bảo mật.
    + Đơn giản thao tác truy vấn.
    + Cung cấp nhiều góc nhìn khác nhau cho các người dùng khác nhau.
 - Dữ liệu cập nhật trên khung nhìn sẽ được cập nhật xuống DB nếu khung nhìn thoả:
    + Chỉ dựa trên một bảng vật lý duy nhất.
    + Phải chứa các cột dữ liệu not null và không có giá trị mặc định của bảng vật lý.
    + Không chứa các hàm kết hợp.
    + Không thực hiện tính toán trên các cột thuộc tính ở mệnh đề select.
 - Cú pháp:
    CREATE | ALTER VIEW VW_NAME ([COL_NAME1], [COL_NAME2] …) [WITH ENCRYPTION]
    AS 
	    SELECT_STATEMENT	
    [WITH CHECK OPTION]

 
 B. Khung nhìn thực (Materialized View or Indexed View): Chứa dữ liệu kết xuất từ bảng cơ sở
    trong một khoảng thời gian nhất định.
    CREATE | ALTER VIEW SCHEMA.VW_NAME ([COL_NAME1] …) WITH SCHEMABINDING
    AS 
        SELECT A, B … FROM SCHEMA.S, SCHEMA.R	…
    [WITH CHECK OPTION]

+ WITH ENCRYPTION: Mã hoá nội dung khung nhìn
+ WITH SCHEMABINDING: Không cho phép các bảng liên quan thay đổi (phải dùng cho khung nhìn thực)
+ WITH CHECK OPTION: Chỉ cho phép dữ liệu thoả điều kiện WHERE được thêm/cập nhật bảng vật lý 
*/

-- 1. Lấy danh sách sinh viên
go
CREATE OR ALTER VIEW vw_SinhVien_TheoLop
AS
    SELECT sv.MaSV, sv.HoTen, sv.GioiTinh, sv.NamSinh, sv.MaLop
    FROM dbo.SinhVien sv;
GO


SELECT * FROM vw_SinhVien_TheoLop;

-- 2. Thống kê điểm trung bình mỗi môn
go
CREATE OR ALTER VIEW vw_DiemTB_TheoMon
AS
    SELECT mh.MaMH, mh.TenMH, AVG(kq.Diem) AS DiemTrungBinh
    FROM dbo.KetQua kq JOIN dbo.MonHoc mh ON mh.MaMH = kq.MaMH
    GROUP BY mh.MaMH, mh.TenMH;
GO

SELECT * FROM vw_DiemTB_TheoMon;