import DataTable from '@/components/DataTable';
import KPICard from '@/components/KPICard';
import PaginationButtons from '@/components/PaginationButtons';
import DropdownFilter from '@/components/DropdownFilter';
import { DEFAULT_PAGE_LIMIT, getPaginationParams, getPaginationOffsetLimit } from '@/lib/pagination';
import { RankStudentsFilterSchema } from '@/lib/validation';
import { StudentsService } from '@/services/reports/students.service';

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

  const programOptions = await StudentsService.getDistinctPrograms();

  const result = await StudentsService.getRank(filters, { limit, offset });
  const kpis = await StudentsService.getRankKPIs(filters);

  const data = result.data.map((row) => ({
    'Rango': row.rank_position,
    'ID': row.student_id,
    'Estudiante': row.student_name,
    'Promedio': row.avg_final,
    'Programa': row.program,
    'Período': row.term
  }));

  return (
    <div className="p-10 bg-white min-h-screen">
      <h1 className="text-3xl font-bold mb-2 text-[#6B00BF]">Ranking de Estudiantes</h1>
      <p className="text-sm text-gray-600 mb-6">Clasificación por programa y periodo académico</p>

      <KPICard kpis={[
        { label: 'Total Estudiantes', value: kpis.totalEstudiantes },
        { label: 'Mejor Promedio', value: kpis.mejorPromedio },
        { label: 'Programas', value: kpis.programas }
      ]} />

      <div className="flex gap-2 mb-4">
        <DropdownFilter
          paramName="program"
          placeholder="Todos los programas"
          options={programOptions}
          defaultValue={filters.program || ''}
        />
      </div>

      <DataTable title="" columns={['Rango', 'ID', 'Estudiante', 'Promedio', 'Programa', 'Período']} data={data} />
      <PaginationButtons page={pagination.page} totalPages={result.totalPages} limit={limit} />
    </div>
  );
}
