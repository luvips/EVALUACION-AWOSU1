import DataTable from '@/components/DataTable';
import KPICard from '@/components/KPICard';
import PaginationButtons from '@/components/PaginationButtons';
import SearchFilter from '@/components/SearchFilter';
import { DEFAULT_PAGE_LIMIT, getPaginationParams, getPaginationOffsetLimit } from '@/lib/pagination';
import { SearchSchema } from '@/lib/validation';
import { getStudentsAtRisk } from '@/actions/students';

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

  const result = await getStudentsAtRisk(filters, { limit, offset });

  const data = result.data.map((row: any) => ({
    'Estudiante': row.student_name,
    'Email': row.email,
    'Programa': row.program,
    'Promedio': row.avg_final,
    'Asistencia': `${row.attendance_pct}%`,
    'Razón': row.risk_reason,
    'Riesgo': row.risk_score
  }));

  const totalPages = Math.ceil(result.total / limit);

  return (
    <div className="p-10 bg-white min-h-screen">
      <h1 className="text-3xl font-bold mb-2 text-[#6B00BF]">Estudiantes en Riesgo</h1>
      <p className="text-sm text-gray-600 mb-6">Identificación de alumnos con bajo rendimiento o asistencia</p>

      <KPICard kpis={[
        { label: 'Total en Riesgo', value: result.kpis.totalEnRiesgo },
        { label: 'Riesgo Crítico (≥3)', value: result.kpis.riesgoCritico },
        { label: 'Por Bajo Promedio', value: result.kpis.bajoPromedio }
      ]} />

      <div className="mb-4">
        <SearchFilter placeholder="Buscar por nombre o email..." />
      </div>

      <DataTable title="" columns={['Estudiante', 'Email', 'Programa', 'Promedio', 'Asistencia', 'Razón', 'Riesgo']} data={data} />
      <PaginationButtons page={pagination.page} totalPages={totalPages} limit={limit} />
    </div>
  );
}
