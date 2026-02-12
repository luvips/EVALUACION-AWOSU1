import { query } from '@/lib/db';
import type {
  PaginationParams,
  PaginatedResult,
  SearchFilters,
  TeacherLoad,
  TeacherLoadKPIs
} from '../types';

export class TeachersService {
  private static buildWhereClause(filters: SearchFilters) {
    const conditions: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (filters.query) {
      conditions.push(`teacher_name ILIKE $${paramIndex}`);
      params.push(`%${filters.query}%`);
      paramIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    return { whereClause, params, paramIndex };
  }

  static async getLoad(
    filters: SearchFilters,
    pagination: PaginationParams
  ): Promise<PaginatedResult<TeacherLoad>> {
    const { whereClause, params, paramIndex } = this.buildWhereClause(filters);

    const totalRes = await query(
      `SELECT COUNT(*) as count FROM vw_teacher_load ${whereClause}`,
      params
    );
    const total = parseInt(totalRes.rows[0].count, 10);
    const totalPages = Math.ceil(total / pagination.limit);

    const res = await query(
      `SELECT * FROM vw_teacher_load ${whereClause}
       ORDER BY students_total DESC
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...params, pagination.limit, pagination.offset]
    );

    return {
      data: res.rows,
      total,
      totalPages
    };
  }

  static async getLoadKPIs(filters: SearchFilters): Promise<TeacherLoadKPIs> {
    const { whereClause, params } = this.buildWhereClause(filters);

    const kpiRes = await query(
      `SELECT * FROM vw_teacher_load ${whereClause}`,
      params
    );

    const totalMaestros = kpiRes.rows.length;
    const totalGrupos = kpiRes.rows.reduce((sum: number, row: any) => sum + parseInt(row.groups_count), 0);
    const totalEstudiantes = kpiRes.rows.reduce((sum: number, row: any) => sum + parseInt(row.students_total), 0);

    return {
      totalMaestros,
      totalGrupos,
      totalEstudiantes
    };
  }
}
