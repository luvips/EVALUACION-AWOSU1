-- Índices para optimizar filtros y joins de reportes
CREATE INDEX IF NOT EXISTS idx_students_program ON students(program);
CREATE INDEX IF NOT EXISTS idx_groups_term ON groups(term);
CREATE INDEX IF NOT EXISTS idx_enrollments_student_group ON enrollments(student_id, group_id);
CREATE INDEX IF NOT EXISTS idx_grades_enrollment ON grades(enrollment_id);
CREATE INDEX IF NOT EXISTS idx_attendance_enrollment ON attendance(enrollment_id);
