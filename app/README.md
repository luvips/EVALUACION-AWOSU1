## Evaluación Práctica U1

Dashboard en Next.js que consume reportes desde VIEWS en PostgreSQL. La app corre con Docker Compose y usa un usuario de aplicación con permisos solo de lectura sobre las vistas.

## Requisitos

- Docker y Docker Compose.
- Archivo .env con las variables necesarias.

## Variables de entorno

Usa el archivo .env (puedes copiar .env.example):

```dotenv
POSTGRES_USER=
POSTGRES_PASSWORD=
POSTGRES_DB=
DB_APP_USER=
DB_APP_PASSWORD=
NODE_ENV=
```

Actualiza las variables con las credenciales que se enviaran en el comentario privado de Classroom.


## Cómo ejecutar

```bash
docker compose down -v
docker compose up --build
```

La app queda en http://localhost:3000.

## Estructura de la base de datos

- db/schema.sql
- db/seed.sql
- db/reports_vw.sql
- db/indexes.sql
- db/roles.sql
- db/migrate.sql
- scripts/roles.sh

## Vistas disponibles

- vw_course_performance
- vw_teacher_load
- vw_students_at_risk
- vw_attendance_by_group
- vw_rank_students

## Seguridad (usuario de app)

El usuario de la app no puede leer tablas, solo vistas.

Verificacion rapida:

```bash
docker exec -i awos-postgres psql -U "$DB_APP_USER" -d "$POSTGRES_DB" -c "SELECT * FROM vw_course_performance LIMIT 1;"
docker exec -i awos-postgres psql -U "$DB_APP_USER" -d "$POSTGRES_DB" -c "SELECT * FROM students LIMIT 1;"
```

La primera consulta debe funcionar. La segunda debe fallar por permisos.

Actualiza las variables con las credenciales que se enviaran en el comentario privado de Classroom.

## Filtros y paginación

- Filtros por periodo y programa en desempeño por curso.
- Búsqueda por nombre o email en estudiantes en riesgo.
- Paginación server-side en reportes.

## Evidencia EXPLAIN

Consulta 1:

Explica el plan de ejecucion para filtrar por periodo en vw_course_performance y evidencia el uso del indice en groups.term.

```sql
EXPLAIN SELECT * FROM vw_course_performance WHERE term = '2025-2';
```

Salida:

```text
GroupAggregate  (cost=21.43..21.49 rows=1 width=422)
  Group Key: c.code, c.name, g.term, s.program
  Filter: (count(e.id) > 0)
  ->  Sort  (cost=21.43..21.43 rows=1 width=351)
	  Sort Key: c.code, c.name, s.program
	  ->  Nested Loop Left Join  (cost=13.11..21.42 rows=1 width=351)
		  ->  Nested Loop  (cost=12.98..20.86 rows=1 width=346)
			  ->  Nested Loop  (cost=12.84..20.31 rows=1 width=342)
				  ->  Hash Join  (cost=12.69..14.10 rows=1 width=70)
					  Hash Cond: (e.group_id = g.id)
					  ->  Seq Scan on enrollments e  (cost=0.00..1.32 rows=32 width=12)
					  ->  Hash  (cost=12.64..12.64 rows=4 width=66)
						  ->  Bitmap Heap Scan on groups g  (cost=4.18..12.64 rows=4 width=66)
							  Recheck Cond: ((term)::text = '2025-2'::text)
							  ->  Bitmap Index Scan on idx_groups_term  (cost=0.00..4.18 rows=4 width=0)
								  Index Cond: ((term)::text = '2025-2'::text)
				  ->  Index Scan using courses_pkey on courses c  (cost=0.15..6.17 rows=1 width=280)
					  Index Cond: (id = g.course_id)
			  ->  Index Scan using students_pkey on students s  (cost=0.14..0.53 rows=1 width=12)
				  Index Cond: (id = e.student_id)
		  ->  Index Scan using idx_grades_enrollment on grades gr  (cost=0.14..0.53 rows=1 width=9)
			  Index Cond: (enrollment_id = e.id)
```

Consulta 2:

Explica el plan de ejecucion para la vista de estudiantes en riesgo, mostrando los joins y agregaciones usados para calcular el riesgo.

```sql
EXPLAIN SELECT * FROM vw_students_at_risk WHERE risk_score >= 2;
```

Salida:

```text
HashAggregate  (cost=36.19..37.28 rows=6 width=196)
  Group Key: s.id, g.term
  Filter: (((avg(COALESCE(gr.final, '0'::numeric)) < '70'::numeric) OR (avg(CASE WHEN (ast.total_classes > 0) THEN (((ast.attended_classes)::numeric / (ast.total_classes)::numeric) * '100'::numeric) ELSE '100'::numeric END) < '80'::numeric)) AND (CASE WHEN (avg(COALESCE(gr.final, '0'::numeric)) < '60'::numeric) THEN 3 WHEN (avg(COALESCE(gr.final, '0'::numeric)) < '70'::numeric) THEN 2 WHEN (avg(CASE WHEN (ast.total_classes > 0) THEN (((ast.attended_classes)::numeric / (ast.total_classes)::numeric) * '100'::numeric) ELSE '100'::numeric END) < '80'::numeric) THEN 1 ELSE 0 END >= 2))
  ->  Hash Left Join  (cost=12.17..35.47 rows=32 width=117)
	  Hash Cond: (e.id = ast.enrollment_id)
	  ->  Hash Left Join  (cost=3.53..26.73 rows=32 width=105)
		  Hash Cond: (e.id = gr.enrollment_id)
		  ->  Nested Loop  (cost=1.81..24.91 rows=32 width=100)
			  ->  Hash Join  (cost=1.65..3.07 rows=32 width=46)
				  Hash Cond: (e.student_id = s.id)
				  ->  Seq Scan on enrollments e  (cost=0.00..1.32 rows=32 width=12)
				  ->  Hash  (cost=1.29..1.29 rows=29 width=38)
					  ->  Seq Scan on students s  (cost=0.00..1.29 rows=29 width=38)
			  ->  Memoize  (cost=0.16..1.68 rows=1 width=62)
				  Cache Key: e.group_id
				  Cache Mode: logical
				  ->  Index Scan using groups_pkey on groups g  (cost=0.15..1.67 rows=1 width=62)
					  Index Cond: (id = e.group_id)
		  ->  Hash  (cost=1.32..1.32 rows=32 width=9)
			  ->  Seq Scan on grades gr  (cost=0.00..1.32 rows=32 width=9)
	  ->  Hash  (cost=8.24..8.24 rows=32 width=20)
		  ->  Subquery Scan on ast  (cost=7.60..8.24 rows=32 width=20)
			  ->  HashAggregate  (cost=7.60..7.92 rows=32 width=20)
				  Group Key: attendance.enrollment_id
				  ->  Seq Scan on attendance  (cost=0.00..5.20 rows=320 width=5)
```
