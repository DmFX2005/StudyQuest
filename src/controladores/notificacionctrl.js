import { pool } from '../db.js';

function getRoles(req) {
  return Array.isArray(req.user?.roles) ? req.user.roles : [];
}

// Helper reutilizable desde otros controladores
export async function crearNotificacion(usuarioId, tipo, payloadObj) {
  const payload = JSON.stringify(payloadObj || {});
  await pool.query(
    `INSERT INTO notificacion (usuario_id, tipo, payload, leida, creada_en)
     VALUES ($1, $2, $3, FALSE, NOW())`,
    [usuarioId, tipo, payload]
  );
}

/**
 * GET /api/notificaciones?solo_no_leidas=true
 * Lista notificaciones del usuario logueado
 */
export async function listarMisNotificaciones(req, res) {
  try {
    const userId = req.user.sub;
    const { solo_no_leidas } = req.query;

    let where = 'usuario_id = $1';
    const params = [userId];

    if (solo_no_leidas === 'true') {
      where += ' AND leida = FALSE';
    }

    const result = await pool.query(
      `SELECT notificacion_id, tipo, payload, leida, creada_en
         FROM notificacion
        WHERE ${where}
        ORDER BY creada_en DESC`,
      params
    );

    // opcional: parsear payload a JSON
    const data = result.rows.map(n => ({
      ...n,
      payload: (() => {
        try { return JSON.parse(n.payload); } catch { return null; }
      })()
    }));

    return res.json({
      cant: data.length,
      data
    });
  } catch (e) {
    console.error('listarMisNotificaciones error:', e.message);
    return res.status(500).json({ message: 'error en el servidor' });
  }
}

/**
 * POST /api/notificaciones/:id/leida
 * Marca una notificación como leída
 */
export async function marcarNotificacionLeida(req, res) {
  try {
    const userId = req.user.sub;
    const { id } = req.params;

    const result = await pool.query(
      `UPDATE notificacion
          SET leida = TRUE
        WHERE notificacion_id = $1
          AND usuario_id = $2`,
      [id, userId]
    );

    if (!result.rowCount) {
      return res.status(404).json({ message: 'Notificación no encontrada' });
    }

    return res.json({ message: 'Notificación marcada como leída' });
  } catch (e) {
    console.error('marcarNotificacionLeida error:', e.message);
    return res.status(500).json({ message: 'error en el servidor' });
  }
}
