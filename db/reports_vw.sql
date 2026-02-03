-- View: vw_course_performance
CREATE OR REPLACE VIEW vw_course_performance AS
SELECT 
    c.name AS course_name,
    g.term,
    COUNT(e.id) AS total_students,
    ROUND(AVG(COALESCE(gr.final, 0)), 2) AS average_score,
    COUNT(CASE WHEN gr.final < 70 THEN 1 END) AS failed_count
FROM courses c
JOIN groups g ON c.id = g.course_id
JOIN enrollments e ON g.id = e.group_id
LEFT JOIN grades gr ON e.id = gr.enrollment_id
GROUP BY c.id, c.name, g.term
HAVING COUNT(e.id) > 0;

-- View: vw_teacher_load (HAVING)
CREATE OR REPLACE VIEW vw_teacher_load AS
SELECT


-- View: vw_students_at_risk (CTE)
CREATE OR REPLACE VIEW vw_students_at_risk AS
SELECT

-- View:vw_attendance_by_group (CASE/COALESCE)
CREATE OR REPLACE VIEW vw_attendance_by_group AS
SELECT

-- View: vw_rank_students (Window)
CREATE OR REPLACE VIEW vw_rank_students AS
SELECT 
    s.program,
    s.name,
    g.term,
    ROUND(AVG(gr.final), 2) as global_average,
    RANK() OVER (PARTITION BY s.program, g.term ORDER BY AVG(gr.final) DESC) as rank_position
FROM students s
JOIN enrollments e ON s.id = e.student_id
JOIN groups g ON e.group_id = g.id
JOIN grades gr ON e.id = gr.enrollment_id
GROUP BY s.id, s.name, s.program, g.term;
-- View: