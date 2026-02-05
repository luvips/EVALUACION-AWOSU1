import { z } from 'zod';

// Schema para búsqueda general
export const SearchSchema = z.object({
  query: z.string().optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
});

// Schema para filtro de estudiantes en riesgo
export const StudentRiskFilterSchema = z.object({
  minAverage: z.coerce.number().min(0).max(100).optional(),
  maxAverage: z.coerce.number().min(0).max(100).optional(),
  minAttendance: z.coerce.number().min(0).max(100).optional(),
  program: z.string().optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
});

// Schema para filtro de programas
export const ProgramFilterSchema = z.object({
  program: z.string().optional(),
  term: z.string().optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
});

// Schema para filtro de periodo
export const TermFilterSchema = z.object({
  term: z.string().optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
});

// Schema para filtro de asistencia
export const AttendanceFilterSchema = z.object({
  minAttendance: z.coerce.number().min(0).max(100).optional().default(0),
  maxAttendance: z.coerce.number().min(0).max(100).optional().default(100),
  page: z.string().optional(),
  limit: z.string().optional(),
});

// Schema para filtro de carga docente
export const TeacherLoadFilterSchema = z.object({
  teacherId: z.string().optional(),
  term: z.string().optional(),
  minGroups: z.coerce.number().min(0).optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
});
