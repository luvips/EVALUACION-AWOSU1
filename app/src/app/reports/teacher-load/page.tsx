import DataTable from '@/components/DataTable';
import KPICard from '@/components/KPICard';
import PaginationButtons from '@/components/PaginationButtons';
import SearchFilter from '@/components/SearchFilter';
import { DEFAULT_PAGE_LIMIT, getPaginationParams, getPaginationOffsetLimit } from '@/lib/pagination';
import { SearchSchema } from '@/lib/validation';
import { getTeacherLoad } from '@/actions/teachers';

export const dynamic = 'force-dynamic';

export default async function TeacherLoadPage({
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

  const result = await getTeacherLoad(filters, { limit, offset });

  const data = result.data.map((row: any) => ({
    'ID': row.teacher_id,
    'Maestro': row.teacher_name,
    'Período': row.term,
    'Grupos': row.groups_count,
    'Estudiantes': row.students_total,
    'Prom. Curso': row.avg_course_score,
    'Prom. Est/Grupo': row.avg_students_per_group
  }));

  const totalPages = Math.ceil(result.total / limit);

  return (
    <div className="p-10 bg-white min-h-screen">
      <h1 className="text-3xl font-bold mb-2 text-[#6B00BF]">Carga Docente</h1>
      <p className="text-sm text-gray-600 mb-6">Distribución de grupos y estudiantes por maestro</p>

      <KPICard kpis={[
        { label: 'Total Maestros', value: result.kpis.totalMaestros },
        { label: 'Total Grupos', value: result.kpis.totalGrupos },
        { label: 'Total Estudiantes', value: result.kpis.totalEstudiantes }
      ]} />

      <div className="mb-4">
        <SearchFilter placeholder="Buscar por nombre del maestro..." />
      </div>

      <DataTable title="" columns={['ID', 'Maestro', 'Período', 'Grupos', 'Estudiantes', 'Prom. Curso', 'Prom. Est/Grupo']} data={data} />
      <PaginationButtons page={pagination.page} totalPages={totalPages} limit={limit} />
    </div>
  );
}
