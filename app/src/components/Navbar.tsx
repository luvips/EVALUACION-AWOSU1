import Link from 'next/link';

export default function Navbar() {
  const links = [
    { href: '/', label: 'Inicio' },
    { href: '/reports/attendance-by-group', label: 'Asistencia por Grupo' },
    { href: '/reports/course-performance', label: 'Rendimiento del Curso' },
    { href: '/reports/rank-students', label: 'Ranking de Estudiantes' },
    { href: '/reports/students-at-risk', label: 'Estudiantes en Riesgo' },
    { href: '/reports/teacher-load', label: 'Carga Docente' },
  ];

  return (
    <nav className="bg-[#6B00BF] text-white p-4 shadow-lg">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link href="/" className="font-bold text-2xl">
          Dashboard
        </Link>
        <div className="flex gap-4 overflow-x-auto">
          {links.map(link => (
            <Link 
              key={link.href} 
              href={link.href} 
              className="hover:bg-purple-700 whitespace-nowrap text-sm font-medium transition-colors px-3 py-2 rounded"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}