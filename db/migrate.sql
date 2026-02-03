\set ON_ERROR_STOP on

-- Ejecuta scripts en orden controlado
\i /db/schema.sql
\i /db/seed.sql
\i /db/reports_vw.sql
\i /db/indexes.sql
\i /db/roles.sql
