import { query } from '@/lib/db';
import DataTable from '@/components/DataTable';
import KPICard from '@/components/KPICard';
import PaginationButtons from '@/components/PaginationButtons';
import { getPaginationParams, getPaginationOffsetLimit } from '@/lib/pagination';

export const dynamic = 'force-dynamic';

export default async function StudentsAtRiskPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string>>
}) {
  const limit = 10;
  const resolvedSearchParams = await searchParams;
  const pagination = getPaginationParams(resolvedSearchParams);
  const { offset } = getPaginationOffsetLimit(pagination.page, limit);

  // Total de registros
  const totalRes = await query('SELECT COUNT(*) as count FROM vw_students_at_risk');
  const total = parseInt(totalRes.rows[0].count, 10);
  const totalPages = Math.ceil(total / limit);

  // Datos paginados
  const res = await query(
    'SELECT * FROM vw_students_at_risk ORDER BY risk_score DESC LIMIT $1 OFFSET $2',
    [limit, offset]
  );

  const data = res.rows.map((row: any) => ({
    'Estudiante': row.student_name,
    'Email': row.email,
    'Programa': row.program,
    'Promedio': row.avg_final,
    'Asistencia': `${row.attendance_pct}%`,
    'Razón': row.risk_reason,
    'Riesgo': row.risk_score
  }));

  // Calcular KPIs con todos los datos
  const allRes = await query('SELECT * FROM vw_students_at_risk');
  const totalEnRiesgo = allRes.rows.length;
  const riesgoCritico = allRes.rows.filter((row: any) => parseInt(row.risk_score) >= 7).length;
  const bajoPromedio = allRes.rows.filter((row: any) => row.risk_reason?.includes('promedio')).length;

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
      <PaginationButtons page={pagination.page} totalPages={totalPages} limit={limit} />
    </div>
  );
}
