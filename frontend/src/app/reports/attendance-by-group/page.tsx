import DataTable from '@/components/DataTable';
import KPICard from '@/components/KPICard';
import PaginationButtons from '@/components/PaginationButtons';
import SearchFilter from '@/components/SearchFilter';
import { DEFAULT_PAGE_LIMIT, getPaginationParams, getPaginationOffsetLimit } from '@/lib/pagination';
import { SearchSchema } from '@/lib/validation';
import { AttendanceService } from '@/services/reports/attendance.service';

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

  const result = await AttendanceService.getByGroup(filters, { limit, offset });
  const kpis = await AttendanceService.getKPIs(filters);

  const data = result.data.map((row) => ({
    'Curso': row.course_name,
    'Código': row.course_code,
    'Período': row.term,
    'Sesiones': row.total_sessions,
    'Asistencias': row.present_sessions,
    '% Asistencia': `${row.attendance_pct}%`
  }));

  return (
    <div className="p-10 bg-white min-h-screen">
      <h1 className="text-3xl font-bold mb-2 text-[#6B00BF]">Asistencia por Grupo</h1>
      <p className="text-sm text-gray-600 mb-6">Monitoreo de asistencia por curso y periodo</p>

      <KPICard kpis={[
        { label: 'Total Grupos', value: kpis.totalGrupos },
        { label: 'Asistencia Promedio', value: `${kpis.asistenciaPromedio}%` },
        { label: 'Grupos <80%', value: kpis.gruposBajaAsistencia }
      ]} />

      <div className="mb-4">
        <SearchFilter placeholder="Buscar por nombre del curso..." />
      </div>

      <DataTable title="" columns={['Curso', 'Código', 'Período', 'Sesiones', 'Asistencias', '% Asistencia']} data={data} />
      <PaginationButtons page={pagination.page} totalPages={result.totalPages} limit={limit} />
    </div>
  );
}
