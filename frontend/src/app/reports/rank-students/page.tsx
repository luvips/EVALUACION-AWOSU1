import { query } from '@/lib/db';
import DataTable from '@/components/DataTable';

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

  return <DataTable title="Ranking de Estudiantes" columns={['Rango', 'ID', 'Estudiante', 'Promedio', 'Programa', 'Período']} data={data} />;
}