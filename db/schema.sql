CREATE SCHEMA IF NOT EXISTS university;

-- profes
CREATE TABLE IF NOT EXISTS teachers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL
);

-- cursos
CREATE TABLE IF NOT EXISTS courses (
    id SERIAL PRIMARY KEY,
    code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    credits INT NOT NULL CHECK (credits > 0)
);

-- estudiantes 
CREATE TABLE IF NOT EXISTS students (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    program VARCHAR(50) NOT NULL,
    enrollment_year INT NOT NULL CHECK (enrollment_year >= 2000)
);

--  grupos
CREATE TABLE IF NOT EXISTS groups (
    id SERIAL PRIMARY KEY,
    course_id INT NOT NULL REFERENCES courses(id),
    teacher_id INT NOT NULL REFERENCES teachers(id),
    term VARCHAR(20) NOT NULL,
    UNIQUE(course_id, teacher_id, term)
);

-- inscripciones 
CREATE TABLE IF NOT EXISTS enrollments (
    id SERIAL PRIMARY KEY,
    student_id INT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    group_id INT NOT NULL REFERENCES groups(id),
    enrolled_at DATE NOT NULL, 
    UNIQUE(student_id, group_id) 
);

--  calificaciones
CREATE TABLE IF NOT EXISTS grades (
    id SERIAL PRIMARY KEY,
    enrollment_id INT UNIQUE NOT NULL REFERENCES enrollments(id) ON DELETE CASCADE,
    partial1 DECIMAL(5,2) CHECK (partial1 BETWEEN 0 AND 100),
    partial2 DECIMAL(5,2) CHECK (partial2 BETWEEN 0 AND 100),
    final DECIMAL(5,2) CHECK (final BETWEEN 0 AND 100)
);

--  asistencia
CREATE TABLE IF NOT EXISTS attendance (
    id SERIAL PRIMARY KEY,
    enrollment_id INT NOT NULL REFERENCES enrollments(id) ON DELETE CASCADE,
    date DATE NOT NULL, 
    present BOOLEAN DEFAULT FALSE
);