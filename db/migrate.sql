\set ON_ERROR_STOP on

\i /docker-entrypoint-initdb.d/1-schema.sql
\i /docker-entrypoint-initdb.d/2-seed.sql
\i /docker-entrypoint-initdb.d/3-reports_vw.sql
\i /docker-entrypoint-initdb.d/4-indexes.sql
