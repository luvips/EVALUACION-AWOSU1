DO $$
DECLARE
	app_user text := '__DB_APP_USER__';
	app_password text := '__DB_APP_PASSWORD__';
	db_name text := '__POSTGRES_DB__';
BEGIN
	IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = app_user) THEN
		EXECUTE format('CREATE ROLE %I LOGIN PASSWORD %L', app_user, app_password);
	END IF;

	EXECUTE format('GRANT CONNECT ON DATABASE %I TO %I', db_name, app_user);
	EXECUTE format('GRANT USAGE ON SCHEMA public TO %I', app_user);

	EXECUTE format('REVOKE ALL ON ALL TABLES IN SCHEMA public FROM %I', app_user);
	EXECUTE format('REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM %I', app_user);

	EXECUTE format('GRANT SELECT ON vw_course_performance TO %I', app_user);
	EXECUTE format('GRANT SELECT ON vw_teacher_load TO %I', app_user);
	EXECUTE format('GRANT SELECT ON vw_students_at_risk TO %I', app_user);
	EXECUTE format('GRANT SELECT ON vw_attendance_by_group TO %I', app_user);
	EXECUTE format('GRANT SELECT ON vw_rank_students TO %I', app_user);

	EXECUTE format('ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON TABLES FROM %I', app_user);
END $$;
