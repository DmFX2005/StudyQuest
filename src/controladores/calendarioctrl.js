import { pool } from '../db.js';

export async function getCalendarioEstudiante(req, res) {
  try {
    const userId = req.user.sub;
    const roles = Array.isArray(req.user?.roles) ? req.user.roles : [];

    if (!roles.includes('ESTUDIANTE')) {
      return res.status(403).json({ message: 'Solo ESTUDIANTE puede ver este calendario por ahora' });
    }

    let { from, to } = req.query;

    // si no mandan rango, usamos hoy y +30 días
    const hoy = new Date();
    if (!from) {
      from = hoy.toISOString().slice(0, 10); // YYYY-MM-DD
    }
    if (!to) {
      const fin = new Date(hoy);
      fin.setDate(fin.getDate() + 30);
      to = fin.toISOString().slice(0, 10);
    }

    // 1) TAREAS con vence_en dentro del rango
    const tareasRes = await pool.query(
      `SELECT 
          tarea_id,
          titulo,
          descripcion,
          origen_tarea,
          estado,
          vence_en,
          creada_en
       FROM tarea
      WHERE estudiante_id = $1
        AND vence_en IS NOT NULL
        AND vence_en::date BETWEEN $2::date AND $3::date
      ORDER BY vence_en ASC`,
      [userId, from, to]
    );

    // 2) (Opcional) RECOMPENSAS con expira_en en el rango
    const recompensasRes = await pool.query(
      `SELECT 
          recompensa_id,
          etiqueta,
          tipo_recompensa,
          cantidad,
          expira_en,
          estado_recompensa,
          creada_en
       FROM recompensa
      WHERE estudiante_id = $1
        AND expira_en IS NOT NULL
        AND expira_en::date BETWEEN $2::date AND $3::date
      ORDER BY expira_en ASC`,
      [userId, from, to]
    );

    return res.json({
      rango: { from, to },
      tareas: tareasRes.rows,
      recompensas: recompensasRes.rows
    });
  } catch (e) {
    console.error('getCalendarioEstudiante error:', e.message);
    return res.status(500).json({ message: 'error en el servidor' });
  }
}
