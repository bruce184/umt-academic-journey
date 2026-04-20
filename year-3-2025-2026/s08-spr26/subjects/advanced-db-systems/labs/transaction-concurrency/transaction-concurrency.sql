USE QLSV;

SELECT * FROM KetQua;
SELECT * FROM SinhVien;

CREATE OR ALTER PROC LayTopSV @MaMH char(5)
AS
BEGIN
    SET TRANSACTION ISOLATION LEVEL READ COMMITTED;
    BEGIN TRAN;

        -- 1) ĐẾM SỐ LƯỢNG SINH VIÊN ĐẬU
        SELECT COUNT(DISTINCT kq.MaSV) AS SoSVDau
        FROM KetQua kq
        WHERE kq.MaMH = @MaMH AND kq.Diem >= 8 AND kq.LanThi = 1;

        -- Chờ để T2 kịp cập nhật điểm từ đậu -> rớt
        WAITFOR DELAY '00:00:05';

        -- 2) DANH SÁCH SINH VIÊN ĐẬU
        SELECT sv.MaSV, sv.HoTen, kq.MaMH, kq.LanThi, kq.Diem
        FROM KetQua kq JOIN SinhVien sv ON sv.MaSV = kq.MaSV
        WHERE kq.MaMH = @MaMH AND kq.LanThi = 1 AND kq.Diem >= 8
        ORDER BY sv.MaSV;

    COMMIT TRAN;
END

-- T2: Cập nhật điểm một sinh viên
CREATE OR ALTER PROC DoiDiemSV @MaSV char(5), @MaMH char(5), @LanThi int = 1, @DiemMoi float
AS
BEGIN
    BEGIN TRAN;

        UPDATE KetQua
        SET Diem = @DiemMoi
        WHERE MaSV = @MaSV AND MaMH = @MaMH AND LanThi = @LanThi;

    COMMIT TRAN;
END

-- Test Thử 
---- T1: Lấy danh sách top sinh viên 
EXEC LayTopSV @MaMH='MH2';
---- T2: Cập nhật điểm một sinh viên
EXEC DoiDiemSV @MaSV='SV4', @MaMH='MH2', @LanThi=1, @DiemMoi=7.5;


-- Sửa
CREATE OR ALTER PROC LayTopSV_fix @MaMH char(5)
AS
BEGIN
    SET TRANSACTION ISOLATION LEVEL REPEATABLE READ;
    BEGIN TRAN;

        -- 1) ĐẾM SỐ LƯỢNG SINH VIÊN ĐẬU
        SELECT COUNT(DISTINCT kq.MaSV) AS SoSVDau
        FROM KetQua kq
        WHERE kq.MaMH = @MaMH AND kq.Diem >= 8 AND kq.LanThi = 1;

        -- Chờ để T2 kịp cập nhật điểm từ đậu -> rớt
        WAITFOR DELAY '00:00:05';

        -- 2) DANH SÁCH SINH VIÊN ĐẬU
        SELECT sv.MaSV, sv.HoTen, kq.MaMH, kq.LanThi, kq.Diem
        FROM KetQua kq JOIN SinhVien sv ON sv.MaSV = kq.MaSV
        WHERE kq.MaMH = @MaMH AND kq.LanThi = 1 AND kq.Diem >= 5
        ORDER BY sv.MaSV;

    COMMIT TRAN;
END

-- Test Lại 
---- T1
EXEC LayTopSV_fix @MaMH='MH2';
---- T2
EXEC DoiDiemSV @MaSV='SV4', @MaMH='MH2', @LanThi=1, @DiemMoi=7.5;