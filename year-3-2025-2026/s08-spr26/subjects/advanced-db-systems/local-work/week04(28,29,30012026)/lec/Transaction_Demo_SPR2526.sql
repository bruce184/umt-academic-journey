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


/* A.TÌNH HUỐNG LỖI DIRTY READ */
go
-- T1: Thêm và hủy
CREATE OR ALTER PROC sp_PhanCongGV @MaLop char(5), @MaMH  char(5), @MaGV  char(5)
AS
BEGIN
    BEGIN TRAN;

        -- Thêm phân công (chưa commit)
        INSERT INTO GV_Lop(MaLop, MaMH, MaGV) VALUES (@MaLop, @MaMH, @MaGV);

        -- Delay để giả lập song song
        WAITFOR DELAY '00:00:05'

        -- Hủy phân công (rollback)
    ROLLBACK TRAN;
END
GO

-- T2: Đọc dữ liệu chưa commit, cần set mức cô lập về read uncommitted
CREATE OR ALTER PROC sp_LayDSGVTheoLop @MaLop char(5)
AS
BEGIN
    -- Cho phép đọc dữ liệu chưa commit => Dirty Read
    SET TRANSACTION ISOLATION LEVEL READ UNCOMMITTED;

    SELECT DISTINCT gl.MaLop, gl.MaMH, mh.TenMH, gl.MaGV, gv.HoTen AS TenGV
    FROM GV_Lop gl JOIN GiaoVien gv ON gv.MaGV = gl.MaGV
                    JOIN MonHoc   mh ON mh.MaMH = gl.MaMH
    WHERE gl.MaLop = @MaLop;

    -- Trả về mặc định
    SET TRANSACTION ISOLATION LEVEL READ COMMITTED;
END
GO

-- Mở T1, T2 trong 2 session để test thử
-- Chạy T1
EXEC sp_PhanCongGV @MaLop = 'L1', @MaMH  = 'MH2', @MaGV  = 'GV2'

-- Chạy T2 (đồng thời)
EXEC sp_LayDSGVTheoLop @MaLop = 'L1';

-- Minh họa sửa lỗi
go
CREATE OR ALTER PROC sp_LayDSGVTheoLop_fix @MaLop char(5)
AS
BEGIN
    -- Để mức cô lập mặc định (READ COMMITTED)
    BEGIN TRAN;

        SELECT DISTINCT gl.MaLop, gl.MaMH, mh.TenMH, gl.MaGV, gv.HoTen AS TenGV
        FROM GV_Lop gl JOIN GiaoVien gv ON gv.MaGV = gl.MaGV
                        JOIN MonHoc   mh ON mh.MaMH = gl.MaMH
        WHERE gl.MaLop = @MaLop;

    COMMIT TRAN;

END
GO

-- Mở T1, T2 trong 2 session để test thử
-- Chạy T1
EXEC sp_PhanCongGV @MaLop = 'L1', @MaMH  = 'MH2', @MaGV  = 'GV2'

-- Chạy T2 (đồng thời)
EXEC sp_LayDSGVTheoLop_fix @MaLop = 'L1';


/* B.TÌNH HUỐNG LỖI UNREPEATABLE READ */
-- T1: Lấy danh sách sinh viên đậu một môn học ngay lần đầu tiên
GO
CREATE OR ALTER PROC sp_LayDSSVDauLanDau @MaMH char(5)
AS
BEGIN
    SET TRANSACTION ISOLATION LEVEL READ COMMITTED;
    BEGIN TRAN;

        -- 1) ĐẾM SỐ LƯỢNG SINH VIÊN ĐẬU
        SELECT COUNT(DISTINCT kq.MaSV) AS SoSVDau
        FROM KetQua kq
        WHERE kq.MaMH = @MaMH AND kq.Diem >= 5 AND kq.LanThi = 1;

        -- Chờ để T2 kịp cập nhật điểm từ đậu -> rớt
        WAITFOR DELAY '00:00:05';

        -- 2) DANH SÁCH SINH VIÊN ĐẬU
        SELECT sv.MaSV, sv.HoTen, kq.MaMH, kq.LanThi, kq.Diem
        FROM KetQua kq JOIN SinhVien sv ON sv.MaSV = kq.MaSV
        WHERE kq.MaMH = @MaMH AND kq.LanThi = 1 AND kq.Diem >= 5
        ORDER BY sv.MaSV;

    COMMIT TRAN;
END
GO

-- T2: Cập nhật điểm một sinh viên
CREATE OR ALTER PROC sp_CapNhatDiemSV @MaSV char(5), @MaMH char(5), @LanThi int = 1, @DiemMoi float
AS
BEGIN
    BEGIN TRAN;

        UPDATE KetQua
        SET Diem = @DiemMoi
        WHERE MaSV = @MaSV AND MaMH = @MaMH AND LanThi = @LanThi;

    COMMIT TRAN;
END
GO

-- Thực thi T1, T2 đồng thời
--T1
EXEC sp_LayDSSVDauLanDau @MaMH='MH1';

--T2
EXEC sp_CapNhatDiemSV @MaSV='SV2', @MaMH='MH1', @LanThi=1, @DiemMoi=3.0;

