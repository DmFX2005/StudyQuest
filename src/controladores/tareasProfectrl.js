import { pool } from '../db.js';
import { crearNotificacion } from './notificacionctrl.js';

export async function asignarTareaProfesor(req, res) {
  try {
    const profesorId = req.user.sub;
    const { estudiante_id, titulo, descripcion, prioridad = 'MEDIA', vence_en } = req.body;

    // Validar rol PROFESOR
    const rol = await pool.query(
      `SELECT 1 FROM usuario_rol ur 
        JOIN rol r ON r.rol_id = ur.rol_id
       WHERE ur.usuario_id = $1 AND r.codigo = 'PROFESOR'`,
      [profesorId]
    );
    if (!rol.rowCount) {
      return res.status(403).json({ message: 'Debe ser profesor para asignar tareas' });
    }

    // Crear la tarea
    const result = await pool.query(
      `INSERT INTO tarea (
         estudiante_id, origen_tarea, asignada_por_id,
         titulo, descripcion, prioridad, estado, vence_en,
         creada_en, actualizada_en
       )
       VALUES ($1, 'PROFESOR', $2, $3, $4, $5, 'PENDIENTE', $6, NOW(), NOW())
       RETURNING *`,
      [estudiante_id, profesorId, titulo, descripcion, prioridad, vence_en]
    );

    await crearNotificacion(estudiante_id, 'TAREA_ASIGNADA', {
      tarea_id: result.rows[0].tarea_id,
      titulo: result.rows[0].titulo,
      profesor_id: profesorId
    });

    return res.status(201).json({
      message: 'Tarea asignada correctamente',
      data: result.rows[0]
    });
  } catch (e) {
    console.error('asignarTareaProfesor error:', e.message);
    return res.status(500).json({ message: 'error en el servidor' });
  }
}

export async function getTareasProfesorParaEstudiante(req, res) {
  try {
    const userId = req.user.sub;

    const result = await pool.query(
      `SELECT t.*, 
              u.email AS profesor_email,
              p.nombre AS profesor_nombre
         FROM tarea t
         JOIN usuario u ON u.usuario_id = t.asignada_por_id
         LEFT JOIN perfil p ON p.usuario_id = t.asignada_por_id
        WHERE t.estudiante_id = $1
          AND t.origen_tarea = 'PROFESOR'
        ORDER BY t.creada_en DESC`,
      [userId]
    );

    return res.json({
      cant: result.rowCount,
      data: result.rows
    });
  } catch (e) {
    console.error('listarTareasProfesorParaEstudiante error:', e.message);
    return res.status(500).json({ message: 'error en el servidor' });
  }
}

export async function entregarTareaEstudiante(req, res) {
  try {
    const estudianteId = req.user.sub;
    const { id } = req.params;
    const { texto_respuesta = null, archivo_url = null } = req.body;

    // Validar que la tarea es del profesor y pertenece al estudiante
    const tarea = await pool.query(
      `SELECT * FROM tarea
        WHERE tarea_id = $1
          AND estudiante_id = $2
          AND origen_tarea = 'PROFESOR'`,
      [id, estudianteId]
    );

    if (!tarea.rowCount) {
      return res.status(404).json({ message: 'Tarea no encontrada' });
    }

    // Registrar entrega
    await pool.query(
      `INSERT INTO entrega_tarea (
         tarea_id, estudiante_id, texto_respuesta, archivo_url, fecha_entrega
       )
       VALUES ($1, $2, $3, $4, NOW())`,
      [id, estudianteId, texto_respuesta, archivo_url]
    );

    // Cambiar estado
    await pool.query(
      `UPDATE tarea
          SET estado = 'ENTREGADA', actualizada_en = NOW()
        WHERE tarea_id = $1`,
      [id]
    );

    return res.json({ message: 'Tarea entregada correctamente' });
  } catch (e) {
    console.error('entregarTareaEstudiante error:', e.message);
    return res.status(500).json({ message: 'error en el servidor' });
  }
}

export async function revisarTareaProfesor(req, res) {
  try {
    const profesorId = req.user.sub;
    const { id } = req.params;
    const { decision, observaciones = null } = req.body;
    // decision = 'ACEPTADA' o 'RECHAZADA'

    // Verificar que la tarea fue asignada por este profesor
    const tareaRes = await pool.query(
      `SELECT * FROM tarea
         WHERE tarea_id = $1
           AND asignada_por_id = $2
           AND origen_tarea = 'PROFESOR'`,
      [id, profesorId]
    );

    if (!tareaRes.rowCount) {
      return res.status(404).json({ message: 'Tarea no encontrada o no asignada por usted' });
    }

    const tarea = tareaRes.rows[0];

    // Actualizar estado
    await pool.query(
      `UPDATE tarea
          SET estado = $2, actualizada_en = NOW()
        WHERE tarea_id = $1`,
      [id, decision]
    );

    // Insertar gamificación si fue aceptada
    if (decision === 'ACEPTADA') {
      const XP = 20; // 20 de XP por tarea aceptada

      await pool.query(
        `INSERT INTO evento_gamificacion (
           estudiante_id, tipo_evento,
           cantidad, descripcion, tarea_id, ocurrido_en
         )
         VALUES ($1, 'XP_TAREA_PROFESOR', $2,
                 'Tarea aceptada por profesor', $3, NOW())`,
        [tarea.estudiante_id, XP, tarea.tarea_id]
      );
    }

    return res.json({
      message: `Tarea ${decision.toLowerCase()} correctamente`
    });

  } catch (e) {
    console.error('revisarTareaProfesor error:', e.message);
    return res.status(500).json({ message: 'error en el servidor' });
  }
}
