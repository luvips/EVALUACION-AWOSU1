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
