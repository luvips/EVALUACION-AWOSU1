import { query } from '@/lib/db';
import type {
  PaginationParams,
  PaginatedResult,
  CoursePerformanceFilters,
  CoursePerformance,
  CoursePerformanceKPIs
} from '../types';

export class CoursesService {
  private static buildWhereClause(filters: CoursePerformanceFilters) {
    const conditions: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (filters.term) {
      conditions.push(`term = $${paramIndex}`);
      params.push(filters.term);
      paramIndex++;
    }

    if (filters.program) {
      conditions.push(`program = $${paramIndex}`);
      params.push(filters.program);
      paramIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    return { whereClause, params, paramIndex };
  }

  static async getPerformance(
    filters: CoursePerformanceFilters,
    pagination: PaginationParams
  ): Promise<PaginatedResult<CoursePerformance>> {
    const { whereClause, params, paramIndex } = this.buildWhereClause(filters);

    const totalRes = await query(
      `SELECT COUNT(*) as count FROM vw_course_performance ${whereClause}`,
      params
    );
    const total = parseInt(totalRes.rows[0].count, 10);
    const totalPages = Math.ceil(total / pagination.limit);

    const res = await query(
      `SELECT * FROM vw_course_performance ${whereClause}
       ORDER BY fail_rate_pct DESC
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...params, pagination.limit, pagination.offset]
    );

    return {
      data: res.rows,
      total,
      totalPages
    };
  }

  static async getPerformanceKPIs(filters: CoursePerformanceFilters): Promise<CoursePerformanceKPIs> {
    const { whereClause, params } = this.buildWhereClause(filters);

    const kpiRes = await query(
      `SELECT * FROM vw_course_performance ${whereClause}`,
      params
    );

    const totalCursos = kpiRes.rows.length;
    const promedioRows = kpiRes.rows.filter((row: any) => row.avg_final !== null && row.avg_final !== undefined);
    const promedioGeneral = promedioRows.length > 0
      ? (promedioRows.reduce((sum: number, row: any) => sum + parseFloat(row.avg_final), 0) / promedioRows.length).toFixed(1)
      : 'N/A';
    const totalReprobados = kpiRes.rows.reduce((sum: number, row: any) => sum + parseInt(row.failed_count), 0);

    return {
      totalCursos,
      promedioGeneral,
      totalReprobados
    };
  }

  static async getDistinctTerms(): Promise<string[]> {
    const res = await query('SELECT DISTINCT term FROM vw_course_performance ORDER BY term');
    return res.rows.map((row: any) => row.term);
  }

  static async getDistinctPrograms(): Promise<string[]> {
    const res = await query('SELECT DISTINCT program FROM vw_course_performance ORDER BY program');
    return res.rows.map((row: any) => row.program);
  }
}
