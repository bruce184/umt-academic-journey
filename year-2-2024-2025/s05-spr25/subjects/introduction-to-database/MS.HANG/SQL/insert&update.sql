-- ---------------------------------------------------------
-- Bước 3 : INSERT DỮ LIỆU 
-- ------------------INSERT Department----------------------

insert into Department values(N'Nghiên cứu', 5, null, '1988-05-22');

insert into Department values(N'Điều hành', 4, null, '1995-01-01');

insert into Department values(N'Quản lý', 1, null, '1981-06-19');

-- INSERT Employee--------------------
insert into Employee values (N'Trần',N'Thanh',N'Hải','009','1960-02-11', N'119 Cống Quỳnh, Tp HCM',N'Nam',30000,null,5);

insert into Employee values (N'Nguyễn',N'Thanh',N'Tùng','005','1962-08-20', N'222 Nguyễn Văn Cừ, Tp HCM',N'Nam',40000,null, 5);

insert into Employee values (N'Bùi',N'Ngọc',N'Hằng','007','1954-03-11', N'332 Nguyễn Thái Học, Tp HCM',N'Nam',25000,null,4);

insert into Employee values (N'Lê',N'Quỳnh',N'Như','001','1967-01-02', N'291 Hồ Văn Huê,  Tp HCM',N'Nữ',43000,null,4);

insert into Employee values (N'Nguyễn',N'Mạnh',N'Hùng','004','1967-04-12',N'95 Bà Rịa, Vũng Tàu',N'Nam',38000,null,5);

insert into Employee values (N'Phan',N'Thanh',N'Tâm','003','1957-05-12',N'34 Mai Thị Lựu, Tp HCM',N'Nam',25000,null,5);

insert into Employee values (N'Trần',N'Hồng',N'Quang','008','1967-01-09',N'80 Lê Hồng DeptID, Tp HCM',N'Nam',25000,null,4);

insert into Employee values (N'Phạm',N'Văn',N'Vinh','006','1965-01-02',N'45 Trưng Vương, Hà Nội',N'Nữ',55000, null,	1);

-- ---------------UPDATE Department--------------------
update  Department
set DeptManager=N'005'
where DeptID=5;

update  Department
set DeptManager=N'008'
where DeptID=4;

update  Department
set DeptManager=N'006'
where DeptID=1;

-- ---------------UPDATE Employee--------------------

update  Employee set Supervisor='005' where EmpID=N'009';

update  Employee set Supervisor='006' where EmpID=N'005';

update  Employee set Supervisor='001' where EmpID='007';

update  Employee set Supervisor='006' where EmpID='001';

update  Employee set Supervisor='005' where EmpID='004';

update  Employee set Supervisor='005' where EmpID='003';

update  Employee set Supervisor='001' where EmpID='008';

-- ---------------INSERT Dept_Location ------------------

insert into Dept_Location values(1,N'TP HCM');

insert into Dept_Location values(4,N'Hà Nội');

insert into Dept_Location values(5,N'Vũng Tàu');

insert into Dept_Location values(5,N'Nha Trang');

insert into Dept_Location values(5,N'TP HCM');

-- --------------- INSERT Dependent--------------------
insert into Dependent values('005', N'Trinh', N'Nam', '1976-04-05', N'Con gái');

insert into Dependent values('005', N'Khang', N'Nam', '1973-10-25', N'Con trai');

insert into Dependent values('005', N'Phương', N'Nữ', '1958-03-05', N'Vợ chồng');

insert into Dependent values('001', N'Minh', N'Nam', '1962-02-28', N'Vợ chồng');

insert into Dependent values('009', N'Tiến', N'Nam', '1978-01-01', N'Con trai');

insert into Dependent values('009', N'Châu', N'Nam', '1978-12-30', N'Con trai');

insert into Dependent values('009', N'Phương', N'Nữ', '1957-05-04', N'Vợ chồng');

-- --------------- INSERT Project--------------------
insert into Project values(N'Sản phẩm X', 1, N'Vũng Tàu', 5);

insert into Project values(N'Sản phẩm Y', 2, N'Nha Trang', 5);

insert into Project values(N'Sản phẩm Z', 3, N'TP HCM', 5);

insert into Project values(N'Tin học hóa', 10, N'Hà Nội', 4);

insert into Project values(N'Cáp quang', 20, N'TP HCM', 1);

insert into Project values(N'Đào tạo', 30, N'Hà Nội', 4);

----------------- INSERT Task--------------------
insert into Task (ProjectID, TaskNumber, TaskName) values (1, 	1, 	N'Thiet ke san pham X');

insert into Task (ProjectID, TaskNumber, TaskName) values (1, 	2, 	N'Thu nghiem san pham X');

insert into Task (ProjectID, TaskNumber, TaskName) values (2, 	1, 	N'San xuat san pham Y');

insert into Task (ProjectID, TaskNumber, TaskName) values (2, 	2, 	N'Quang cao san pham Y');

insert into Task (ProjectID, TaskNumber, TaskName) values (3, 	1, 	N'Khuyen mai san pham Z');

insert into Task (ProjectID, TaskNumber, TaskName) values (10, 1, 	N'Tin hoc hoa nhan su tien Salary');

insert into Task (ProjectID, TaskNumber, TaskName) values (10, 2, 	N'Tin hoc hoa DeptID Kinh doanh');

insert into Task (ProjectID, TaskNumber, TaskName) values (20, 1, 	N'Lap dat cap quang');

insert into Task (ProjectID, TaskNumber, TaskName) values (30, 1, 	N'Dao tao nhan vien Marketing');

insert into Task (ProjectID, TaskNumber, TaskName) values (30, 2,	N'Dao tao chuyen vien vien thiet ke');

insert into Works_on (EmpID,ProjectID,TaskNumber,WorkingHour) values ('009',	1,	1,	32);

insert into Works_on (EmpID,ProjectID,TaskNumber,WorkingHour) values ('009',	2,	2,	8);

insert into Works_on (EmpID,ProjectID,TaskNumber,WorkingHour) values ('004',	3,	1,	40);

insert into Works_on (EmpID,ProjectID,TaskNumber,WorkingHour) values ('003',	1,	2,	20.0);

insert into Works_on (EmpID,ProjectID,TaskNumber,WorkingHour) values ('003',	2,	1,	20.0);

insert into Works_on (EmpID,ProjectID,TaskNumber,WorkingHour) values ('008',	10,	1,	35);
----------------- INSERT Works_on--------------------

insert into Works_on (EmpID,ProjectID,TaskNumber,WorkingHour) values ('008',	30,	2,	5);

insert into Works_on (EmpID,ProjectID,TaskNumber,WorkingHour) values ('001',	30,	1,	20);

insert into Works_on (EmpID,ProjectID,TaskNumber,WorkingHour) values ('001',	20,	1,	15);

insert into Works_on (EmpID,ProjectID,TaskNumber,WorkingHour) values ('006',	20,	1,	30);

insert into Works_on (EmpID,ProjectID,TaskNumber,WorkingHour) values ('005',	3,	1,	10);

insert into Works_on (EmpID,ProjectID,TaskNumber,WorkingHour) values ('005',	10,	2,	10);

insert into Works_on (EmpID,ProjectID,TaskNumber,WorkingHour) values ('005',	20,	1,	10);

insert into Works_on (EmpID,ProjectID,TaskNumber,WorkingHour) values ('007',	30,	2,	30);

insert into Works_on (EmpID,ProjectID,TaskNumber,WorkingHour) values ('007',	10,	2,	10);

