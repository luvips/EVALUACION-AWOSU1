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
('Jorge Silva', 'jorge.silva@uni.edu'),
('Paula Rivas', 'paula.rivas@uni.edu'),
('Ricardo Núñez', 'ricardo.nunez@uni.edu');

INSERT INTO courses (code, name, credits) VALUES
('MAT101', 'Álgebra', 6),
('INF110', 'Programación I', 8),
('ADM200', 'Administración', 5),
('EST120', 'Estadística', 6),
('COM150', 'Comunicación', 4),
('ECO210', 'Economía', 5),
('FIS130', 'Física', 6),
('PSI101', 'Psicología', 4);

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
('Óscar Ponce', 'oponce@uni.edu', 'Arts', 2022),
('Isabel Mora', 'imora@uni.edu', 'Engineering', 2023),
('Tomás Delgado', 'tdelgado@uni.edu', 'Business', 2024),
('Camila Rojas', 'crojas@uni.edu', 'Arts', 2023),
('Luis Medina', 'lmedina@uni.edu', 'Engineering', 2022),
('Adriana Vela', 'avela@uni.edu', 'Business', 2021);

INSERT INTO groups (course_id, teacher_id, term) VALUES
(1, 1, '2025-1'),
(2, 1, '2025-1'),
(3, 2, '2025-1'),
(4, 3, '2025-1'),
(5, 4, '2025-1'),
(6, 2, '2025-2'),
(1, 3, '2025-2'),
(2, 4, '2025-2'),
(7, 5, '2025-2'),
(8, 6, '2025-3'),
(3, 5, '2025-3'),
(6, 6, '2025-3');

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
(24, 5, '2025-01-14'),
(25, 9, '2025-08-15'),
(26, 9, '2025-08-15'),
(27, 10, '2025-10-05'),
(28, 10, '2025-10-05'),
(29, 11, '2025-10-06'),
(29, 12, '2025-10-07'),
(1, 11, '2025-10-06'),
(5, 12, '2025-10-07');

INSERT INTO grades (enrollment_id, partial1, partial2, final)
SELECT
	e.id,
	40 + ((e.id * 7) % 61) AS partial1,
	35 + ((e.id * 11) % 66) AS partial2,
	CASE
		WHEN e.id % 10 = 0 THEN NULL
		WHEN e.id % 10 IN (1, 2) THEN 45 + ((e.id * 5) % 25)
		WHEN e.id % 10 IN (3, 4, 5) THEN 70 + ((e.id * 3) % 21)
		ELSE 85 + ((e.id * 2) % 16)
	END AS final
FROM enrollments e;

INSERT INTO attendance (enrollment_id, date, present)
SELECT
	e.id,
	DATE '2025-01-10' + (gs - 1) * INTERVAL '7 days',
	CASE
		WHEN e.id % 5 = 0 THEN (gs % 4) <> 0
		WHEN e.id % 5 = 1 THEN (gs % 6) <> 0
		WHEN e.id % 5 = 2 THEN (gs % 3) <> 0
		WHEN e.id % 5 = 3 THEN (gs % 5) <> 0
		ELSE TRUE
	END
FROM enrollments e
CROSS JOIN generate_series(1, 10) AS gs;
