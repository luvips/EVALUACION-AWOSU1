import { query } from '@/lib/db';
import type {
  PaginationParams,
  PaginatedResult,
  SearchFilters,
  RankStudentsFilters,
  StudentAtRisk,
  RankStudent,
  StudentsAtRiskKPIs,
  RankStudentsKPIs
} from '../types';

export class StudentsService {
  // Estudiantes en riesgo
  private static buildAtRiskWhereClause(filters: SearchFilters) {
    const conditions: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (filters.query) {
      conditions.push(`(student_name ILIKE $${paramIndex} OR email ILIKE $${paramIndex})`);
      params.push(`%${filters.query}%`);
      paramIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    return { whereClause, params, paramIndex };
  }

  static async getAtRisk(
    filters: SearchFilters,
    pagination: PaginationParams
  ): Promise<PaginatedResult<StudentAtRisk>> {
    const { whereClause, params, paramIndex } = this.buildAtRiskWhereClause(filters);

    const totalRes = await query(
      `SELECT COUNT(*) as count FROM vw_students_at_risk ${whereClause}`,
      params
    );
    const total = parseInt(totalRes.rows[0].count, 10);
    const totalPages = Math.ceil(total / pagination.limit);

    const res = await query(
      `SELECT * FROM vw_students_at_risk ${whereClause}
       ORDER BY risk_score DESC
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...params, pagination.limit, pagination.offset]
    );

    return {
      data: res.rows,
      total,
      totalPages
    };
  }

  static async getAtRiskKPIs(filters: SearchFilters): Promise<StudentsAtRiskKPIs> {
    const { whereClause, params } = this.buildAtRiskWhereClause(filters);

    const kpiRes = await query(
      `SELECT * FROM vw_students_at_risk ${whereClause}`,
      params
    );

    const totalEnRiesgo = kpiRes.rows.length;
    const riesgoCritico = kpiRes.rows.filter((row: any) => parseInt(row.risk_score) >= 3).length;
    const bajoPromedio = kpiRes.rows.filter((row: any) => row.risk_reason?.includes('Bajo promedio')).length;

    return {
      totalEnRiesgo,
      riesgoCritico,
      bajoPromedio
    };
  }

  // Ranking de estudiantes
  private static buildRankWhereClause(filters: RankStudentsFilters) {
    const conditions: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (filters.program) {
      conditions.push(`program = $${paramIndex}`);
      params.push(filters.program);
      paramIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    return { whereClause, params, paramIndex };
  }

  static async getRank(
    filters: RankStudentsFilters,
    pagination: PaginationParams
  ): Promise<PaginatedResult<RankStudent>> {
    const { whereClause, params, paramIndex } = this.buildRankWhereClause(filters);

    const totalRes = await query(
      `SELECT COUNT(*) as count FROM vw_rank_students ${whereClause}`,
      params
    );
    const total = parseInt(totalRes.rows[0].count, 10);
    const totalPages = Math.ceil(total / pagination.limit);

    const res = await query(
      `SELECT * FROM vw_rank_students ${whereClause}
       ORDER BY program, term, rank_position
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...params, pagination.limit, pagination.offset]
    );

    return {
      data: res.rows,
      total,
      totalPages
    };
  }

  static async getRankKPIs(filters: RankStudentsFilters): Promise<RankStudentsKPIs> {
    const { whereClause, params } = this.buildRankWhereClause(filters);

    const kpiRes = await query(
      `SELECT * FROM vw_rank_students ${whereClause}`,
      params
    );

    const totalEstudiantes = kpiRes.rows.length;
    const mejorPromedio = kpiRes.rows.length > 0
      ? Math.max(...kpiRes.rows.map((row: any) => parseFloat(row.avg_final))).toFixed(1)
      : '0';
    const programas = [...new Set(kpiRes.rows.map((row: any) => row.program))].length;

    return {
      totalEstudiantes,
      mejorPromedio,
      programas
    };
  }

  static async getDistinctPrograms(): Promise<string[]> {
    const res = await query('SELECT DISTINCT program FROM vw_rank_students ORDER BY program');
    return res.rows.map((row: any) => row.program);
  }
}