-- Sửa lỗi
GO
CREATE OR ALTER PROC sp_LayDSSVDauLanDau_fix @MaMH char(5)
AS
BEGIN
    SET TRANSACTION ISOLATION LEVEL REPEATABLE READ;
    BEGIN TRAN;

        -- 1) ĐẾM SỐ LƯỢNG SINH VIÊN ĐẬU
        SELECT COUNT(DISTINCT kq.MaSV) AS SoSVDau
        FROM KetQua kq
        WHERE kq.MaMH = @MaMH AND kq.Diem >= 5 AND kq.LanThi = 1;

        -- Chờ để T2 kịp cập nhật điểm từ đậu -> rớt
        WAITFOR DELAY '00:00:05';

        -- 2) DANH SÁCH SINH VIÊN ĐẬU
        SELECT sv.MaSV, sv.HoTen, kq.MaMH, kq.LanThi, kq.Diem
        FROM KetQua kq JOIN SinhVien sv ON sv.MaSV = kq.MaSV
        WHERE kq.MaMH = @MaMH AND kq.LanThi = 1 AND kq.Diem >= 5
        ORDER BY sv.MaSV;

    COMMIT TRAN;
END
GO

-- Thực thi T1, T2 đồng thời
--T1
EXEC sp_LayDSSVDauLanDau_fix @MaMH='MH1';

--T2
EXEC sp_CapNhatDiemSV @MaSV='SV2', @MaMH='MH1', @LanThi=1, @DiemMoi=3.0;


/* C.TÌNH HUỐNG LỖI PHANTOM */
GO
CREATE OR ALTER PROC sp_LayDSSVDauXuatSac @MaMH char(5)
AS
BEGIN
    SET TRANSACTION ISOLATION LEVEL READ COMMITTED;
    BEGIN TRAN;

        -- 1) ĐẾM SỐ LƯỢNG SINH VIÊN ĐẬU
        SELECT COUNT(DISTINCT kq.MaSV) AS SoSVDau
        FROM KetQua kq
        WHERE kq.MaMH = @MaMH AND kq.Diem >= 9 AND kq.LanThi = 1;

        -- Chờ để T2 kịp cập nhật điểm từ đậu -> rớt
        WAITFOR DELAY '00:00:05';

        -- 2) DANH SÁCH SINH VIÊN ĐẬU
        SELECT sv.MaSV, sv.HoTen, kq.MaMH, kq.LanThi, kq.Diem
        FROM KetQua kq JOIN SinhVien sv ON sv.MaSV = kq.MaSV
        WHERE kq.MaMH = @MaMH AND kq.LanThi = 1 AND kq.Diem >= 9
        ORDER BY sv.MaSV;

    COMMIT TRAN;
END
GO

-- Thực thi T1, T2 đồng thời
--T1
EXEC sp_LayDSSVDauXuatSac @MaMH='MH1';

--T2
EXEC sp_CapNhatDiemSV @MaSV='SV2', @MaMH='MH1', @LanThi=1, @DiemMoi=3.0;

-- Sửa lỗi phantom
go
CREATE OR ALTER PROC sp_LayDSSVDauXuatSac_fix @MaMH char(5)
AS
BEGIN
    SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;
    BEGIN TRAN;

        -- 1) ĐẾM SỐ LƯỢNG SINH VIÊN ĐẬU
        SELECT COUNT(DISTINCT kq.MaSV) AS SoSVDau
        FROM KetQua kq
        WHERE kq.MaMH = @MaMH AND kq.Diem >= 9 AND kq.LanThi = 1;

        -- Chờ để T2 kịp cập nhật điểm từ đậu -> rớt
        WAITFOR DELAY '00:00:05';

        -- 2) DANH SÁCH SINH VIÊN ĐẬU
        SELECT sv.MaSV, sv.HoTen, kq.MaMH, kq.LanThi, kq.Diem
        FROM KetQua kq JOIN SinhVien sv ON sv.MaSV = kq.MaSV
        WHERE kq.MaMH = @MaMH AND kq.LanThi = 1 AND kq.Diem >= 9
        ORDER BY sv.MaSV;

    COMMIT TRAN;
END
GO

-- Thực thi T1, T2 đồng thời
--T1
EXEC sp_LayDSSVDauXuatSac_fix @MaMH='MH1';

--T2
EXEC sp_CapNhatDiemSV @MaSV='SV2', @MaMH='MH1', @LanThi=1, @DiemMoi=10.0;


/* D.TÌNH HUỐNG LỖI LOST UPDATE */
GO
CREATE PROCEDURE sp_CapNhatSiSo @MaLop char(3), @SLTang int
AS 
BEGIN 
    BEGIN TRAN;
        Declare @SL int
        Select @SL = siso from Lop Where MaLop = @MaLop

        WAITFOR DELAY '00:00:05'
        Update LOP SET SiSo = @SL + @SLTang
        WHERE MaLop = @MaLop

    COMMIT TRAN;
END 
GO

-- Lấy sĩ số ban đầu
select * from lop where malop = 'L1' --40
--T1
EXEC sp_CapNhatSiSo 'L1', 10

--T2
EXEC sp_CapNhatSiSo 'L1', 20
-- Số đúng sau T1, T2 cập nhật: 70

SELECT * FROM LOP WHERE MALOP = 'L1'

GO
CREATE OR ALTER PROCEDURE sp_CapNhatSiSo_fix @MaLop char(3), @SLTang int
AS 
BEGIN 
    BEGIN TRAN;
        Declare @SL int
        Select @SL = siso from Lop with (UPDLOCK) Where MaLop = @MaLop

        WAITFOR DELAY '00:00:05'
        Update LOP SET SiSo = @SL + @SLTang
        WHERE MaLop = @MaLop

    COMMIT TRAN;
END 
GO