import DataTable from '@/components/DataTable';
import KPICard from '@/components/KPICard';
import PaginationButtons from '@/components/PaginationButtons';
import DropdownFilter from '@/components/DropdownFilter';
import { DEFAULT_PAGE_LIMIT, getPaginationParams, getPaginationOffsetLimit } from '@/lib/pagination';
import { CoursePerformanceFilterSchema } from '@/lib/validation';
import { getCoursePerformance, getCourseFilters } from '@/actions/courses';

export const dynamic = 'force-dynamic';

export default async function CoursePerformancePage({
  searchParams
}: {
  searchParams: Promise<Record<string, string>>
}) {
  const limit = DEFAULT_PAGE_LIMIT;
  const resolvedSearchParams = await searchParams;

  const filterOptions = await getCourseFilters();
  const defaultTerm = filterOptions.terms[0] || '';

  const validated = CoursePerformanceFilterSchema.safeParse({
    ...resolvedSearchParams,
    term: resolvedSearchParams.term ?? defaultTerm
  });
  const filters = validated.success ? validated.data : { term: defaultTerm, program: undefined };

  const pagination = getPaginationParams(resolvedSearchParams);
  const { offset } = getPaginationOffsetLimit(pagination.page, limit);

  const result = await getCoursePerformance(filters, { limit, offset });

  const formatNumber = (value: any) => (value === null || value === undefined ? 'N/A' : value);
  const formatPercent = (value: any) => (value === null || value === undefined ? 'N/A' : value);

  const data = result.data.map((row: any) => ({
    'Código': row.course_code,
    'Curso': row.course_name,
    'Período': row.term,
    'Programa': row.program,
    'Estudiantes': row.total_students,
    'Promedio': formatNumber(row.avg_final),
    'Reprobados': row.failed_count,
    '% Fallo': formatPercent(row.fail_rate_pct)
  }));

  const totalPages = Math.ceil(result.total / limit);

  return (
    <div className="p-10 bg-white min-h-screen">
      <h1 className="text-3xl font-bold mb-2 text-[#6B00BF]">Desempeño por Curso</h1>
      <p className="text-sm text-gray-600 mb-6">Promedios y tasas de reprobación por curso</p>

      <KPICard kpis={[
        { label: 'Total Cursos', value: result.kpis.totalCursos },
        { label: 'Promedio General', value: result.kpis.promedioGeneral },
        { label: 'Total Reprobados', value: result.kpis.totalReprobados }
      ]} />

      <div className="flex gap-2 mb-4">
        <DropdownFilter
          paramName="term"
          placeholder="Todos los períodos"
          options={filterOptions.terms}
          defaultValue={filters.term || ''}
        />
        <DropdownFilter
          paramName="program"
          placeholder="Todos los programas"
          options={filterOptions.programs}
          defaultValue={filters.program || ''}
        />
      </div>

      <DataTable title="" columns={['Código', 'Curso', 'Período', 'Programa', 'Estudiantes', 'Promedio', 'Reprobados', '% Fallo']} data={data} />
      <PaginationButtons page={pagination.page} totalPages={totalPages} limit={limit} />
    </div>
  );
}
