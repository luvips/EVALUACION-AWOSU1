-- View 1: vw_course_performance
-- Devuelve rendimiento por curso+periodo+programa.
-- Grain: 1 fila por course_code + term + program.
-- Metricas: total_students, avg_final, failed_count, fail_rate_pct.
-- VERIFY:
--   SELECT * FROM vw_course_performance ORDER BY term, course_code LIMIT 5;
--   SELECT COUNT(*) FROM vw_course_performance WHERE term = '2025-2';
CREATE OR REPLACE VIEW vw_course_performance AS
SELECT
    c.code AS course_code,
    c.name AS course_name,
    g.term,
    s.program,
    COUNT(DISTINCT e.id) AS total_students,
    CASE
        WHEN COUNT(gr.final) = 0 THEN NULL
        ELSE ROUND(AVG(gr.final), 2)
    END AS avg_final,
    SUM(CASE WHEN gr.final < 70 THEN 1 ELSE 0 END) AS failed_count,
    CASE
        WHEN COUNT(gr.final) = 0 THEN NULL
        ELSE ROUND(100.0 * SUM(CASE WHEN gr.final < 70 THEN 1 ELSE 0 END) / NULLIF(COUNT(gr.final), 0), 2)
    END AS fail_rate_pct
FROM courses c
JOIN groups g ON c.id = g.course_id
JOIN enrollments e ON g.id = e.group_id
JOIN students s ON e.student_id = s.id
LEFT JOIN grades gr ON e.id = gr.enrollment_id
GROUP BY c.code, c.name, g.term, s.program
HAVING COUNT(e.id) > 0;

-- View 2: vw_teacher_load
-- Devuelve carga docente por maestro+periodo.
-- Grain: 1 fila por teacher_id + term.
-- Metricas: groups_count, students_total, avg_course_score, avg_students_per_group.
-- VERIFY:
--   SELECT * FROM vw_teacher_load ORDER BY term, teacher_name LIMIT 5;
--   SELECT COUNT(*) FROM vw_teacher_load WHERE term = '2025-2';
CREATE OR REPLACE VIEW vw_teacher_load AS
SELECT
    t.id AS teacher_id,
    t.name AS teacher_name,
    g.term,
    COUNT(DISTINCT g.id) AS groups_count,
    COUNT(e.id) AS students_total,
    COALESCE(ROUND(AVG(gr.final), 2), 0) AS avg_course_score,
    ROUND(COUNT(e.id)::numeric / NULLIF(COUNT(DISTINCT g.id), 0), 2) AS avg_students_per_group

FROM teachers t
JOIN groups g ON t.id = g.teacher_id
JOIN enrollments e ON g.id = e.group_id
LEFT JOIN grades gr ON e.id = gr.enrollment_id
GROUP BY t.id, t.name, g.term
HAVING COUNT(e.id) > 0;

-- View 3: vw_students_at_risk
-- Devuelve alumnos en riesgo por promedio/asistencia.
-- Grain: 1 fila por student_id + term.
-- Metricas: avg_final, attendance_pct, risk_reason, risk_score.
-- VERIFY:
--   SELECT * FROM vw_students_at_risk ORDER BY risk_score DESC LIMIT 5;
--   SELECT COUNT(*) FROM vw_students_at_risk WHERE risk_score >= 2;
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
        WHEN AVG(COALESCE(gr.final, 0)) < 70 AND AVG(CASE WHEN ast.total_classes > 0 THEN (ast.attended_classes::numeric / ast.total_classes) * 100 ELSE 100 END) < 80 THEN 'Bajo promedio y baja asistencia'
        WHEN AVG(COALESCE(gr.final, 0)) < 70 THEN 'Bajo promedio'
        WHEN AVG(CASE WHEN ast.total_classes > 0 THEN (ast.attended_classes::numeric / ast.total_classes) * 100 ELSE 100 END) < 80 THEN 'Baja asistencia'
        ELSE 'Sin riesgo'
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
-- Devuelve asistencia por grupo.
-- Grain: 1 fila por group_id.
-- Metricas: total_sessions, present_sessions, attendance_pct.
-- VERIFY:
--   SELECT * FROM vw_attendance_by_group ORDER BY attendance_pct ASC LIMIT 5;
--   SELECT COUNT(*) FROM vw_attendance_by_group WHERE attendance_pct < 80;
CREATE OR REPLACE VIEW vw_attendance_by_group AS
SELECT
    g.id AS group_id,
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
-- Devuelve ranking por programa y periodo.
-- Grain: 1 fila por student_id + term + program.
-- Metricas: avg_final, rank_position, row_number.
-- VERIFY:
--   SELECT * FROM vw_rank_students ORDER BY program, term, rank_position LIMIT 5;
--   SELECT COUNT(*) FROM vw_rank_students WHERE program = 'Engineering';
CREATE OR REPLACE VIEW vw_rank_students AS
SELECT
    s.program,
    g.term,
    s.id AS student_id,
    s.name AS student_name,
    ROUND(AVG(COALESCE(gr.final, 0)), 2) AS avg_final,
    RANK() OVER (PARTITION BY s.program, g.term ORDER BY AVG(COALESCE(gr.final, 0)) DESC) AS rank_position,
    ROW_NUMBER() OVER (PARTITION BY s.program, g.term ORDER BY AVG(COALESCE(gr.final, 0)) DESC, s.id) AS row_number
FROM students s
JOIN enrollments e ON s.id = e.student_id
JOIN groups g ON e.group_id = g.id
JOIN grades gr ON e.id = gr.enrollment_id
GROUP BY s.program, g.term, s.id, s.name; 