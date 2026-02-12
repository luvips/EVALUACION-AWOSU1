'use server'

import { query } from '@/lib/db';

export async function getAttendanceByGroup(filters: { query?: string }, pagination: { limit: number; offset: number }) {
  const conditions: string[] = [];
  const params: any[] = [];
  let paramIndex = 1;

  if (filters.query) {
    conditions.push(`course_name ILIKE $${paramIndex}`);
    params.push(`%${filters.query}%`);
    paramIndex++;
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const totalRes = await query(
    `SELECT COUNT(*) as count FROM vw_attendance_by_group ${whereClause}`,
    params
  );
  const total = parseInt(totalRes.rows[0].count, 10);

  const dataRes = await query(
    `SELECT * FROM vw_attendance_by_group ${whereClause}
     ORDER BY attendance_pct ASC
     LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
    [...params, pagination.limit, pagination.offset]
  );

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
    data: dataRes.rows,
    total,
    kpis: {
      totalGrupos,
      asistenciaPromedio,
      gruposBajaAsistencia
    }
  };
}
