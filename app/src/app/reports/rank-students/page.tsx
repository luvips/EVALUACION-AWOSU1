import DataTable from '@/components/DataTable';
import KPICard from '@/components/KPICard';
import PaginationButtons from '@/components/PaginationButtons';
import DropdownFilter from '@/components/DropdownFilter';
import { DEFAULT_PAGE_LIMIT, getPaginationParams, getPaginationOffsetLimit } from '@/lib/pagination';
import { RankStudentsFilterSchema } from '@/lib/validation';
import { getRankStudents, getRankFilters } from '@/actions/students';

export const dynamic = 'force-dynamic';

export default async function RankStudentsPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string>>
}) {
  const limit = DEFAULT_PAGE_LIMIT;
  const resolvedSearchParams = await searchParams;

  const validated = RankStudentsFilterSchema.safeParse(resolvedSearchParams);
  const filters = validated.success ? validated.data : {};

  const pagination = getPaginationParams(resolvedSearchParams);
  const { offset } = getPaginationOffsetLimit(pagination.page, limit);

  const result = await getRankStudents(filters, { limit, offset });
  const filterOptions = await getRankFilters();

  const data = result.data.map((row: any) => ({
    'Rango': row.rank_position,
    'ID': row.student_id,
    'Estudiante': row.student_name,
    'Promedio': row.avg_final,
    'Programa': row.program,
    'Período': row.term
  }));

  const totalPages = Math.ceil(result.total / limit);

  return (
    <div className="p-10 bg-white min-h-screen">
      <h1 className="text-3xl font-bold mb-2 text-[#6B00BF]">Ranking de Estudiantes</h1>
      <p className="text-sm text-gray-600 mb-6">Clasificación por programa y periodo académico</p>

      <KPICard kpis={[
        { label: 'Total Estudiantes', value: result.kpis.totalEstudiantes },
        { label: 'Mejor Promedio', value: result.kpis.mejorPromedio },
        { label: 'Programas', value: result.kpis.programas }
      ]} />

      <div className="flex gap-2 mb-4">
        <DropdownFilter
          paramName="program"
          placeholder="Todos los programas"
          options={filterOptions.programs}
          defaultValue={filters.program || ''}
        />
      </div>

      <DataTable title="" columns={['Rango', 'ID', 'Estudiante', 'Promedio', 'Programa', 'Período']} data={data} />
      <PaginationButtons page={pagination.page} totalPages={totalPages} limit={limit} />
    </div>
  );
}
