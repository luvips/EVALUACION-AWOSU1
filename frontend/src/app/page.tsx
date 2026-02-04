import Link from "next/link";

const reports = [
  {
    title: "Rendimiento por curso",
    description: "Promedios y reprobación por curso y periodo.",
    href: "/reports/course-performance",
  },
  {
    title: "Carga docente",
    description: "Grupos, alumnos y promedio por docente.",
    href: "/reports/teacher-load",
  },
  {
    title: "Alumnos en riesgo",
    description: "Promedio o asistencia baja con búsqueda y paginación.",
    href: "/reports/students-at-risk",
  },
  {
    title: "Asistencia por grupo",
    description: "Porcentaje promedio de asistencia por grupo.",
    href: "/reports/attendance-by-group",
  },
  {
    title: "Ranking por programa",
    description: "Ranking de alumnos por programa y periodo.",
    href: "/reports/rank-students",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <main className="mx-auto max-w-6xl px-6 py-10">
        <header className="mb-8 space-y-2">
          <h1 className="text-3xl font-semibold">Dashboard Awos</h1>
          <p className="text-slate-600">
            Selecciona un reporte para visualizar.
          </p>
        </header>

        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {reports.map((report) => (
            <Link
              key={report.href}
              href={report.href}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <h2 className="text-lg font-semibold">{report.title}</h2>
              <p className="mt-2 text-sm text-slate-600">{report.description}</p>
            </Link>
          ))}
        </section>
      </main>
    </div>
  );
}
