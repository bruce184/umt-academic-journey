-- ---------------------------------------------------------
-- Bước 2 : TẠO RÀNG BUỘC KHÓA NGOẠI
-- ---------------------------------------------------------
alter table Employee add constraint FK_Employee_Employee foreign key (Supervisor) references  Employee(EmpID);

alter table Employee add constraint FK_Employee_Department foreign key (DeptID) references  Department(DeptID);

alter table Department add constraint FK_Department_Employee foreign key (DeptManager) references  Employee(EmpID);

alter table Dept_Location add constraint FK_Dept_Location_Department foreign key (DeptID) references  Department(DeptID);

alter table Works_on add constraint FK_Works_on_Employee foreign key (EmpID) references  Employee(EmpID);

alter table Works_on add constraint FK_Works_on_Task foreign key (ProjectID, TaskNumber) references  Task(ProjectID, TaskNumber);

alter table Task add constraint FK_Task_Project foreign key (ProjectID) references  Project(ProjectID);

alter table Dependent add constraint FK_Dependent_Employee foreign key (EmpID) references  Employee(EmpID);

alter table Project add constraint FK_Project_Department foreign key (DeptID) references  Department(DeptID);