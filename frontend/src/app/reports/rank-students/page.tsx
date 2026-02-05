import { query } from '@/lib/db';
import DataTable from '@/components/DataTable';
import KPICard from '@/components/KPICard';
import PaginationButtons from '@/components/PaginationButtons';
import { getPaginationParams, getPaginationOffsetLimit } from '@/lib/pagination';

export const dynamic = 'force-dynamic';

export default async function RankStudentsPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string>>
}) {
  const limit = 10;
  const resolvedSearchParams = await searchParams;
  const pagination = getPaginationParams(resolvedSearchParams);
  const { offset } = getPaginationOffsetLimit(pagination.page, limit);

  // Total de registros
  const totalRes = await query('SELECT COUNT(*) as count FROM vw_rank_students');
  const total = parseInt(totalRes.rows[0].count, 10);
  const totalPages = Math.ceil(total / limit);

  // Datos paginados
  const res = await query(
    'SELECT * FROM vw_rank_students ORDER BY program, term, rank_position LIMIT $1 OFFSET $2',
    [limit, offset]
  );

  const data = res.rows.map((row: any) => ({
    'Rango': row.rank_position,
    'ID': row.student_id,
    'Estudiante': row.student_name,
    'Promedio': row.avg_final,
    'Programa': row.program,
    'Período': row.term
  }));

  // Calcular KPIs con todos los datos
  const allRes = await query('SELECT * FROM vw_rank_students');
  const totalEstudiantes = allRes.rows.length;
  const mejorPromedio = allRes.rows.length > 0 ? Math.max(...allRes.rows.map((row: any) => parseFloat(row.avg_final))).toFixed(1) : 0;
  const programas = [...new Set(allRes.rows.map((row: any) => row.program))].length;

  return (
    <div className="p-10 bg-white min-h-screen">
      <h1 className="text-3xl font-bold mb-2 text-[#6B00BF]">Ranking de Estudiantes</h1>
      <p className="text-sm text-gray-600 mb-6">Clasificación por programa y periodo académico</p>

      <KPICard kpis={[
        { label: 'Total Estudiantes', value: totalEstudiantes },
        { label: 'Mejor Promedio', value: mejorPromedio },
        { label: 'Programas', value: programas }
      ]} />

      <DataTable title="" columns={['Rango', 'ID', 'Estudiante', 'Promedio', 'Programa', 'Período']} data={data} />
      <PaginationButtons page={pagination.page} totalPages={totalPages} limit={limit} />
    </div>
  );
}
