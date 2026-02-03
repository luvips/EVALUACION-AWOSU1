TRUNCATE TABLE attendance RESTART IDENTITY CASCADE;
TRUNCATE TABLE grades RESTART IDENTITY CASCADE;
TRUNCATE TABLE enrollments RESTART IDENTITY CASCADE;
TRUNCATE TABLE groups RESTART IDENTITY CASCADE;
TRUNCATE TABLE students RESTART IDENTITY CASCADE;
TRUNCATE TABLE courses RESTART IDENTITY CASCADE;
TRUNCATE TABLE teachers RESTART IDENTITY CASCADE;

INSERT INTO teachers (name, email) VALUES
('Ana Torres', 'ana.torres@uni.edu'),
('Luis Paredes', 'luis.paredes@uni.edu'),
('María López', 'maria.lopez@uni.edu'),
('Jorge Silva', 'jorge.silva@uni.edu');

INSERT INTO courses (code, name, credits) VALUES
('MAT101', 'Álgebra', 6),
('INF110', 'Programación I', 8),
('ADM200', 'Administración', 5),
('EST120', 'Estadística', 6),
('COM150', 'Comunicación', 4),
('ECO210', 'Economía', 5);

INSERT INTO students (name, email, program, enrollment_year) VALUES
('Carlos Vega', 'cvega@uni.edu', 'Engineering', 2023),
('Lucía Reyes', 'lreyes@uni.edu', 'Engineering', 2022),
('Miguel Soto', 'msoto@uni.edu', 'Engineering', 2023),
('Paola Díaz', 'pdiaz@uni.edu', 'Engineering', 2024),
('Sara Cruz', 'scruz@uni.edu', 'Business', 2022),
('Diego Lara', 'dlara@uni.edu', 'Business', 2023),
('Valeria Pinto', 'vpinto@uni.edu', 'Business', 2024),
('José Méndez', 'jmendez@uni.edu', 'Business', 2023),
('Elena Mora', 'emora@uni.edu', 'Arts', 2022),
('Andrés Ruiz', 'aruiz@uni.edu', 'Arts', 2024),
('Nadia Ríos', 'nrios@uni.edu', 'Arts', 2023),
('Kevin León', 'kleon@uni.edu', 'Arts', 2022),
('Gabriela Peña', 'gpena@uni.edu', 'Engineering', 2021),
('Santiago Gil', 'sgil@uni.edu', 'Engineering', 2022),
('Rosa Flores', 'rflores@uni.edu', 'Business', 2021),
('Iván Campos', 'icampos@uni.edu', 'Business', 2022),
('Mónica Salas', 'msalas@uni.edu', 'Arts', 2021),
('Pedro Salazar', 'psalazar@uni.edu', 'Arts', 2023),
('Daniela Nieto', 'dnieto@uni.edu', 'Engineering', 2024),
('Hugo Valdez', 'hvaldez@uni.edu', 'Business', 2024),
('Rebeca Luna', 'rluna@uni.edu', 'Arts', 2024),
('Mario Ortiz', 'mortiz@uni.edu', 'Engineering', 2022),
('Claudia Fuentes', 'cfuentes@uni.edu', 'Business', 2023),
('Óscar Ponce', 'oponce@uni.edu', 'Arts', 2022);

INSERT INTO groups (course_id, teacher_id, term) VALUES
(1, 1, '2025-1'),
(2, 1, '2025-1'),
(3, 2, '2025-1'),
(4, 3, '2025-1'),
(5, 4, '2025-1'),
(6, 2, '2025-2'),
(1, 3, '2025-2'),
(2, 4, '2025-2');

INSERT INTO enrollments (student_id, group_id, enrolled_at) VALUES
(1, 1, '2025-01-10'),
(2, 1, '2025-01-10'),
(3, 2, '2025-01-11'),
(4, 2, '2025-01-11'),
(5, 3, '2025-01-12'),
(6, 3, '2025-01-12'),
(7, 3, '2025-01-12'),
(8, 4, '2025-01-13'),
(9, 4, '2025-01-13'),
(10, 4, '2025-01-13'),
(11, 5, '2025-01-14'),
(12, 5, '2025-01-14'),
(13, 6, '2025-08-10'),
(14, 6, '2025-08-10'),
(15, 6, '2025-08-10'),
(16, 7, '2025-08-11'),
(17, 7, '2025-08-11'),
(18, 7, '2025-08-11'),
(19, 8, '2025-08-12'),
(20, 8, '2025-08-12'),
(21, 8, '2025-08-12'),
(22, 1, '2025-01-10'),
(23, 3, '2025-01-12'),
(24, 5, '2025-01-14');

INSERT INTO grades (enrollment_id, partial1, partial2, final)
SELECT
	e.id,
	55 + (e.id % 30) AS partial1,
	50 + (e.id % 35) AS partial2,
	CASE WHEN e.id % 7 = 0 THEN NULL ELSE 48 + (e.id % 52) END AS final
FROM enrollments e;

INSERT INTO attendance (enrollment_id, date, present)
SELECT
	e.id,
	DATE '2025-01-10' + (gs - 1) * INTERVAL '7 days',
	CASE WHEN (e.id + gs) % 5 = 0 THEN FALSE ELSE TRUE END
FROM enrollments e
CROSS JOIN generate_series(1, 5) AS gs;
