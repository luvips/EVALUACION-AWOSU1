import { query } from '@/lib/db';
import DataTable from '@/components/DataTable';

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

  return <DataTable title="Carga de Maestros" columns={['ID', 'Maestro', 'Período', 'Grupos', 'Estudiantes', 'Prom. Curso', 'Prom. Est/Grupo']} data={data} />;
}