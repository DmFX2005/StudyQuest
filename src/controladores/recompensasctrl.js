import { pool } from '../db.js';

// obtener roles desde el token 
function getRoles(req) {
  return Array.isArray(req.user?.roles) ? req.user.roles : [];
}

// verificar que estudiante es hijo del padre 
async function esHijoDe(padreId, estudianteId) {
  const res = await pool.query(
    `SELECT 1
       FROM padre_hijo
      WHERE padre_id = $1 AND hijo_id = $2`,
    [padreId, estudianteId]
  );
  return res.rowCount > 0;
}

/* =========================
   PADRE: listar sus recompensas
   GET /api/recompensas?estudiante_id=&estado=
   ========================= */
export async function listarRecompensasPadre(req, res) {
  try {
    const padreId = req.user.sub;
    const roles = getRoles(req);

    if (!roles.includes('PADRE')) {
      return res.status(403).json({ message: 'Solo usuarios PADRE pueden ver este recurso' });
    }

    const { estudiante_id, estado } = req.query;
    const params = [padreId];
    let where = 'r.padre_id = $1';

    if (estudiante_id) {
      params.push(estudiante_id);
      where += ` AND r.estudiante_id = $${params.length}`;
    }

    if (estado) {
      params.push(estado);
      where += ` AND r.estado_recompensa = $${params.length}`;
    }

    const result = await pool.query(
      `SELECT r.*
         FROM recompensa r
        WHERE ${where}
        ORDER BY r.creada_en DESC`,
      params
    );

    return res.json({
      cant: result.rowCount,
      data: result.rows
    });
  } catch (e) {
    console.error('listarRecompensasPadre error:', e.message);
    return res.status(500).json({ message: 'error en el servidor' });
  }
}

/* =========================
   PADRE: crear recompensa
   POST /api/recompensas
   Body:
   {
     "estudiante_id": 7,
     "tarea_id": 15,            // opcional
     "tipo_recompensa": "XP",   // XP | PUNTOS | MATERIAL
     "etiqueta": "Si terminas esta tarea te doy 50 XP",
     "cantidad": 50,            // obligatorio si XP o PUNTOS
     "expira_en": "2025-12-31T23:59:59"  // opcional
   }
   ========================= */
export async function crearRecompensa(req, res) {
  try {
    const padreId = req.user.sub;
    const roles = getRoles(req);

    if (!roles.includes('PADRE')) {
      return res.status(403).json({ message: 'Solo usuarios PADRE pueden crear recompensas' });
    }

    const {
      estudiante_id,
      tarea_id = null,
      tipo_recompensa,
      etiqueta,
      cantidad = null,
      expira_en = null
    } = req.body;

    if (!estudiante_id || !tipo_recompensa || !etiqueta) {
      return res.status(400).json({ message: 'estudiante_id, tipo_recompensa y etiqueta son requeridos' });
    }

    if (!['XP', 'PUNTOS', 'MATERIAL'].includes(tipo_recompensa)) {
      return res.status(400).json({ message: 'tipo_recompensa inválido' });
    }

    // Si es XP o PUNTOS, cantidad debe venir
    if ((tipo_recompensa === 'XP' || tipo_recompensa === 'PUNTOS') && !cantidad) {
      return res.status(400).json({ message: 'cantidad es requerida para recompensas de tipo XP o PUNTOS' });
    }

    // Verificar relación padre-hijo
    const esHijo = await esHijoDe(padreId, estudiante_id);
    if (!esHijo) {
      return res.status(403).json({ message: 'El estudiante no está registrado como hijo de este padre' });
    }

    const insert = await pool.query(
      `INSERT INTO recompensa (
         padre_id, estudiante_id, tarea_id,
         tipo_recompensa, etiqueta, cantidad,
         expira_en, estado_recompensa, creada_en
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'OFRECIDA', NOW())
       RETURNING *`,
      [padreId, estudiante_id, tarea_id, tipo_recompensa, etiqueta, cantidad, expira_en]
    );

    return res.status(201).json({
      message: 'Recompensa creada correctamente',
      data: insert.rows[0]
    });
  } catch (e) {
    console.error('crearRecompensa error:', e.message);
    return res.status(500).json({ message: 'error en el servidor' });
  }
}

