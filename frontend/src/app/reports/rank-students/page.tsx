import { query } from '@/lib/db';
import DataTable from '@/components/DataTable';
import KPICard from '@/components/KPICard';

export const dynamic = 'force-dynamic';

export default async function RankStudentsPage() {
  const res = await query('SELECT * FROM vw_rank_students ORDER BY program, term, rank_position');

  const data = res.rows.map((row: any) => ({
    'Rango': row.rank_position,
    'ID': row.student_id,
    'Estudiante': row.student_name,
    'Promedio': row.avg_final,
    'Programa': row.program,
    'Período': row.term
  }));

  // Calcular KPIs
  const totalEstudiantes = res.rows.length;
  const mejorPromedio = res.rows.length > 0 ? Math.max(...res.rows.map((row: any) => parseFloat(row.avg_final))).toFixed(1) : 0;
  const programas = [...new Set(res.rows.map((row: any) => row.program))].length;

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
    </div>
  );
}