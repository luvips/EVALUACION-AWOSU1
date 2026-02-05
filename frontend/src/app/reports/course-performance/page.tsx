import { query } from '@/lib/db';
import DataTable from '@/components/DataTable';

export const dynamic = 'force-dynamic';

export default async function CoursePerformancePage() {
  const res = await query('SELECT * FROM vw_course_performance ORDER BY fail_rate_pct DESC');
  
  const data = res.rows.map((row: any) => ({
    'Código': row.course_code,
    'Curso': row.course_name,
    'Período': row.term,
    'Programa': row.program,
    'Estudiantes': row.total_students,
    'Promedio': row.avg_final,
    'Reprobados': row.failed_count,
    '% Fallo': row.fail_rate_pct
  }));

  return <DataTable title="Desempeño por Curso" columns={['Código', 'Curso', 'Período', 'Programa', 'Estudiantes', 'Promedio', 'Reprobados', '% Fallo']} data={data} />;
}