export async function actualizarRecompensa(req, res) {
  try {
    const padreId = req.user.sub;
    const roles = getRoles(req);
    const { id } = req.params;
    const {
      etiqueta,
      cantidad,
      expira_en,
      tipo_recompensa,
      tarea_id
    } = req.body;

    if (!roles.includes('PADRE')) {
      return res.status(403).json({ message: 'Solo usuarios PADRE pueden editar recompensas' });
    }

    const fields = [];
    const values = [id, padreId];
    let idx = values.length;

    const addField = (col, val) => {
      if (val !== undefined) {
        idx += 1;
        fields.push(`${col} = $${idx}`);
        values.push(val);
      }
    };

    addField('etiqueta', etiqueta);
    addField('cantidad', cantidad);
    addField('expira_en', expira_en);
    addField('tipo_recompensa', tipo_recompensa);
    addField('tarea_id', tarea_id);

    if (!fields.length) {
      return res.status(400).json({ message: 'No hay campos para actualizar' });
    }

    const result = await pool.query(
      `UPDATE recompensa
          SET ${fields.join(', ')}
        WHERE recompensa_id = $1
          AND padre_id = $2
          AND estado_recompensa = 'OFRECIDA'
       RETURNING *`,
      values
    );

    if (!result.rowCount) {
      return res.status(404).json({ message: 'Recompensa no encontrada o no editable' });
    }

    return res.json({
      message: 'Recompensa actualizada correctamente',
      data: result.rows[0]
    });
  } catch (e) {
    console.error('actualizarRecompensa error:', e.message);
    return res.status(500).json({ message: 'error en el servidor' });
  }
}

export async function revocarRecompensa(req, res) {
  try {
    const padreId = req.user.sub;
    const roles = getRoles(req);
    const { id } = req.params;

    if (!roles.includes('PADRE')) {
      return res.status(403).json({ message: 'Solo usuarios PADRE pueden revocar recompensas' });
    }

    const result = await pool.query(
      `UPDATE recompensa
          SET estado_recompensa = 'REVOCADA'
        WHERE recompensa_id = $1
          AND padre_id = $2
          AND estado_recompensa = 'OFRECIDA'
       RETURNING *`,
      [id, padreId]
    );

    if (!result.rowCount) {
      return res.status(404).json({ message: 'Recompensa no encontrada o no se puede revocar' });
    }

    return res.json({
      message: 'Recompensa revocada',
      data: result.rows[0]
    });
  } catch (e) {
    console.error('revocarRecompensa error:', e.message);
    return res.status(500).json({ message: 'error en el servidor' });
  }
}

export async function confirmarRecompensaGanada(req, res) {
  try {
    const padreId = req.user.sub;
    const roles = getRoles(req);
    const { id } = req.params;

    if (!roles.includes('PADRE')) {
      return res.status(403).json({ message: 'Solo usuarios PADRE pueden confirmar recompensas' });
    }

    // Traer recompensa
    const recRes = await pool.query(
      `SELECT *
         FROM recompensa
        WHERE recompensa_id = $1
          AND padre_id = $2`,
      [id, padreId]
    );

    if (!recRes.rowCount) {
      return res.status(404).json({ message: 'Recompensa no encontrada' });
    }

    const recompensa = recRes.rows[0];

    if (recompensa.estado_recompensa !== 'OFRECIDA') {
      return res.status(400).json({ message: 'Solo se pueden confirmar recompensas en estado OFRECIDA' });
    }

    // Marcar como GANADA
    await pool.query(
      `UPDATE recompensa
          SET estado_recompensa = 'GANADA'
        WHERE recompensa_id = $1`,
      [id]
    );

    // Si es XP o PUNTOS, insertamos evento_gamificacion
    if ((recompensa.tipo_recompensa === 'XP' || recompensa.tipo_recompensa === 'PUNTOS') &&
        recompensa.cantidad) {

      await pool.query(
        `INSERT INTO evento_gamificacion (
           estudiante_id,
           tipo_evento,
           fuente_tipo,
           fuente_id,
           cantidad,
           ocurrido_en
         )
         VALUES ($1, $2, 'RECOMPENSA', $3, $4, NOW())`,
        [
          recompensa.estudiante_id,
          recompensa.tipo_recompensa,   // XP o PUNTOS
          recompensa.recompensa_id,
          recompensa.cantidad
        ]
      );
    }

    return res.json({ message: 'Recompensa confirmada como GANADA' });
  } catch (e) {
    console.error('confirmarRecompensaGanada error:', e.message);
    return res.status(500).json({ message: 'error en el servidor' });
  }
}

export async function listarRecompensasEstudiante(req, res) {
  try {
    const estudianteId = req.user.sub;
    const roles = getRoles(req);

    if (!roles.includes('ESTUDIANTE')) {
      return res.status(403).json({ message: 'Solo usuarios ESTUDIANTE pueden ver sus recompensas' });
    }

    const { estado } = req.query;
    const params = [estudianteId];
    let where = 'r.estudiante_id = $1';

    if (estado) {
      params.push(estado);
      where += ` AND r.estado_recompensa = $${params.length}`;
    }

    const result = await pool.query(
      `SELECT r.*
         FROM recompensa r
        WHERE ${where}
        ORDER BY r.creada_en DESC`,
      params
    );

    return res.json({
      cant: result.rowCount,
      data: result.rows
    });
  } catch (e) {
    console.error('listarRecompensasEstudiante error:', e.message);
    return res.status(500).json({ message: 'error en el servidor' });
  }
}
