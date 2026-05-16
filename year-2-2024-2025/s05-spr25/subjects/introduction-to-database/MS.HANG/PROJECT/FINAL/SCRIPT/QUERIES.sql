-- Level 1 (Very Easy)
-- Q1) List all departments.
SELECT
  dept_id,
  dept_name
FROM
  departments;

-- ---------------------------------------------------------------------------
-- Level 2 (Easy)
-- Q2) Retrieve the student ID, name and phone number of all students in the IT department.
SELECT
  student_id,
  name,
  phone_number
FROM
  students
WHERE
  dept_id = 'IT';

-- ---------------------------------------------------------------------------
-- Level 3 (Moderate)
-- Q3) For each class in SPRING_2025, count how many students are enrolled.
SELECT
  c.class_id,
  COUNT(e.student_id) AS student_count
FROM
  classes AS c JOIN enrollments AS e ON c.class_id = e.class_id
WHERE
  c.sem_id = 'SPRING_2025'
GROUP BY
  c.class_id;

-- ---------------------------------------------------------------------------
-- Level 4 (Advanced)
-- Q4) Compute the average grade (as points) per subject for FALL_2024, showing only subjects with avg ≥ 3.0.
--     Grade → Points: A=4.0, A–=3.7, B+=3.3, B=3.0, B–=2.7, C+=2.3, C=2.0
SELECT
  s.module_id,
  s.name AS subject_name,
  ROUND(
    AVG(
      CASE e.grade
        WHEN 'A'  THEN 4.0
        WHEN 'A-' THEN 3.7
        WHEN 'B+' THEN 3.3
        WHEN 'B'  THEN 3.0
        WHEN 'B-' THEN 2.7
        WHEN 'C+' THEN 2.3
        WHEN 'C'  THEN 2.0
        ELSE NULL
      END
    ), 1
  ) AS avg_points
FROM
  classes AS c JOIN subjects AS s  ON c.module_id = s.module_id
               JOIN enrollments AS e  ON c.class_id  = e.class_id
WHERE
  c.sem_id    = 'FALL_2024'
  AND e.grade IS NOT NULL
GROUP BY
  s.module_id,
  s.name
HAVING
  avg_points >= 3.0
ORDER BY
  avg_points DESC,
  s.module_id;

-- ---------------------------------------------------------------------------
-- Level 5 (Complex & Cool)
-- Q5) Find students who have passed all prerequisites for “Web Development” (IT202)
--     but are NOT enrolled in any IT202 class in SPRING_2025.

-- Mini table 1
WITH prerequisite_list AS (
  SELECT
    prerequisite_id
  FROM
    subject_prerequisites
  WHERE
    module_id = 'IT202'
),
-- Mini table 2
passed_prereqs AS (
  SELECT
    e.student_id,
    sp.prerequisite_id
  FROM
    subject_prerequisites AS sp
    JOIN classes      AS c  ON c.module_id = sp.prerequisite_id
    JOIN enrollments  AS e  ON e.class_id  = c.class_id
  WHERE
    sp.module_id = 'IT202'
    AND e.status   = 'Passed'
),
-- Mini table 3
eligible_students AS (
  SELECT
    student_id
  FROM
    passed_prereqs
  GROUP BY
    student_id
  HAVING
    COUNT(DISTINCT prerequisite_id) = (SELECT COUNT(*) FROM prerequisite_list)
),
-- Mini table4
spring_it202 AS (
  SELECT
    class_id
  FROM
    classes
  WHERE
    module_id = 'IT202'
    AND sem_id  = 'SPRING_2025'
)
SELECT
  es.student_id,
  st.name
FROM
  eligible_students AS es JOIN students AS st ON es.student_id = st.student_id
						  LEFT JOIN enrollments AS e ON es.student_id = e.student_id
AND e.class_id   IN (SELECT class_id FROM spring_it202)
WHERE
  e.student_id IS NULL
ORDER BY
  es.student_id;
