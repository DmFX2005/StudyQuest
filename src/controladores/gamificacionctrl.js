import { pool } from '../db.js';

function getRoles(req) {
  return Array.isArray(req.user?.roles) ? req.user.roles : [];
}

export async function registrarPomodoro(req, res) {
  try {
    const estudianteId = req.user.sub;
    const roles = getRoles(req);
    const { minutos } = req.body || {};

    if (!minutos || typeof minutos !== 'number') {
      return res.status(400).json({ message: 'minutos es requerido y debe ser numérico' });
    }

    if (minutos < 10) {
      return res.status(400).json({ message: 'El tiempo mínimo es 10 minutos' });
    }
    if (minutos > 120) {
      return res.status(400).json({ message: 'El tiempo máximo es 2 horas' });
    }

    const xpCalculado = Math.round(5 + (minutos - 10) * (95 / 110));


    const insert = await pool.query(
      `INSERT INTO evento_gamificacion (
         estudiante_id,
         tipo_evento,
         fuente_tipo,
         fuente_id,
         cantidad,
         ocurrido_en
       )
       VALUES ($1, 'XP', 'POMODORO', NULL, $2, NOW())
       RETURNING *`,
      [estudianteId, xpCalculado]
    );

    return res.status(201).json({
      message: 'Sesión de estudio registrada',
      minutos,
      xp_otorgado: xpCalculado,
      data: insert.rows[0],
    });
  } catch (e) {
    console.error('registrarPomodoro error:', e.message);
    return res.status(500).json({ message: 'error en el servidor' });
  }
}


/**
 * GET /api/gamificacion
 * Lista eventos de gamificación del estudiante logueado (historial)
 * Opcional: ?limit=50
 */
export async function listarMisEventosGamificacion(req, res) {
  try {
    const estudianteId = req.user.sub;
    const roles = getRoles(req);

    if (!roles.includes('ESTUDIANTE')) {
      return res.status(403).json({ message: 'Solo ESTUDIANTE puede ver estos eventos' });
    }

    const limit = Number(req.query.limit) || 120;

    const result = await pool.query(
      `SELECT *
         FROM evento_gamificacion
        WHERE estudiante_id = $1
        ORDER BY ocurrido_en DESC
        LIMIT $2`,
      [estudianteId, limit]
    );

    return res.json({
      cant: result.rowCount,
      data: result.rows
    });
  } catch (e) {
    console.error('listarMisEventosGamificacion error:', e.message);
    return res.status(500).json({ message: 'error en el servidor' });
  }
}

export async function resumenGamificacion(req, res) {
  try {
    const estudianteId = req.user.sub;
    const roles = getRoles(req);

    if (!roles.includes('ESTUDIANTE')) {
      return res.status(403).json({ message: 'Solo ESTUDIANTE puede ver su resumen' });
    }

    const totalRes = await pool.query(
      `SELECT
          COALESCE(SUM(CASE WHEN tipo_evento = 'XP' THEN cantidad ELSE 0 END), 0) AS total_xp,
          COALESCE(SUM(CASE WHEN tipo_evento = 'PUNTOS' THEN cantidad ELSE 0 END), 0) AS total_puntos
       FROM evento_gamificacion
      WHERE estudiante_id = $1`,
      [estudianteId]
    );

    const breakdownRes = await pool.query(
      `SELECT fuente_tipo, tipo_evento, SUM(cantidad) AS total
         FROM evento_gamificacion
        WHERE estudiante_id = $1
        GROUP BY fuente_tipo, tipo_evento
        ORDER BY fuente_tipo`,
      [estudianteId]
    );

    return res.json({
      resumen: totalRes.rows[0],
      detalle: breakdownRes.rows
    });
  } catch (e) {
    console.error('resumenGamificacion error:', e.message);
    return res.status(500).json({ message: 'error en el servidor' });
  }
}
