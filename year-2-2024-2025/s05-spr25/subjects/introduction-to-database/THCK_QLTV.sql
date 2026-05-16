
/********************** SCRIPT TẠO CSDL QUẢN LÝ THƯ VIỆN **********************/
CREATE DATABASE QUANLYTHUVIEN;
USE QUANLYTHUVIEN;

-- Bảng THELOAI (mã thể loại, tên thể loại, mô tả)
CREATE TABLE THELOAI (
    matheloai CHAR(10) PRIMARY KEY,
    tentheloai NVARCHAR(50) NOT NULL,
    mota NVARCHAR(255)
);

-- Bảng SACH (mã sách, tên sách, tác giả, năm xuất bản, nhà xuất bản, mã thể loại)
CREATE TABLE SACH (
    masach CHAR(10) PRIMARY KEY,
    tensach NVARCHAR(100) NOT NULL,
    tacgia NVARCHAR(100),
    namxuatban INT,
    nxb NVARCHAR(100),
    matheloai CHAR(10),
    FOREIGN KEY (matheloai) REFERENCES THELOAI(matheloai)
);

-- Bảng THEDOCGIA (mã thẻ, họ tên, ngày sinh, email, địa chỉ, ngày cấp)
CREATE TABLE THEDOCGIA (
    mathe CHAR(10) PRIMARY KEY,
    hoten NVARCHAR(100) NOT NULL,
    ngaysinh DATE,
    email NVARCHAR(100),
    diachi NVARCHAR(200),
    ngaycap DATE
);

-- Bảng NHANVIEN (mã NV, họ tên, chức vụ, điện thoại)
CREATE TABLE NHANVIEN (
    manv CHAR(10) PRIMARY KEY,
    hoten NVARCHAR(100) NOT NULL,
    chucvu NVARCHAR(50),
    dienthoai CHAR(10)
);

-- Bảng PHIEUMUON (mã phiếu, mã thẻ, mã NV, ngày mượn, ngày trả dự kiến)
CREATE TABLE PHIEUMUON (
    maphieu CHAR(10) PRIMARY KEY,
    mathe CHAR(10),
    manv CHAR(10),
    ngaymuon DATE,
    ngaytradukien DATE,
    FOREIGN KEY (mathe) REFERENCES THEDOCGIA(mathe),
    FOREIGN KEY (manv) REFERENCES NHANVIEN(manv)
);

-- Bảng CHITIETPM (mã phiếu, mã sách, số lượng)
CREATE TABLE CHITIETPM (
    maphieu CHAR(10),
    masach CHAR(10),
    soluong INT,
    PRIMARY KEY (maphieu, masach),
    FOREIGN KEY (maphieu) REFERENCES PHIEUMUON(maphieu),
    FOREIGN KEY (masach) REFERENCES SACH(masach)
);
