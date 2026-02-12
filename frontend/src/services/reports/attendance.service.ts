import { query } from '@/lib/db';
import type {
  PaginationParams,
  PaginatedResult,
  SearchFilters,
  AttendanceByGroup,
  AttendanceKPIs
} from '../types';

export class AttendanceService {
  private static buildWhereClause(filters: SearchFilters) {
    const conditions: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (filters.query) {
      conditions.push(`course_name ILIKE $${paramIndex}`);
      params.push(`%${filters.query}%`);
      paramIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    return { whereClause, params, paramIndex };
  }

  static async getByGroup(
    filters: SearchFilters,
    pagination: PaginationParams
  ): Promise<PaginatedResult<AttendanceByGroup>> {
    const { whereClause, params, paramIndex } = this.buildWhereClause(filters);

    const totalRes = await query(
      `SELECT COUNT(*) as count FROM vw_attendance_by_group ${whereClause}`,
      params
    );
    const total = parseInt(totalRes.rows[0].count, 10);
    const totalPages = Math.ceil(total / pagination.limit);

    const res = await query(
      `SELECT * FROM vw_attendance_by_group ${whereClause}
       ORDER BY attendance_pct ASC
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...params, pagination.limit, pagination.offset]
    );

    return {
      data: res.rows,
      total,
      totalPages
    };
  }

  static async getKPIs(filters: SearchFilters): Promise<AttendanceKPIs> {
    const { whereClause, params } = this.buildWhereClause(filters);

    const kpiRes = await query(
      `SELECT * FROM vw_attendance_by_group ${whereClause}`,
      params
    );

    const totalGrupos = kpiRes.rows.length;
    const asistenciaPromedio = kpiRes.rows.length > 0
      ? (kpiRes.rows.reduce((sum: number, row: any) => sum + parseFloat(row.attendance_pct), 0) / kpiRes.rows.length).toFixed(1)
      : '0';
    const gruposBajaAsistencia = kpiRes.rows.filter((row: any) => parseFloat(row.attendance_pct) < 80).length;

    return {
      totalGrupos,
      asistenciaPromedio,
      gruposBajaAsistencia
    };
  }
}
