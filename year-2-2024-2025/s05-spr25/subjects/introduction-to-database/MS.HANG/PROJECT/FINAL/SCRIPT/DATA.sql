USE University_Management;

-- Departments
INSERT IGNORE INTO departments (dept_id, dept_name) VALUES
  ('IT','Information Technology'),
  ('BUS','Business Administration'),
  ('MM','Multi‑Media');

-- Students
INSERT IGNORE INTO students (student_id, name, dob, address, phone_number, dept_id) VALUES
  ('S001','John Doe',    '2002-01-10','123 Main St','555-1001','IT'),
  ('S002','Jane Roe',    '2001-12-02','456 Elm St','555-1002','IT'),
  ('S003','Tom Clark',   '2003-03-15','789 Oak St','555-1003','BUS'),
  ('S004','Lisa Adams',  '2002-07-22','321 Pine St','555-1004','BUS'),
  ('S005','Gary White',  '2001-11-30','654 Cedar St','555-1005','MM'),
  ('S006','Nancy Green', '2003-05-18','987 Maple St','555-1006','MM'),
  ('S007','Peter Black','2002-09-09','147 Spruce St','555-1007','IT'),
  ('S008','Susan Gray',  '2003-02-27','258 Birch St','555-1008','BUS'),
  ('S009','Henry Blue',  '2001-08-08','369 Walnut St','555-1009','MM'),
  ('S010','Emma Silver','2002-04-04','159 Ash St','555-1010','IT');

-- Teachers
INSERT IGNORE INTO teachers (teacher_id, name, dob, phone_number, is_instructor, is_assistant, dept_id) VALUES
  ('T001','Alice Smith',    '1975-06-15','555-0101', TRUE, FALSE,'IT'),
  ('T002','Bob Johnson',    '1980-09-20','555-0102', FALSE,TRUE, 'IT'),
  ('T003','Carol Williams','1978-03-12','555-0201', TRUE, FALSE,'BUS'),
  ('T004','David Brown',    '1982-11-05','555-0202', FALSE,TRUE, 'BUS'),
  ('T005','Eve Davis',      '1979-07-30','555-0301', TRUE, FALSE,'MM'),
  ('T006','Frank Miller',   '1985-02-25','555-0302', FALSE,TRUE, 'MM');

-- Semesters
INSERT IGNORE INTO semesters (sem_id, year) VALUES
  ('FALL_2024',   2024),
  ('SPRING_2025', 2025),
  ('SUMMER_2025', 2025);

-- Subjects
INSERT IGNORE INTO subjects (module_id, roe, name, credit, dept_id) VALUES
  ('IT101','R','Programming Fundamentals',3,'IT'),
  ('IT102','R','Data Structures',        4,'IT'),
  ('IT201','E','Database Systems',       3,'IT'),
  ('IT202','E','Web Development',        3,'IT'),
  ('IT301','R','Network Security',       4,'IT'),
  ('IT302','E','Cloud Computing',        3,'IT'),
  ('BUS101','R','Principles of Management',3,'BUS'),
  ('BUS102','R','Financial Accounting',   3,'BUS'),
  ('BUS201','E','Marketing Basics',       3,'BUS'),
  ('BUS202','E','Business Law',           3,'BUS'),
  ('BUS301','R','Organizational Behavior',3,'BUS'),
  ('BUS302','E','Entrepreneurship',       3,'BUS'),
  ('MM101','R','Graphic Design Basics',  3,'MM'),
  ('MM102','R','Digital Photography',    3,'MM'),
  ('MM201','E','Video Production',       4,'MM'),
  ('MM202','E','Animation Principles',   4,'MM'),
  ('MM301','R','Audio Engineering',      3,'MM'),
  ('MM302','E','Interactive Media',      3,'MM');

