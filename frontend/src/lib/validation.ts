import { z } from 'zod';

const programWhitelist = ['Engineering', 'Business', 'Arts'] as const;

export const SearchSchema = z.object({
  query: z.string().optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
});

export const StudentRiskFilterSchema = z.object({
  minAverage: z.coerce.number().min(0).max(100).optional(),
  maxAverage: z.coerce.number().min(0).max(100).optional(),
  minAttendance: z.coerce.number().min(0).max(100).optional(),
  program: z.string().optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
});

export const ProgramFilterSchema = z.object({
  program: z.string().optional(),
  term: z.string().optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
});

export const TermFilterSchema = z.object({
  term: z.string().optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
});

export const AttendanceFilterSchema = z.object({
  minAttendance: z.coerce.number().min(0).max(100).optional().default(0),
  maxAttendance: z.coerce.number().min(0).max(100).optional().default(100),
  page: z.string().optional(),
  limit: z.string().optional(),
});

export const TeacherLoadFilterSchema = z.object({
  teacherId: z.string().optional(),
  term: z.string().optional(),
  minGroups: z.coerce.number().min(0).optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
});

export const CoursePerformanceFilterSchema = z.object({
  term: z.string().min(1),
  program: z.string().optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
});

export const RankStudentsFilterSchema = z.object({
  program: z.enum(programWhitelist).optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
});
