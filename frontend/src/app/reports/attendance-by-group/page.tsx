import { query } from '@/lib/db';
import DataTable from '@/components/DataTable';
import KPICard from '@/components/KPICard';
import PaginationButtons from '@/components/PaginationButtons';
import { getPaginationParams, getPaginationOffsetLimit } from '@/lib/pagination';

export const dynamic = 'force-dynamic';

export default async function AttendanceByGroupPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string>>
}) {
  const limit = 10;
  const resolvedSearchParams = await searchParams;
  const pagination = getPaginationParams(resolvedSearchParams);
  const { offset } = getPaginationOffsetLimit(pagination.page, limit);

  // Total de registros
  const totalRes = await query('SELECT COUNT(*) as count FROM vw_attendance_by_group');
  const total = parseInt(totalRes.rows[0].count, 10);
  const totalPages = Math.ceil(total / limit);

  // Datos paginados
  const res = await query(
    'SELECT * FROM vw_attendance_by_group ORDER BY attendance_pct ASC LIMIT $1 OFFSET $2',
    [limit, offset]
  );

  const data = res.rows.map((row: any) => ({
    'Curso': row.course_name,
    'Código': row.course_code,
    'Período': row.term,
    'Sesiones': row.total_sessions,
    'Asistencias': row.present_sessions,
    '% Asistencia': `${row.attendance_pct}%`
  }));

  // Calcular KPIs con todos los datos
  const allRes = await query('SELECT * FROM vw_attendance_by_group');
  const totalGrupos = allRes.rows.length;
  const asistenciaPromedio = allRes.rows.length > 0
    ? (allRes.rows.reduce((sum: number, row: any) => sum + parseFloat(row.attendance_pct), 0) / allRes.rows.length).toFixed(1)
    : 0;
  const gruposBajaAsistencia = allRes.rows.filter((row: any) => parseFloat(row.attendance_pct) < 70).length;

  return (
    <div className="p-10 bg-white min-h-screen">
      <h1 className="text-3xl font-bold mb-2 text-[#6B00BF]">Asistencia por Grupo</h1>
      <p className="text-sm text-gray-600 mb-6">Monitoreo de asistencia por curso y periodo</p>

      <KPICard kpis={[
        { label: 'Total Grupos', value: totalGrupos },
        { label: 'Asistencia Promedio', value: `${asistenciaPromedio}%` },
        { label: 'Grupos <70%', value: gruposBajaAsistencia }
      ]} />

      <DataTable title="" columns={['Curso', 'Código', 'Período', 'Sesiones', 'Asistencias', '% Asistencia']} data={data} />
      <PaginationButtons page={pagination.page} totalPages={totalPages} limit={limit} />
    </div>
  );
}
