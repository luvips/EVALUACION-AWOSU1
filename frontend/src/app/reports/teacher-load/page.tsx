import { query } from '@/lib/db';
import DataTable from '@/components/DataTable';
import KPICard from '@/components/KPICard';
import PaginationButtons from '@/components/PaginationButtons';
import { getPaginationParams, getPaginationOffsetLimit } from '@/lib/pagination';

export const dynamic = 'force-dynamic';

export default async function TeacherLoadPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string>>
}) {
  const limit = 10;
  const resolvedSearchParams = await searchParams;
  const pagination = getPaginationParams(resolvedSearchParams);
  const { offset } = getPaginationOffsetLimit(pagination.page, limit);

  // Total de registros
  const totalRes = await query('SELECT COUNT(*) as count FROM vw_teacher_load');
  const total = parseInt(totalRes.rows[0].count, 10);
  const totalPages = Math.ceil(total / limit);

  // Datos paginados
  const res = await query(
    'SELECT * FROM vw_teacher_load ORDER BY students_total DESC LIMIT $1 OFFSET $2',
    [limit, offset]
  );

  const data = res.rows.map((row: any) => ({
    'ID': row.teacher_id,
    'Maestro': row.teacher_name,
    'Período': row.term,
    'Grupos': row.groups_count,
    'Estudiantes': row.students_total,
    'Prom. Curso': row.avg_course_score,
    'Prom. Est/Grupo': row.avg_students_per_group
  }));

  // Calcular KPIs con todos los datos
  const allRes = await query('SELECT * FROM vw_teacher_load');
  const totalMaestros = allRes.rows.length;
  const totalGrupos = allRes.rows.reduce((sum: number, row: any) => sum + parseInt(row.groups_count), 0);
  const totalEstudiantes = allRes.rows.reduce((sum: number, row: any) => sum + parseInt(row.students_total), 0);

  return (
    <div className="p-10 bg-white min-h-screen">
      <h1 className="text-3xl font-bold mb-2 text-[#6B00BF]">Carga Docente</h1>
      <p className="text-sm text-gray-600 mb-6">Distribución de grupos y estudiantes por maestro</p>

      <KPICard kpis={[
        { label: 'Total Maestros', value: totalMaestros },
        { label: 'Total Grupos', value: totalGrupos },
        { label: 'Total Estudiantes', value: totalEstudiantes }
      ]} />

      <DataTable title="" columns={['ID', 'Maestro', 'Período', 'Grupos', 'Estudiantes', 'Prom. Curso', 'Prom. Est/Grupo']} data={data} />
      <PaginationButtons page={pagination.page} totalPages={totalPages} limit={limit} />
    </div>
  );
}
