'use server'

import { query } from '@/lib/db';

export async function getStudentsAtRisk(filters: { query?: string }, pagination: { limit: number; offset: number }) {
  const conditions: string[] = [];
  const params: any[] = [];
  let paramIndex = 1;

  if (filters.query) {
    conditions.push(`(student_name ILIKE $${paramIndex} OR email ILIKE $${paramIndex})`);
    params.push(`%${filters.query}%`);
    paramIndex++;
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const totalRes = await query(
    `SELECT COUNT(*) as count FROM vw_students_at_risk ${whereClause}`,
    params
  );
  const total = parseInt(totalRes.rows[0].count, 10);

  const dataRes = await query(
    `SELECT * FROM vw_students_at_risk ${whereClause}
     ORDER BY risk_score DESC
     LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
    [...params, pagination.limit, pagination.offset]
  );

  const kpiRes = await query(
    `SELECT * FROM vw_students_at_risk ${whereClause}`,
    params
  );

  const totalEnRiesgo = kpiRes.rows.length;
  const riesgoCritico = kpiRes.rows.filter((row: any) => parseInt(row.risk_score) >= 3).length;
  const bajoPromedio = kpiRes.rows.filter((row: any) => row.risk_reason?.includes('Bajo promedio')).length;

  return {
    data: dataRes.rows,
    total,
    kpis: {
      totalEnRiesgo,
      riesgoCritico,
      bajoPromedio
    }
  };
}

export async function getRankStudents(filters: { program?: string }, pagination: { limit: number; offset: number }) {
  const conditions: string[] = [];
  const params: any[] = [];
  let paramIndex = 1;

  if (filters.program) {
    conditions.push(`program = $${paramIndex}`);
    params.push(filters.program);
    paramIndex++;
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const totalRes = await query(
    `SELECT COUNT(*) as count FROM vw_rank_students ${whereClause}`,
    params
  );
  const total = parseInt(totalRes.rows[0].count, 10);

  const dataRes = await query(
    `SELECT * FROM vw_rank_students ${whereClause}
     ORDER BY program, term, rank_position
     LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
    [...params, pagination.limit, pagination.offset]
  );

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
    data: dataRes.rows,
    total,
    kpis: {
      totalEstudiantes,
      mejorPromedio,
      programas
    }
  };
}

export async function getRankFilters() {
  const programsRes = await query('SELECT DISTINCT program FROM vw_rank_students ORDER BY program');
  return {
    programs: programsRes.rows.map((row: any) => row.program)
  };
}
