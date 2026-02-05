import Image from "next/image";
import Link from "next/link";

const reports = [
  { title: "Asistencia por Grupo", path: "/reports/attendance-by-group", description: "Porcentaje de asistencia por grupo" },
  { title: "Rendimiento del Curso", path: "/reports/course-performance", description: "Calificaciones y tasas de reprobación" },
  { title: "Ranking de Estudiantes", path: "/reports/rank-students", description: "Estudiantes ordenados por promedio" },
  { title: "Estudiantes en Riesgo", path: "/reports/students-at-risk", description: "Estudiantes con bajo desempeño o asistencia" },
  { title: "Carga Docente", path: "/reports/teacher-load", description: "Cursos y estudiantes por profesor" }
];

export default function Home() {
  return (
    <div className="p-10 bg-white min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-4 text-[#6B00BF]">Dashboard de Reportes</h1>
        <p className="text-gray-600 mb-12">Selecciona un reporte para visualizar los datos</p>
        
        <div className="flex gap-12">
          <div className="flex-1 max-h-screen overflow-y-auto pr-4">
            <div className="space-y-3">
              {reports.map((report, i) => (
                <Link key={i} href={report.path}>
                  <div className="p-4 text-[#6B00BF] hover:bg-[#6B00BF] hover:text-white transition cursor-pointer">
                    <h2 className="font-bold mb-1">{report.title}</h2>
                    <p className="text-xs opacity-80">{report.description}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div className="w-96 flex items-center justify-center flex-shrink-0">
            <Image 
              src="/gatito.png" 
              alt="gatito" 
              width={380} 
              height={380}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
