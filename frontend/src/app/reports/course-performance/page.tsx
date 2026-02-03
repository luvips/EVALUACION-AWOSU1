import { query } from '@/lib/db';
import DataTable from '@/components/DataTable';
import KPICard from '@/components/KPICard';
import PaginationButtons from '@/components/PaginationButtons';
import DropdownFilter from '@/components/DropdownFilter';
import { DEFAULT_PAGE_LIMIT, getPaginationParams, getPaginationOffsetLimit } from '@/lib/pagination';
import { CoursePerformanceFilterSchema } from '@/lib/validation';

export const dynamic = 'force-dynamic';

export default async function CoursePerformancePage({
  searchParams
}: {
  searchParams: Promise<Record<string, string>>
}) {
  const limit = DEFAULT_PAGE_LIMIT;
  const resolvedSearchParams = await searchParams;

  const termsRes = await query('SELECT DISTINCT term FROM vw_course_performance ORDER BY term');
  const programsRes = await query('SELECT DISTINCT program FROM vw_course_performance ORDER BY program');

  const termOptions = termsRes.rows.map((row: any) => row.term);
  const programOptions = programsRes.rows.map((row: any) => row.program);
  const defaultTerm = termOptions[0] || '';
  
  const validated = CoursePerformanceFilterSchema.safeParse({
    ...resolvedSearchParams,
    term: resolvedSearchParams.term ?? defaultTerm
  });
  const filters: {
    term: string;
    program?: string;
    page?: string;
    limit?: string;
  } = validated.success ? validated.data : { term: defaultTerm };
  
  const pagination = getPaginationParams(resolvedSearchParams);
  const { offset } = getPaginationOffsetLimit(pagination.page, limit);

  const conditions: string[] = [];
  const params: any[] = [];
  let paramIndex = 1;

  if (filters.term) {
    conditions.push(`term = $${paramIndex}`);
    params.push(filters.term);
    paramIndex++;
  }

  if (filters.program) {
    conditions.push(`program = $${paramIndex}`);
    params.push(filters.program);
    paramIndex++;
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const totalRes = await query(
    `SELECT COUNT(*) as count FROM vw_course_performance ${whereClause}`,
    params
  );
  const total = parseInt(totalRes.rows[0].count, 10);
  const totalPages = Math.ceil(total / limit);

  const res = await query(
    `SELECT * FROM vw_course_performance ${whereClause} ORDER BY fail_rate_pct DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
    [...params, limit, offset]
  );

  const formatNumber = (value: any) => (value === null || value === undefined ? 'N/A' : value);
  const formatPercent = (value: any) => (value === null || value === undefined ? 'N/A' : value);

  const data = res.rows.map((row: any) => ({
    'Código': row.course_code,
    'Curso': row.course_name,
    'Período': row.term,
    'Programa': row.program,
    'Estudiantes': row.total_students,
    'Promedio': formatNumber(row.avg_final),
    'Reprobados': row.failed_count,
    '% Fallo': formatPercent(row.fail_rate_pct)
  }));

  const kpiRes = await query(
    `SELECT * FROM vw_course_performance ${whereClause}`,
    params
  );
  const totalCursos = kpiRes.rows.length;
  const promedioRows = kpiRes.rows.filter((row: any) => row.avg_final !== null && row.avg_final !== undefined);
  const promedioGeneral = promedioRows.length > 0
    ? (promedioRows.reduce((sum: number, row: any) => sum + parseFloat(row.avg_final), 0) / promedioRows.length).toFixed(1)
    : 'N/A';
  const totalReprobados = kpiRes.rows.reduce((sum: number, row: any) => sum + parseInt(row.failed_count), 0);

  return (
    <div className="p-10 bg-white min-h-screen">
      <h1 className="text-3xl font-bold mb-2 text-[#6B00BF]">Desempeño por Curso</h1>
      <p className="text-sm text-gray-600 mb-6">Promedios y tasas de reprobación por curso</p>

      <KPICard kpis={[
        { label: 'Total Cursos', value: totalCursos },
        { label: 'Promedio General', value: promedioGeneral },
        { label: 'Total Reprobados', value: totalReprobados }
      ]} />

      <div className="flex gap-2 mb-4">
        <DropdownFilter 
          paramName="term"
          placeholder="Todos los períodos"
          options={termOptions}
          defaultValue={filters.term || ''}
        />
        <DropdownFilter 
          paramName="program"
          placeholder="Todos los programas"
          options={programOptions}
          defaultValue={filters.program || ''}
        />
      </div>

      <DataTable title="" columns={['Código', 'Curso', 'Período', 'Programa', 'Estudiantes', 'Promedio', 'Reprobados', '% Fallo']} data={data} />
      <PaginationButtons page={pagination.page} totalPages={totalPages} limit={limit} />
    </div>
  );
}
