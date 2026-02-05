import { query } from '@/lib/db';
import DataTable from '@/components/DataTable';
import KPICard from '@/components/KPICard';

export const dynamic = 'force-dynamic';

export default async function CoursePerformancePage() {
  const res = await query('SELECT * FROM vw_course_performance ORDER BY fail_rate_pct DESC');

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

  // Calcular KPIs
  const totalCursos = res.rows.length;
  const promedioGeneral = res.rows.length > 0
    ? (res.rows.reduce((sum: number, row: any) => sum + parseFloat(row.avg_final), 0) / res.rows.length).toFixed(1)
    : 0;
  const totalReprobados = res.rows.reduce((sum: number, row: any) => sum + parseInt(row.failed_count), 0);

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
    </div>
  );
}
