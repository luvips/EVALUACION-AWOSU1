import { query } from '@/lib/db';
import DataTable from '@/components/DataTable';
import KPICard from '@/components/KPICard';

export const dynamic = 'force-dynamic';

export default async function TeacherLoadPage() {
  const res = await query('SELECT * FROM vw_teacher_load ORDER BY students_total DESC');

  const data = res.rows.map((row: any) => ({
    'ID': row.teacher_id,
    'Maestro': row.teacher_name,
    'Período': row.term,
    'Grupos': row.groups_count,
    'Estudiantes': row.students_total,
    'Prom. Curso': row.avg_course_score,
    'Prom. Est/Grupo': row.avg_students_per_group
  }));

  // Calcular KPIs
  const totalMaestros = res.rows.length;
  const totalGrupos = res.rows.reduce((sum: number, row: any) => sum + parseInt(row.groups_count), 0);
  const totalEstudiantes = res.rows.reduce((sum: number, row: any) => sum + parseInt(row.students_total), 0);

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
    </div>
  );
}