-- =========================================
-- F1.1 FUNCTION: tính lại final_grade cho 1 enrollment
-- Công thức: final = SUM(grade * ratio) / SUM(ratio)
-- =========================================
CREATE OR REPLACE FUNCTION fn_recalculate_final_grade(p_enrollment_id INT)
RETURNS VOID AS $$
DECLARE
    v_total_weight NUMERIC(5,2);
    v_weighted_sum NUMERIC(10,3);
BEGIN
    SELECT
        COALESCE(SUM(a.ratio), 0),
        COALESCE(SUM(g.grade * a.ratio), 0)
    INTO
        v_total_weight,
        v_weighted_sum
    FROM gradings g
    JOIN assessments a ON g.assessment_id = a.assessment_id
    WHERE g.enrollment_id = p_enrollment_id;

    IF v_total_weight > 0 THEN
        UPDATE enrollments
        SET final_grade = ROUND(v_weighted_sum / v_total_weight, 1)
        WHERE enrollment_id = p_enrollment_id;
    ELSE
        UPDATE enrollments
        SET final_grade = NULL
        WHERE enrollment_id = p_enrollment_id;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- =========================================
-- F1.2 TRIGGER FUNCTION: sau khi INSERT/UPDATE/DELETE trên gradings
-- Tự động gọi fn_recalculate_final_grade
-- =========================================
CREATE OR REPLACE FUNCTION trg_gradings_after_change()
RETURNS TRIGGER AS $$
DECLARE
    v_enrollment_id INT;
BEGIN
    IF TG_OP IN ('INSERT', 'UPDATE') THEN
        v_enrollment_id := NEW.enrollment_id;
    ELSIF TG_OP = 'DELETE' THEN
        v_enrollment_id := OLD.enrollment_id;
    END IF;

    PERFORM fn_recalculate_final_grade(v_enrollment_id);

    RETURN NULL;  -- AFTER trigger không cần trả row
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tg_gradings_after_change ON gradings;
CREATE TRIGGER tg_gradings_after_change
AFTER INSERT OR UPDATE OR DELETE ON gradings
FOR EACH ROW
EXECUTE FUNCTION trg_gradings_after_change();

-- =========================================
-- F2.1 FUNCTION: kiểm tra tổng ratio <= 100 cho mỗi course
-- =========================================
CREATE OR REPLACE FUNCTION trg_assessments_check_ratio()
RETURNS TRIGGER AS $$
DECLARE
    v_sum NUMERIC(5,2);
BEGIN
    SELECT COALESCE(SUM(ratio), 0)
    INTO v_sum
    FROM assessments
    WHERE course_id = NEW.course_id
      AND (TG_OP = 'INSERT' OR assessment_id <> NEW.assessment_id);

    v_sum := v_sum + COALESCE(NEW.ratio, 0);

    IF v_sum > 100 THEN
        RAISE EXCEPTION
            'Total assessment ratio for course % would exceed 100%% (%.2f%%)',
            NEW.course_id, v_sum;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =========================================
-- F2.2 TRIGGER: BEFORE INSERT/UPDATE trên assessments
-- =========================================
DROP TRIGGER IF EXISTS tg_assessments_check_ratio ON assessments;
CREATE TRIGGER tg_assessments_check_ratio
BEFORE INSERT OR UPDATE ON assessments
FOR EACH ROW
EXECUTE FUNCTION trg_assessments_check_ratio();

-- =========================================
-- F3.1 FUNCTION: kiểm tra capacity khi INSERT enrollments
-- Nếu đã đủ chỗ -> chuyển NEW.status thành 'WAITLISTED'
-- =========================================
CREATE OR REPLACE FUNCTION trg_enrollments_capacity_check()
RETURNS TRIGGER AS $$
DECLARE
    v_capacity INT;
    v_current  INT;
