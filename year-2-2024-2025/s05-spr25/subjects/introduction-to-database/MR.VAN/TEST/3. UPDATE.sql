USE quanlythuvien;


-- ---------- INSERT INTO chitietpm ----------
INSERT INTO chitietpm (maphieu, masach, soluong) VALUES 
('PM1', N'S1', 2),
('PM1', N'S5', 4),
('PM2', N'S2', 6),
('PM3', N'S3', 3),
('PM4', N'S4', 5),
('PM4', N'S2', 7);

-- ---------- INSERT INTO nhanvien ----------
INSERT INTO nhanvien (manv, hoten, chucvu, dienthoai) VALUES
('NV1', N'Hoàng Văn E', N'Quản lý', '0901234567'),
('NV2', N'Vũ Thị F', N'Nhân viên', '0912345678'),
('NV3', N'Phan Văn G', N'Nhân viên', '0923456789'),
('NV4', N'Lê Thị H', N'Thủ quỹ', '0934567890');
-- ---------- UPDATE nhanvien ----------
UPDATE nhanvien SET hoten = 'Phạm Minh' WHERE MANV = 'NV3';


-- ---------- INSERT INTO phieumuon ----------
INSERT INTO phieumuon (maphieu, mathe, manv, ngaymuon, ngaytradukien) VALUES 
('PM1', 'TDG1', 'NV1', '2024-04-03', '2024-04-10'),
('PM2', 'TDG2', 'NV2', '2024-07-05', '2024-07-15'),
('PM3', 'TDG3', 'NV3', '2024-12-10', '2024-12-20'),
('PM4', 'TDG4', 'NV4', '2024-05-8', '2024-05-18');

-- ---------- INSERT INTO sach ----------
INSERT INTO sach (masach, tensach, tacgia, namxuatban, nxb, matheloai) VALUES 
('S1', N'Những năm tháng', N'Nguyễn Nhật Ánh', 2001, N'NXB Trẻ', 'TL1'),
('S2', N'Vũ trụ học cơ bản', N'Nguyễn Văn B', 2010, N'NXB Khoa Học', 'TL2'),
('S3', N'Cuộc chiến tranh lạnh', N'Trần Hữu', 2015, N'NXB Lịch Sử', 'TL3'),
('S4', N'Bí quyết giao tiếp', N'Phạm Thị C', 2018, N'NXB Kỹ Năng', 'TL4'),
('S5', N'Văn học hiện đại', N'Đỗ Mạnh', 2020, N'NXB Văn Học', 'TL1');

-- ---------- INSERT INTO thedocgia ----------
INSERT INTO thedocgia (mathe, hoten, ngaysinh, email, diachi, ngaycap) VALUES
('TDG1', N'Nguyễn Văn A', '1990-05-20', 'a@gmail.com', N'123 Đường A, TP. HCM', '2020-01-15'),
('TDG2', N'Lê Thị B', '1985-08-15', 'b@gmail.com', N'456 Đường B, Hà Nội', '2019-03-10'),
('TDG3', N'Trần Văn C', '1992-02-10', 'c@gmail.com', N'789 Đường C, Đà Nẵng', '2021-06-05'),
('TDG4', N'Phạm Thị D', '1988-11-30', 'd@gmail.com', N'321 Đường D, Cần Thơ', '2022-02-18');

-- ---------- INSERT INTO theloai ----------
INSERT INTO theloai (matheloai, tentheloai, mota) VALUES 
('TL1', N'Văn học', N'Thể loại về văn chương và tác phẩm văn học'),
('TL2', N'Khoa học', N'Các chủ đề liên quan đến khoa học tự nhiên và ứng dụng'),
('TL3', N'Lịch sử', N'Tài liệu và tác phẩm lịch sử'),
('TL4', N'Kỹ năng sống', N'Hướng dẫn và phát triển kỹ năng sống');