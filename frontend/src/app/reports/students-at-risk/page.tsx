import { query } from '@/lib/db';
import DataTable from '@/components/DataTable';
import KPICard from '@/components/KPICard';
import PaginationButtons from '@/components/PaginationButtons';
import SearchFilter from '@/components/SearchFilter';
import { DEFAULT_PAGE_LIMIT, getPaginationParams, getPaginationOffsetLimit } from '@/lib/pagination';
import { SearchSchema } from '@/lib/validation';

export const dynamic = 'force-dynamic';

export default async function StudentsAtRiskPage({
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
    conditions.push(`(student_name ILIKE $${paramIndex} OR email ILIKE $${paramIndex})`);
    params.push(`%${filters.query}%`);
    paramIndex++;
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const totalRes = await query(
    `SELECT COUNT(*) as count FROM vw_students_at_risk ${whereClause}`,
    params
  );
  const total = parseInt(totalRes.rows[0].count, 10);
  const totalPages = Math.ceil(total / limit);

  const res = await query(
    `SELECT * FROM vw_students_at_risk ${whereClause} ORDER BY risk_score DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
    [...params, limit, offset]
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

  const kpiRes = await query(
    `SELECT * FROM vw_students_at_risk ${whereClause}`,
    params
  );
  const totalEnRiesgo = kpiRes.rows.length;
  const riesgoCritico = kpiRes.rows.filter((row: any) => parseInt(row.risk_score) >= 3).length;
  const bajoPromedio = kpiRes.rows.filter((row: any) => row.risk_reason?.includes('Bajo promedio')).length;

  return (
    <div className="p-10 bg-white min-h-screen">
      <h1 className="text-3xl font-bold mb-2 text-[#6B00BF]">Estudiantes en Riesgo</h1>
      <p className="text-sm text-gray-600 mb-6">Identificación de alumnos con bajo rendimiento o asistencia</p>

      <KPICard kpis={[
        { label: 'Total en Riesgo', value: totalEnRiesgo },
        { label: 'Riesgo Crítico (≥3)', value: riesgoCritico },
        { label: 'Por Bajo Promedio', value: bajoPromedio }
      ]} />

      <div className="mb-4">
        <SearchFilter placeholder="Buscar por nombre o email..." />
      </div>

      <DataTable title="" columns={['Estudiante', 'Email', 'Programa', 'Promedio', 'Asistencia', 'Razón', 'Riesgo']} data={data} />
      <PaginationButtons page={pagination.page} totalPages={totalPages} limit={limit} />
    </div>
  );
}