BEGIN
    -- Lấy chỉ tiêu lớp
    SELECT quantity INTO v_capacity
    FROM opening_courses
    WHERE opening_course_code = NEW.opening_course_code
    FOR UPDATE;

    IF v_capacity IS NULL THEN
        -- Không tìm thấy lớp -> báo lỗi
        RAISE EXCEPTION 'Opening course % not found', NEW.opening_course_code;
    END IF;

    -- Đếm số SV đã ENROLLED
    SELECT COUNT(*) INTO v_current
    FROM enrollments
    WHERE opening_course_code = NEW.opening_course_code
      AND status = 'ENROLLED';

    IF v_current >= v_capacity THEN
        -- Đổi status thành WAITLISTED
        NEW.status := 'WAITLISTED';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =========================================
-- F3.2 TRIGGER: BEFORE INSERT trên enrollments
-- =========================================
DROP TRIGGER IF EXISTS tg_enrollments_capacity_check ON enrollments;
CREATE TRIGGER tg_enrollments_capacity_check
BEFORE INSERT ON enrollments
FOR EACH ROW
EXECUTE FUNCTION trg_enrollments_capacity_check();

-- =========================================
-- F4.1 FUNCTION: audit generic cho INSERT/UPDATE/DELETE
-- Lưu vào bảng audit_logs
-- =========================================
CREATE OR REPLACE FUNCTION trg_audit_generic()
RETURNS TRIGGER AS $$
DECLARE
    v_user_id INT;
    v_desc    TEXT;
BEGIN
    -- Lấy current user id từ session setting (optional)
    BEGIN
        v_user_id := current_setting('app.current_user_id')::INT;
    EXCEPTION WHEN OTHERS THEN
        v_user_id := NULL;
    END;

    IF TG_OP = 'INSERT' THEN
        v_desc := format('Inserted in %s: %s',
                         TG_TABLE_NAME, row_to_json(NEW));
    ELSIF TG_OP = 'UPDATE' THEN
        v_desc := format('Updated in %s: old=%s new=%s',
                         TG_TABLE_NAME, row_to_json(OLD), row_to_json(NEW));
    ELSIF TG_OP = 'DELETE' THEN
        v_desc := format('Deleted from %s: %s',
                         TG_TABLE_NAME, row_to_json(OLD));
    END IF;

    INSERT INTO audit_logs(user_id, action_type, entity, description)
    VALUES (v_user_id, TG_OP, TG_TABLE_NAME, v_desc);

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- =========================================
-- F4.2 TRIGGERS: gắn audit_generic vào các bảng quan trọng
-- =========================================
DROP TRIGGER IF EXISTS tg_audit_users ON users;
CREATE TRIGGER tg_audit_users
AFTER INSERT OR UPDATE OR DELETE ON users
FOR EACH ROW EXECUTE FUNCTION trg_audit_generic();

DROP TRIGGER IF EXISTS tg_audit_courses ON courses;
CREATE TRIGGER tg_audit_courses
AFTER INSERT OR UPDATE OR DELETE ON courses
FOR EACH ROW EXECUTE FUNCTION trg_audit_generic();

DROP TRIGGER IF EXISTS tg_audit_opening_courses ON opening_courses;
CREATE TRIGGER tg_audit_opening_courses
AFTER INSERT OR UPDATE OR DELETE ON opening_courses
FOR EACH ROW EXECUTE FUNCTION trg_audit_generic();

DROP TRIGGER IF EXISTS tg_audit_enrollments ON enrollments;
CREATE TRIGGER tg_audit_enrollments
AFTER INSERT OR UPDATE OR DELETE ON enrollments
FOR EACH ROW EXECUTE FUNCTION trg_audit_generic();

DROP TRIGGER IF EXISTS tg_audit_assessments ON assessments;
CREATE TRIGGER tg_audit_assessments
AFTER INSERT OR UPDATE OR DELETE ON assessments
FOR EACH ROW EXECUTE FUNCTION trg_audit_generic();

DROP TRIGGER IF EXISTS tg_audit_gradings ON gradings;
CREATE TRIGGER tg_audit_gradings
AFTER INSERT OR UPDATE OR DELETE ON gradings
FOR EACH ROW EXECUTE FUNCTION trg_audit_generic();

DROP TRIGGER IF EXISTS tg_audit_requests ON requests;
CREATE TRIGGER tg_audit_requests
AFTER INSERT OR UPDATE OR DELETE ON requests
FOR EACH ROW EXECUTE FUNCTION trg_audit_generic();
