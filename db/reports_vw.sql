-- View 1: vw_course_performance
CREATE OR REPLACE VIEW vw_course_performance AS
SELECT
    c.code AS course_code,
    c.name AS course_name,
    g.term,
    s.program,
    COUNT(DISTINCT e.id) AS total_students,
    ROUND(AVG(COALESCE(gr.final, 0)), 2) AS avg_final,
    SUM(CASE WHEN gr.final < 70 THEN 1 ELSE 0 END) AS failed_count,
    ROUND(100.0 * SUM(CASE WHEN gr.final < 70 THEN 1 ELSE 0 END) / NULLIF(COUNT(gr.final), 0), 2) AS fail_rate_pct
FROM courses c
JOIN groups g ON c.id = g.course_id
JOIN enrollments e ON g.id = e.group_id
JOIN students s ON e.student_id = s.id
LEFT JOIN grades gr ON e.id = gr.enrollment_id
GROUP BY c.code, c.name, g.term, s.program
HAVING COUNT(e.id) > 0;

-- View 2: vw_teacher_load
CREATE OR REPLACE VIEW vw_teacher_load AS
SELECT
    t.id AS teacher_id,
    t.name AS teacher_name,
    g.term,
    COUNT(DISTINCT g.id) AS groups_count,
    COUNT(e.id) AS students_total,
    ROUND(AVG(COALESCE(gr.final, 0)), 2) AS avg_course_score,
    ROUND(COUNT(e.id)::numeric / NULLIF(COUNT(DISTINCT g.id), 0), 2) AS avg_students_per_group

FROM teachers t
JOIN groups g ON t.id = g.teacher_id
JOIN enrollments e ON g.id = e.group_id
LEFT JOIN grades gr ON e.id = gr.enrollment_id
GROUP BY t.id, t.name, g.term
HAVING COUNT(e.id) > 0;

-- View 3: vw_students_at_risk
CREATE OR REPLACE VIEW vw_students_at_risk AS
WITH attendance_stats AS (
    SELECT
        enrollment_id,
        COUNT(*) AS total_classes,
        SUM(CASE WHEN present THEN 1 ELSE 0 END) AS attended_classes
    FROM attendance
    GROUP BY enrollment_id
)
SELECT
    s.id AS student_id,
    s.name AS student_name,
    s.email,
    s.program,
    g.term,
    ROUND(AVG(COALESCE(gr.final, 0)), 2) AS avg_final,
    ROUND(AVG(CASE WHEN ast.total_classes > 0 THEN (ast.attended_classes::numeric / ast.total_classes) * 100 ELSE 100 END), 1) AS attendance_pct,
    CASE
        WHEN AVG(COALESCE(gr.final, 0)) < 70 AND AVG(CASE WHEN ast.total_classes > 0 THEN (ast.attended_classes::numeric / ast.total_classes) * 100 ELSE 100 END) < 80 THEN 'LOW_BOTH'
        WHEN AVG(COALESCE(gr.final, 0)) < 70 THEN 'LOW_GRADE'
        WHEN AVG(CASE WHEN ast.total_classes > 0 THEN (ast.attended_classes::numeric / ast.total_classes) * 100 ELSE 100 END) < 80 THEN 'LOW_ATTENDANCE'
        ELSE 'OK'
    END AS risk_reason,
    CASE
        WHEN AVG(COALESCE(gr.final, 0)) < 60 THEN 3
        WHEN AVG(COALESCE(gr.final, 0)) < 70 THEN 2
        WHEN AVG(CASE WHEN ast.total_classes > 0 THEN (ast.attended_classes::numeric / ast.total_classes) * 100 ELSE 100 END) < 80 THEN 1
        ELSE 0
    END AS risk_score
FROM students s
JOIN enrollments e ON s.id = e.student_id
JOIN groups g ON e.group_id = g.id
LEFT JOIN grades gr ON e.id = gr.enrollment_id
LEFT JOIN attendance_stats ast ON e.id = ast.enrollment_id
GROUP BY s.id, s.name, s.email, s.program, g.term
HAVING AVG(COALESCE(gr.final, 0)) < 70 OR AVG(CASE WHEN ast.total_classes > 0 THEN (ast.attended_classes::numeric / ast.total_classes) * 100 ELSE 100 END) < 80;


-- View 4: vw_attendance_by_group
CREATE OR REPLACE VIEW vw_attendance_by_group AS
SELEC
    g.id AS group_id
    c.code AS course_code,
    c.name AS course_name,
    g.term,
    COUNT(a.id) AS total_sessions,
    SUM(CASE WHEN a.present THEN 1 ELSE 0 END) AS present_sessions,
    COALESCE(
        ROUND(100.0 * SUM(CASE WHEN a.present THEN 1 ELSE 0 END) / NULLIF(COUNT(a.id), 0), 2),
        0
    ) AS attendance_pct
FROM groups g
JOIN courses c ON g.course_id = c.id
JOIN enrollments e ON g.id = e.group_id
LEFT JOIN attendance a ON e.id = a.enrollment_id
GROUP BY g.id, c.code, c.name, g.term;

-- View 5: vw_rank_students
CREATE OR REPLACE VIEW vw_rank_students AS
SELECT
    s.program,
    g.term,
    s.id AS student_id,
    s.name AS student_name,
    ROUND(AVG(gr.final), 2) AS avg_final,
    RANK() OVER (PARTITION BY s.program, g.term ORDER BY AVG(gr.final) DESC) AS rank_position,
    ROW_NUMBER() OVER (PARTITION BY s.program, g.term ORDER BY AVG(gr.final) DESC, s.id) AS row_number
FROM students s
JOIN enrollments e ON s.id = e.student_id
JOIN groups g ON e.group_id = g.id
JOIN grades gr ON e.id = gr.enrollment_id
GROUP BY s.program, g.term, s.id, s.name; 