-- Classes
INSERT IGNORE INTO classes (class_id, module_id, number_of_students, capacity, year, sem_id) VALUES
  ('F24_IT101_01','IT101',0,30,2024,'FALL_2024'),
  ('F24_IT102_01','IT102',0,30,2024,'FALL_2024'),
  ('F24_BUS101_01','BUS101',0,40,2024,'FALL_2024'),
  ('F24_BUS102_01','BUS102',0,40,2024,'FALL_2024'),
  ('F24_MM101_01','MM101',0,25,2024,'FALL_2024'),
  ('F24_MM102_01','MM102',0,25,2024,'FALL_2024'),
  ('SP25_IT201_01','IT201',0,30,2025,'SPRING_2025'),
  ('SP25_IT202_01','IT202',0,30,2025,'SPRING_2025'),
  ('SP25_BUS201_01','BUS201',0,40,2025,'SPRING_2025'),
  ('SP25_BUS202_01','BUS202',0,40,2025,'SPRING_2025'),
  ('SP25_MM201_01','MM201',0,25,2025,'SPRING_2025'),
  ('SP25_MM202_01','MM202',0,25,2025,'SPRING_2025'),
  ('SU25_IT301_01','IT301',0,30,2025,'SUMMER_2025'),
  ('SU25_IT302_01','IT302',0,30,2025,'SUMMER_2025'),
  ('SU25_BUS301_01','BUS301',0,40,2025,'SUMMER_2025'),
  ('SU25_BUS302_01','BUS302',0,40,2025,'SUMMER_2025'),
  ('SU25_MM301_01','MM301',0,25,2025,'SUMMER_2025'),
  ('SU25_MM302_01','MM302',0,25,2025,'SUMMER_2025');

-- Class–Teacher Assignments
INSERT IGNORE INTO class_teachers (class_id, teacher_id, role) VALUES
  ('F24_IT101_01','T001','Primary Instructor'),
  ('F24_IT101_01','T002','TA'),
  ('F24_IT102_01','T001','Primary Instructor'),
  ('F24_IT102_01','T002','TA'),
  ('F24_BUS101_01','T003','Primary Instructor'),
  ('F24_BUS101_01','T004','TA'),
  ('F24_BUS102_01','T003','Primary Instructor'),
  ('F24_BUS102_01','T004','TA'),
  ('F24_MM101_01','T005','Primary Instructor'),
  ('F24_MM101_01','T006','TA'),
  ('F24_MM102_01','T005','Primary Instructor'),
  ('F24_MM102_01','T006','TA'),
  ('SP25_IT201_01','T001','Primary Instructor'),
  ('SP25_IT201_01','T002','TA'),
  ('SP25_IT202_01','T001','Primary Instructor'),
  ('SP25_IT202_01','T002','TA'),
  ('SP25_BUS201_01','T003','Primary Instructor'),
  ('SP25_BUS201_01','T004','TA'),
  ('SP25_BUS202_01','T003','Primary Instructor'),
  ('SP25_BUS202_01','T004','TA'),
  ('SP25_MM201_01','T005','Primary Instructor'),
  ('SP25_MM201_01','T006','TA'),
  ('SP25_MM202_01','T005','Primary Instructor'),
  ('SP25_MM202_01','T006','TA'),
  ('SU25_IT301_01','T001','Primary Instructor'),
  ('SU25_IT301_01','T002','TA'),
  ('SU25_IT302_01','T001','Primary Instructor'),
  ('SU25_IT302_01','T002','TA'),
  ('SU25_BUS301_01','T003','Primary Instructor'),
  ('SU25_BUS301_01','T004','TA'),
  ('SU25_BUS302_01','T003','Primary Instructor'),
  ('SU25_BUS302_01','T004','TA'),
  ('SU25_MM301_01','T005','Primary Instructor'),
  ('SU25_MM301_01','T006','TA'),
  ('SU25_MM302_01','T005','Primary Instructor'),
  ('SU25_MM302_01','T006','TA');

