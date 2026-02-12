'use server'

import { query } from '@/lib/db';

export async function getCoursePerformance(filters: { term?: string; program?: string }, pagination: { limit: number; offset: number }) {
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

  const totalRes = await query(
    `SELECT COUNT(*) as count FROM vw_course_performance ${whereClause}`,
    params
  );
  const total = parseInt(totalRes.rows[0].count, 10);

  const dataRes = await query(
    `SELECT * FROM vw_course_performance ${whereClause}
     ORDER BY fail_rate_pct DESC
     LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
    [...params, pagination.limit, pagination.offset]
  );

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
    data: dataRes.rows,
    total,
    kpis: {
      totalCursos,
      promedioGeneral,
      totalReprobados
    }
  };
}

export async function getCourseFilters() {
  const termsRes = await query('SELECT DISTINCT term FROM vw_course_performance ORDER BY term');
  const programsRes = await query('SELECT DISTINCT program FROM vw_course_performance ORDER BY program');

  return {
    terms: termsRes.rows.map((row: any) => row.term),
    programs: programsRes.rows.map((row: any) => row.program)
  };
}
