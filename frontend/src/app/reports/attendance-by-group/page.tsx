import { query } from '@/lib/db';
import DataTable from '@/components/DataTable';
import KPICard from '@/components/KPICard';
import PaginationButtons from '@/components/PaginationButtons';
import SearchFilter from '@/components/SearchFilter';
import { DEFAULT_PAGE_LIMIT, getPaginationParams, getPaginationOffsetLimit } from '@/lib/pagination';
import { SearchSchema } from '@/lib/validation';

export const dynamic = 'force-dynamic';

export default async function AttendanceByGroupPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string>>
}) {
  const limit = DEFAULT_PAGE_LIMIT;
  const resolvedSearchParams = await searchParams;

  const validated = SearchSchema.safeParse(resolvedSearchParams);
  const filters = validated.success ? validated.data : {};

  const pagination = getPaginationParams(resolvedSearchParams);
  const { offset } = getPaginationOffsetLimit(pagination.page, limit);

  const conditions: string[] = [];
  const params: any[] = [];
  let paramIndex = 1;

  if (filters.query) {
    conditions.push(`course_name ILIKE $${paramIndex}`);
    params.push(`%${filters.query}%`);
    paramIndex++;
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const totalRes = await query(
    `SELECT COUNT(*) as count FROM vw_attendance_by_group ${whereClause}`,
    params
  );
  const total = parseInt(totalRes.rows[0].count, 10);
  const totalPages = Math.ceil(total / limit);

  const res = await query(
    `SELECT * FROM vw_attendance_by_group ${whereClause} ORDER BY attendance_pct ASC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
    [...params, limit, offset]
  );

  const data = res.rows.map((row: any) => ({
    'Curso': row.course_name,
    'Código': row.course_code,
    'Período': row.term,
    'Sesiones': row.total_sessions,
    'Asistencias': row.present_sessions,
    '% Asistencia': `${row.attendance_pct}%`
  }));

  const kpiRes = await query(
    `SELECT * FROM vw_attendance_by_group ${whereClause}`,
    params
  );
  const totalGrupos = kpiRes.rows.length;
  const asistenciaPromedio = kpiRes.rows.length > 0
    ? (kpiRes.rows.reduce((sum: number, row: any) => sum + parseFloat(row.attendance_pct), 0) / kpiRes.rows.length).toFixed(1)
    : 0;
  const gruposBajaAsistencia = kpiRes.rows.filter((row: any) => parseFloat(row.attendance_pct) < 80).length;

  return (
    <div className="p-10 bg-white min-h-screen">
      <h1 className="text-3xl font-bold mb-2 text-[#6B00BF]">Asistencia por Grupo</h1>
      <p className="text-sm text-gray-600 mb-6">Monitoreo de asistencia por curso y periodo</p>

      <KPICard kpis={[
        { label: 'Total Grupos', value: totalGrupos },
        { label: 'Asistencia Promedio', value: `${asistenciaPromedio}%` },
        { label: 'Grupos <80%', value: gruposBajaAsistencia }
      ]} />

      <div className="mb-4">
        <SearchFilter placeholder="Buscar por nombre del curso..." />
      </div>

      <DataTable title="" columns={['Curso', 'Código', 'Período', 'Sesiones', 'Asistencias', '% Asistencia']} data={data} />
      <PaginationButtons page={pagination.page} totalPages={totalPages} limit={limit} />
    </div>
  );
}
