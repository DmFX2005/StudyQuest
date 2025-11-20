import { pool } from '../db.js';

export async function getMisTareas(req, res) {
  try {
    const userId = req.user.sub;
    const { estado } = req.query; 

    const params = [userId];
    // let where = 't.estudiante_id = $1 AND t.origen_tarea = \'AUTOGESTION\'';
    let where = 't.estudiante_id = $1';


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

// Lista tareas de los hijos del padre.
export async function listarTareasHijos(req, res) {
  try {
    const padreId = req.user.sub;
    const roles = req.user.roles || [];

    if (!roles.includes('PADRE')) {
      return res.status(403).json({ message: 'Solo PADRE puede ver tareas de hijos' });
    }

    const { hijo_id, estado, origen } = req.query;

    const params = [padreId];
    let where = `ph.padre_id = $1`;

    if (hijo_id) {
      params.push(hijo_id);
      where += ` AND t.estudiante_id = $${params.length}`;
    }

    if (estado) {
      params.push(estado);
      where += ` AND t.estado = $${params.length}`;
    }

    if (origen) {
      params.push(origen);
      where += ` AND t.origen_tarea = $${params.length}`;
    }

    // se usa LEFT JOIN LATERAL para traer "la última entrega" de cada tarea, si existe
    const result = await pool.query(
      `SELECT 
          t.tarea_id,
          t.estudiante_id,
          t.titulo,
          t.descripcion,
          t.origen_tarea,
          t.estado,
          t.prioridad,
          t.vence_en,
          t.creada_en,
          p.nombre  AS estudiante_nombre,
          p.apellido AS estudiante_apellido,
          ult_entrega.entrega_id,
          ult_entrega.entregado_por,
          ult_entrega.entregada_en,
          ult_entrega.notas
       FROM padre_hijo ph
       JOIN tarea t 
         ON t.estudiante_id = ph.hijo_id
       LEFT JOIN perfil p
         ON p.usuario_id = t.estudiante_id
       LEFT JOIN LATERAL (
         SELECT et.entrega_id, et.entregado_por, et.entregada_en, et.notas
           FROM entrega_tarea et
          WHERE et.tarea_id = t.tarea_id
          ORDER BY et.entregada_en DESC
          LIMIT 1
       ) AS ult_entrega ON TRUE
      WHERE ${where}
      ORDER BY t.vence_en NULLS LAST, t.creada_en DESC`,
      params
    );

    return res.json({
      cant: result.rowCount,
      data: result.rows
    });
  } catch (e) {
    console.error('listarTareasHijos error:', e.message);
    return res.status(500).json({ message: 'error en el servidor' });
  }
}

export async function entregarTareaHijoPorPadre(req, res) {
  try {
    const padreId = req.user.sub;
    const roles = req.user.roles || [];
    const { id } = req.params;
    const { notas = null } = req.body || {};

    if (!roles.includes('PADRE')) {
      return res.status(403).json({ message: 'Solo PADRE puede usar este endpoint' });
    }

    const tareaRes = await pool.query(
      `SELECT t.tarea_id, t.estudiante_id, t.estado
         FROM tarea t
         JOIN padre_hijo ph
           ON ph.hijo_id = t.estudiante_id
        WHERE t.tarea_id = $1
          AND ph.padre_id = $2`,
      [id, padreId]
    );

    if (!tareaRes.rowCount) {
      return res.status(404).json({ message: 'Tarea no encontrada para este padre/hijo' });
    }

    const tarea = tareaRes.rows[0];

    const yaEntrega = await pool.query(
      `SELECT 1 
         FROM entrega_tarea 
        WHERE tarea_id = $1
        LIMIT 1`,
      [tarea.tarea_id]
    );
    if (yaEntrega.rowCount) {
      return res.status(400).json({ message: 'Ya existe una entrega registrada para esta tarea' });
    }

    await pool.query(
      `INSERT INTO entrega_tarea (
         tarea_id,
         entregado_por,
         entregada_en,
         notas
       )
       VALUES ($1, $2, NOW(), $3)`,
      [tarea.tarea_id, padreId, notas]
    );

    if (tarea.estado === 'PENDIENTE' || tarea.estado === 'EN_PROGRESO') {
      await pool.query(
        `UPDATE tarea
            SET estado = 'ENTREGADA',
                actualizada_en = NOW()
          WHERE tarea_id = $1`,
        [tarea.tarea_id]
      );
    }

    return res.json({ message: 'Tarea entregada en nombre del hijo' });
  } catch (e) {
    console.error('entregarTareaHijoPorPadre error:', e.message);
    return res.status(500).json({ message: 'error en el servidor' });
  }
}
