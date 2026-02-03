import { query } from '@/lib/db';
import DataTable from '@/components/DataTable';
import KPICard from '@/components/KPICard';
import PaginationButtons from '@/components/PaginationButtons';
import DropdownFilter from '@/components/DropdownFilter';
import { DEFAULT_PAGE_LIMIT, getPaginationParams, getPaginationOffsetLimit } from '@/lib/pagination';
import { RankStudentsFilterSchema } from '@/lib/validation';

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

  const conditions: string[] = [];
  const params: any[] = [];
  let paramIndex = 1;

  if (filters.program) {
    conditions.push(`program = $${paramIndex}`);
    params.push(filters.program);
    paramIndex++;
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const totalRes = await query(
    `SELECT COUNT(*) as count FROM vw_rank_students ${whereClause}`,
    params
  );
  const total = parseInt(totalRes.rows[0].count, 10);
  const totalPages = Math.ceil(total / limit);

  const res = await query(
    `SELECT * FROM vw_rank_students ${whereClause} ORDER BY program, term, rank_position LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
    [...params, limit, offset]
  );

  const data = res.rows.map((row: any) => ({
    'Rango': row.rank_position,
    'ID': row.student_id,
    'Estudiante': row.student_name,
    'Promedio': row.avg_final,
    'Programa': row.program,
    'Período': row.term
  }));

  const kpiRes = await query(
    `SELECT * FROM vw_rank_students ${whereClause}`,
    params
  );
  const totalEstudiantes = kpiRes.rows.length;
  const mejorPromedio = kpiRes.rows.length > 0 ? Math.max(...kpiRes.rows.map((row: any) => parseFloat(row.avg_final))).toFixed(1) : 0;
  const programas = [...new Set(kpiRes.rows.map((row: any) => row.program))].length;

  const programsRes = await query('SELECT DISTINCT program FROM vw_rank_students ORDER BY program');
  const programOptions = programsRes.rows.map((row: any) => row.program);

  return (
    <div className="p-10 bg-white min-h-screen">
      <h1 className="text-3xl font-bold mb-2 text-[#6B00BF]">Ranking de Estudiantes</h1>
      <p className="text-sm text-gray-600 mb-6">Clasificación por programa y periodo académico</p>

      <KPICard kpis={[
        { label: 'Total Estudiantes', value: totalEstudiantes },
        { label: 'Mejor Promedio', value: mejorPromedio },
        { label: 'Programas', value: programas }
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
      <PaginationButtons page={pagination.page} totalPages={totalPages} limit={limit} />
    </div>
  );
}
