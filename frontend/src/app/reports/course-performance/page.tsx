import { query } from '@/lib/db';
import DataTable from '@/components/DataTable';
import KPICard from '@/components/KPICard';
import PaginationButtons from '@/components/PaginationButtons';
import { getPaginationParams, getPaginationOffsetLimit } from '@/lib/pagination';

export const dynamic = 'force-dynamic';

export default async function CoursePerformancePage({
  searchParams
}: {
  searchParams: Promise<Record<string, string>>
}) {
  const limit = 10;
  const resolvedSearchParams = await searchParams;
  const pagination = getPaginationParams(resolvedSearchParams);
  const { offset } = getPaginationOffsetLimit(pagination.page, limit);

  // Total de registros
  const totalRes = await query('SELECT COUNT(*) as count FROM vw_course_performance');
  const total = parseInt(totalRes.rows[0].count, 10);
  const totalPages = Math.ceil(total / limit);

  // Datos paginados
  const res = await query(
    'SELECT * FROM vw_course_performance ORDER BY fail_rate_pct DESC LIMIT $1 OFFSET $2',
    [limit, offset]
  );

  const data = res.rows.map((row: any) => ({
    'Código': row.course_code,
    'Curso': row.course_name,
    'Período': row.term,
    'Programa': row.program,
    'Estudiantes': row.total_students,
    'Promedio': row.avg_final,
    'Reprobados': row.failed_count,
    '% Fallo': row.fail_rate_pct
  }));

  // Calcular KPIs con todos los datos
  const allRes = await query('SELECT * FROM vw_course_performance');
  const totalCursos = allRes.rows.length;
  const promedioGeneral = allRes.rows.length > 0
    ? (allRes.rows.reduce((sum: number, row: any) => sum + parseFloat(row.avg_final), 0) / allRes.rows.length).toFixed(1)
    : 0;
  const totalReprobados = allRes.rows.reduce((sum: number, row: any) => sum + parseInt(row.failed_count), 0);

  return (
    <div className="p-10 bg-white min-h-screen">
      <h1 className="text-3xl font-bold mb-2 text-[#6B00BF]">Desempeño por Curso</h1>
      <p className="text-sm text-gray-600 mb-6">Promedios y tasas de reprobación por curso</p>

      <KPICard kpis={[
        { label: 'Total Cursos', value: totalCursos },
        { label: 'Promedio General', value: promedioGeneral },
        { label: 'Total Reprobados', value: totalReprobados }
      ]} />

      <DataTable title="" columns={['Código', 'Curso', 'Período', 'Programa', 'Estudiantes', 'Promedio', 'Reprobados', '% Fallo']} data={data} />
      <PaginationButtons page={pagination.page} totalPages={totalPages} limit={limit} />
    </div>
  );
}