-- Enrollments (SPR25 grades filled; SUM25 remain NULL)
INSERT IGNORE INTO enrollments (class_id, student_id, grade, status) VALUES
  -- FALL 2024
  ('F24_IT101_01','S001','A',   'Passed'),
  ('F24_IT102_01','S002','B+',  'Passed'),
  ('F24_BUS101_01','S003','B',  'Passed'),
  ('F24_BUS102_01','S004','A-','Passed'),
  ('F24_MM101_01','S005','B',  'Passed'),
  ('F24_MM102_01','S006','A',  'Passed'),
  -- SPRING 2025 (grades now non-NULL)
  ('SP25_IT201_01','S001','A',   'Passed'),
  ('SP25_IT201_01','S007','B+','Passed'),
  ('SP25_IT201_01','S008','A-','Passed'),
  ('SP25_IT202_01','S002','B',   'Passed'),
  ('SP25_IT202_01','S009','C',   'Passed'),
  ('SP25_IT202_01','S010','B-','Passed'),
  ('SP25_BUS201_01','S003','B',  'Passed'),
  ('SP25_BUS201_01','S007','C+','Passed'),
  ('SP25_BUS201_01','S008','B-','Passed'),
  ('SP25_BUS202_01','S004','B+','Passed'),
  ('SP25_BUS202_01','S009','B-','Passed'),
  ('SP25_BUS202_01','S010','C',  'Passed'),
  ('SP25_MM201_01','S005','B',   'Passed'),
  ('SP25_MM201_01','S007','A',   'Passed'),
  ('SP25_MM201_01','S008','A-','Passed'),
  ('SP25_MM202_01','S006','B+','Passed'),
  ('SP25_MM202_01','S009','C',   'Passed'),
  ('SP25_MM202_01','S010','B',   'Passed'),
  -- SUMMER 2025 (grades still NULL)
  ('SU25_IT301_01','S001',NULL,'Enrolled'),
  ('SU25_IT302_01','S002',NULL,'Enrolled'),
  ('SU25_BUS301_01','S003',NULL,'Enrolled'),
  ('SU25_BUS302_01','S004',NULL,'Enrolled'),
  ('SU25_MM301_01','S005',NULL,'Enrolled'),
  ('SU25_MM302_01','S006',NULL,'Enrolled');

-- Subject Prerequisites
INSERT IGNORE INTO subject_prerequisites (module_id, prerequisite_id) VALUES
  ('IT201','IT101'),('IT202','IT102'),('IT301','IT201'),('IT302','IT202'),
  ('BUS201','BUS101'),('BUS202','BUS102'),('BUS301','BUS201'),('BUS302','BUS202'),
  ('MM201','MM101'),('MM202','MM102'),('MM301','MM201'),('MM302','MM202');

-- Schedules
INSERT IGNORE INTO schedules (room, time_slot, class_id) VALUES
  ('IT-LAB1','MON-08:00–10:00','F24_IT101_01'),
  ('IT-LAB1','WED-08:00–10:00','F24_IT102_01'),
  ('BIZ-101','TUE-10:00–12:00','F24_BUS101_01'),
  ('BIZ-101','THU-10:00–12:00','F24_BUS102_01'),
  ('MM-STUDIO','WED-13:00–15:00','F24_MM101_01'),
  ('MM-STUDIO','FRI-13:00–15:00','F24_MM102_01'),
  ('IT-LAB2','MON-09:00–11:00','SP25_IT201_01'),
  ('IT-LAB2','WED-09:00–11:00','SP25_IT202_01'),
  ('BIZ-102','TUE-11:00–13:00','SP25_BUS201_01'),
  ('BIZ-102','THU-11:00–13:00','SP25_BUS202_01'),
  ('MM-STUDIO','WED-14:00–16:00','SP25_MM201_01'),
  ('MM-STUDIO','FRI-14:00–16:00','SP25_MM202_01'),
  ('IT-LAB3','MON-10:00–12:00','SU25_IT301_01'),
  ('IT-LAB3','WED-10:00–12:00','SU25_IT302_01'),
  ('BIZ-201','TUE-12:00–14:00','SU25_BUS301_01'),
  ('BIZ-201','THU-12:00–14:00','SU25_BUS302_01'),
  ('MM-STUDIO','WED-15:00–17:00','SU25_MM301_01'),
  ('MM-STUDIO','FRI-15:00–17:00','SU25_MM302_01');
