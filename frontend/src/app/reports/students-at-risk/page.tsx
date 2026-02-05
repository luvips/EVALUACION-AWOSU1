import { query } from '@/lib/db';
import DataTable from '@/components/DataTable';
import KPICard from '@/components/KPICard';

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

  // Calcular KPIs
  const totalEnRiesgo = res.rows.length;
  const riesgoCritico = res.rows.filter((row: any) => parseInt(row.risk_score) >= 7).length;
  const bajoPromedio = res.rows.filter((row: any) => row.risk_reason?.includes('promedio')).length;

  return (
    <div className="p-10 bg-white min-h-screen">
      <h1 className="text-3xl font-bold mb-2 text-[#6B00BF]">Estudiantes en Riesgo</h1>
      <p className="text-sm text-gray-600 mb-6">Identificación de alumnos con bajo rendimiento o asistencia</p>

      <KPICard kpis={[
        { label: 'Total en Riesgo', value: totalEnRiesgo },
        { label: 'Riesgo Crítico (≥7)', value: riesgoCritico },
        { label: 'Por Bajo Promedio', value: bajoPromedio }
      ]} />

      <DataTable title="" columns={['Estudiante', 'Email', 'Programa', 'Promedio', 'Asistencia', 'Razón', 'Riesgo']} data={data} />
    </div>
  );
}