export interface PaginationParams {
  limit: number;
  offset: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  totalPages: number;
}

export interface SearchFilters {
  query?: string;
}

export interface CoursePerformanceFilters {
  term?: string;
  program?: string;
}

export interface RankStudentsFilters {
  program?: string;
}

export interface AttendanceByGroup {
  course_name: string;
  course_code: string;
  term: string;
  total_sessions: number;
  present_sessions: number;
  attendance_pct: string;
}

export interface StudentAtRisk {
  student_name: string;
  email: string;
  program: string;
  avg_final: string;
  attendance_pct: string;
  risk_reason: string;
  risk_score: number;
}

export interface CoursePerformance {
  course_code: string;
  course_name: string;
  term: string;
  program: string;
  total_students: number;
  avg_final: string | null;
  failed_count: number;
  fail_rate_pct: string | null;
}

export interface TeacherLoad {
  teacher_id: string;
  teacher_name: string;
  term: string;
  groups_count: number;
  students_total: number;
  avg_course_score: string;
  avg_students_per_group: string;
}

export interface RankStudent {
  rank_position: number;
  student_id: string;
  student_name: string;
  avg_final: string;
  program: string;
  term: string;
}

export interface AttendanceKPIs {
  totalGrupos: number;
  asistenciaPromedio: string;
  gruposBajaAsistencia: number;
}

export interface StudentsAtRiskKPIs {
  totalEnRiesgo: number;
  riesgoCritico: number;
  bajoPromedio: number;
}

export interface CoursePerformanceKPIs {
  totalCursos: number;
  promedioGeneral: string;
  totalReprobados: number;
}

export interface TeacherLoadKPIs {
  totalMaestros: number;
  totalGrupos: number;
  totalEstudiantes: number;
}

export interface RankStudentsKPIs {
  totalEstudiantes: number;
  mejorPromedio: string;
  programas: number;
}
