DO $$
BEGIN
	IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'app_user') THEN
		CREATE ROLE app_user LOGIN PASSWORD 'app_password';
	END IF;
END $$;

GRANT CONNECT ON DATABASE awosdb TO app_user;
GRANT USAGE ON SCHEMA public TO app_user;

REVOKE ALL ON ALL TABLES IN SCHEMA public FROM app_user;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM app_user;

GRANT SELECT ON vw_course_performance TO app_user;
GRANT SELECT ON vw_teacher_load TO app_user;
GRANT SELECT ON vw_students_at_risk TO app_user;
GRANT SELECT ON vw_attendance_by_group TO app_user;
GRANT SELECT ON vw_rank_students TO app_user;

ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON TABLES FROM app_user;
