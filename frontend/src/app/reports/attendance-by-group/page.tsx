import { query } from '@/lib/db';
import DataTable from '@/components/DataTable';

export const dynamic = 'force-dynamic';

export default async function AttendanceByGroupPage() {
  const res = await query('SELECT * FROM vw_attendance_by_group ORDER BY attendance_pct ASC');
  
  const data = res.rows.map((row: any) => ({
    'Curso': row.course_name,
    'Código': row.course_code,
    'Período': row.term,
    'Sesiones': row.total_sessions,
    'Asistencias': row.present_sessions,
    '% Asistencia': `${row.attendance_pct}%`
  }));

  return <DataTable title="Asistencia por Grupo" columns={['Curso', 'Código', 'Período', 'Sesiones', 'Asistencias', '% Asistencia']} data={data} />;
}