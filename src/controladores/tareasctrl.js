import { pool } from '../db.js';

export async function getMisTareas(req, res) {
  try {
    const userId = req.user.sub;
    const { estado } = req.query; 

    const params = [userId];
    let where = 't.estudiante_id = $1 AND t.origen_tarea = \'AUTOGESTION\'';

    if (estado) {
      params.push(estado);
      where += ` AND t.estado = $${params.length}`;
    }   

    const result = await pool.query(
      `SELECT t.*
         FROM tarea t
        WHERE ${where}
        ORDER BY COALESCE(t.vence_en, t.creada_en) ASC`,
      params
    );

    return res.json({
      cant: result.rowCount,
      data: result.rows
    });
  } catch (e) {
    console.error('listarMisTareas error:', e.message);
    return res.status(500).json({ message: 'error en el servidor' });
  }
}

export async function getTareaById(req, res) {
  try {
    const userId = req.user.sub;
    const { id } = req.params;

    const result = await pool.query(
      `SELECT t.*
         FROM tarea t
        WHERE t.tarea_id = $1
          AND t.estudiante_id = $2
          AND t.origen_tarea = 'AUTOGESTION'`,
      [id, userId]
    );

    if (!result.rowCount) {
      return res.status(404).json({
        cant: 0,
        message: 'Tarea no encontrada'
      });
    }

    return res.json({
      cant: 1,
      data: result.rows[0]
    });
  } catch (e) {
    console.error('getTareaById error:', e.message);
    return res.status(500).json({ message: 'error en el servidor' });
  }
}


export async function postTareaPersonalNueva(req, res) {
  try {
    const userId = req.user.sub;
    const {
      titulo,
      descripcion = null,
      prioridad = 'MEDIA',
      estado = 'PENDIENTE',
      vence_en = null
    } = req.body;

    if (!titulo) {
      return res.status(400).json({ message: 'titulo es requerido' });
    }

    const insert = await pool.query(
      `INSERT INTO tarea (
         estudiante_id,
         origen_tarea,
         asignada_por_id,
         titulo,
         descripcion,
         prioridad,
         estado,
         vence_en,
         creada_en,
         actualizada_en
       )
       VALUES ($1, 'AUTOGESTION', NULL, $2, $3, $4, $5, $6, NOW(), NOW())
       RETURNING *`, //se usa para retornar la fila insertada
      [userId, titulo, descripcion, prioridad, estado, vence_en]
    );

    return res.status(201).json({
      message: 'Tarea creada correctamente',
      data: insert.rows[0]
    });
  } catch (e) {
    console.error('crearTareaPersonal error:', e.message);
    return res.status(500).json({ message: 'error en el servidor' });
  }
}

/**
 * Actualiza una tarea personal (solo si es del usuario)
 * Body: { titulo?, descripcion?, prioridad?, vence_en?, estado? }
 */
export async function putTareaPersonal(req, res) {
  try {
    const userId = req.user.sub;
    const { id } = req.params;
    const {
      titulo,
      descripcion,
      prioridad,
      vence_en,
      estado
    } = req.body;

    // sólo permitimos estos estados en tareas personales
    if (estado && !['PENDIENTE', 'EN_PROGRESO', 'COMPLETADA'].includes(estado)) {
      return res.status(400).json({ message: 'Estado inválido para tarea personal' });
    }

    // armamos dinámicamente el UPDATE como si fuera un patch, para que se actualicen solo los campos enviados
    const campos = [];
    const values = [id, userId];
    let idx = values.length;

    const addCampo = (col, val) => {
      if (val !== undefined) {
        idx += 1;
        campos.push(`${col} = $${idx}`);
        values.push(val);
      }
    };
    // siempre actualizar actualizada_en
    idx += 1;
    campos.push(`actualizada_en = $${idx}`);
    values.push(new Date());

    addCampo('titulo', titulo);
    addCampo('descripcion', descripcion);
    addCampo('prioridad', prioridad);
    addCampo('vence_en', vence_en);
    addCampo('estado', estado);

    if (!campos.length) {
      return res.status(400).json({ message: 'No hay campos para actualizar' });
    }

    const result = await pool.query(
      `UPDATE tarea
          SET ${campos.join(', ')}
        WHERE tarea_id = $1
          AND estudiante_id = $2
          AND origen_tarea = 'AUTOGESTION'
       RETURNING *`,
      values
    );

    if (!result.rowCount) {
      return res.status(404).json({ message: 'Tarea no encontrada' });
    }

    return res.json({
      message: 'Tarea actualizada correctamente',
      data: result.rows[0]
    });
  } catch (e) {
    console.error('actualizarTareaPersonal error:', e.message);
    return res.status(500).json({ message: 'error en el servidor' });
  }
}

export async function deleteTareaPersonal(req, res) {
  try {
    const userId = req.user.sub;
    const { id } = req.params;

    const result = await pool.query(
      `DELETE FROM tarea
        WHERE tarea_id = $1
          AND estudiante_id = $2
          AND origen_tarea = 'AUTOGESTION'`,
      [id, userId]
    );

    if (!result.rowCount) {
      return res.status(404).json({ message: 'Tarea no encontrada' });
    }

    return res.json({ message: 'Tarea eliminada' });
  } catch (e) {
    console.error('eliminarTareaPersonal error:', e.message);
    return res.status(500).json({ message: 'error en el servidor' });
  }
}

// Marcar COMPLETADA una tarea personal + genera evento de gamificación
export async function postTareaPersonalconGami(req, res) {
  try {
    const userId = req.user.sub;
    const { id } = req.params;

    const upd = await pool.query(
      `UPDATE tarea
          SET estado = 'COMPLETADA',
              actualizada_en = NOW()
        WHERE tarea_id = $1
          AND estudiante_id = $2
          AND origen_tarea = 'AUTOGESTION'
       RETURNING *`,
      [id, userId]
    );

    if (!upd.rowCount) {
      return res.status(404).json({ message: 'Tarea no encontrada' });
    }

    const tarea = upd.rows[0];

    // Insertar evento de gamificación (10 XP por tarea completada)
    const XP_TAREA = 10; 

    await pool.query(
      `INSERT INTO evento_gamificacion (
         estudiante_id,
         tipo_evento,
         fuente_tipo,
         fuente_id,
         cantidad,
         ocurrido_en
       )
       VALUES ($1, $2, $3, $4, $5, NOW())`,
      [
        userId,
        'XP_TAREA_COMPLETADA',
        `XP por completar tarea: ${tarea.titulo}`,
        tarea.tarea_id,
        XP_TAREA
      ]
    );

    return res.json({
      message: 'Tarea completada y XP asignado',
      data: tarea,
      xp_ganado: XP_TAREA
    });
  } catch (e) {
    console.error('completarTareaPersonal error:', e.message);
    return res.status(500).json({ message: 'error en el servidor' });
  }
}
