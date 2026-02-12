'use server'

import { query } from '@/lib/db';

export async function getTeacherLoad(filters: { query?: string }, pagination: { limit: number; offset: number }) {
  const conditions: string[] = [];
  const params: any[] = [];
  let paramIndex = 1;

  if (filters.query) {
    conditions.push(`teacher_name ILIKE $${paramIndex}`);
    params.push(`%${filters.query}%`);
    paramIndex++;
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const totalRes = await query(
    `SELECT COUNT(*) as count FROM vw_teacher_load ${whereClause}`,
    params
  );
  const total = parseInt(totalRes.rows[0].count, 10);

  const dataRes = await query(
    `SELECT * FROM vw_teacher_load ${whereClause}
     ORDER BY students_total DESC
     LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
    [...params, pagination.limit, pagination.offset]
  );

  const kpiRes = await query(
    `SELECT * FROM vw_teacher_load ${whereClause}`,
    params
  );

  const totalMaestros = kpiRes.rows.length;
  const totalGrupos = kpiRes.rows.reduce((sum: number, row: any) => sum + parseInt(row.groups_count), 0);
  const totalEstudiantes = kpiRes.rows.reduce((sum: number, row: any) => sum + parseInt(row.students_total), 0);

  return {
    data: dataRes.rows,
    total,
    kpis: {
      totalMaestros,
      totalGrupos,
      totalEstudiantes
    }
  };
}
