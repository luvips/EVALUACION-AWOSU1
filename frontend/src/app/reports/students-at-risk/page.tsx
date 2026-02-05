import { query } from '@/lib/db';
import DataTable from '@/components/DataTable';

export const dynamic = 'force-dynamic';

export default async function StudentsAtRiskPage() {
  const res = await query('SELECT * FROM vw_students_at_risk ORDER BY risk_score DESC');
  
  const data = res.rows.map((row: any) => ({
    'Estudiante': row.student_name,
    'Email': row.email,
    'Programa': row.program,
    'Promedio': row.avg_final,
    'Asistencia': `${row.attendance_pct}%`,
    'Razón': row.risk_reason,
    'Riesgo': row.risk_score
  }));

  return <DataTable title="Estudiantes en Riesgo" columns={['Estudiante', 'Email', 'Programa', 'Promedio', 'Asistencia', 'Razón', 'Riesgo']} data={data} />;
}