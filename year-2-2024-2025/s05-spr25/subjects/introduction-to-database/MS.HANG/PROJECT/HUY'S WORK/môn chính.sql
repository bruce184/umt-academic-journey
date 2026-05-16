-- 8. Bảng Prerequisites (Môn tiên quyết - Bảng nối Subject-Subject)
CREATE TABLE Prerequisites (
    Subject_ModuleID VARCHAR(10) NOT NULL,
    Prerequisite_ModuleID VARCHAR(10) NOT NULL,
    PRIMARY KEY (Subject_ModuleID, Prerequisite_ModuleID)
);
