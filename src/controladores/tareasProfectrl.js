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

export async function asignarTareaAulaProfesor(req, res) {
  try {
    const profesorId = req.user.sub;
    const roles = req.user.roles || [];
    const {
      aula_id,
      titulo,
      descripcion = null,
      prioridad = 'MEDIA',
      vence_en = null
    } = req.body || {};

    if (!roles.includes('PROFESOR')) {
      return res.status(403).json({ message: 'Debe ser PROFESOR para asignar tareas a un aula' });
    }

    if (!aula_id || !titulo) {
      return res.status(400).json({ message: 'aula_id y titulo son requeridos' });
    }

    const aulaRes = await pool.query(
      `SELECT aula_id, nombre
         FROM aula
        WHERE aula_id = $1
          AND profesor_id = $2`,
      [aula_id, profesorId]
    );

    if (!aulaRes.rowCount) {
      return res.status(404).json({ message: 'Aula no encontrada o no pertenece al profesor' });
    }

    // hay que insertar una tarea por cada estudiante del aula asi que mejor se hace un INSERTSELECT para hacerlo en un solo query
    const insertRes = await pool.query(
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
       SELECT 
         ae.estudiante_id,
         'PROFESOR',
         $2 AS asignada_por_id,
         $3 AS titulo,
         $4 AS descripcion,
         $5 AS prioridad,
         'PENDIENTE' AS estado,
         $6 AS vence_en,
         NOW() AS creada_en,
         NOW() AS actualizada_en
       FROM aula a
       JOIN aula_estudiante ae ON ae.aula_id = a.aula_id
      WHERE a.aula_id = $1
        AND a.profesor_id = $2
       RETURNING tarea_id, estudiante_id, titulo, vence_en`,
      [aula_id, profesorId, titulo, descripcion, prioridad, vence_en]
    );

    if (!insertRes.rowCount) {
      return res.status(400).json({ message: 'El aula no tiene estudiantes para asignar la tarea' });
    }

    const tareasCreadas = insertRes.rows;

    for (const t of tareasCreadas) {
      try {
        await crearNotificacion(t.estudiante_id, 'TAREA_ASIGNADA', {
          tarea_id: t.tarea_id,
          titulo: t.titulo,
          profesor_id: profesorId,
          aula_id,
          vence_en: t.vence_en
        });
      } catch (e) {
        console.error('Error creando notificación TAREA_ASIGNADA:', e.message);
      }
    }

    return res.status(201).json({
      message: `Tarea asignada a ${tareasCreadas.length} estudiante(s) del aula`,
      aula: aulaRes.rows[0],
      cant: tareasCreadas.length,
      data: tareasCreadas
    });
  } catch (e) {
    console.error('asignarTareaAulaProfesor error:', e.message);
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
    const entregado_por = req.user.sub;
    const { id } = req.params;
    const { notas } = req.body;

    const tarea = await pool.query(
      `SELECT * FROM tarea
        WHERE tarea_id = $1
          AND estudiante_id = $2
          AND origen_tarea = 'PROFESOR'`,
      [id, entregado_por]
    );

    if (!tarea.rowCount) {
      return res.status(404).json({ message: 'Tarea no encontrada' });
    }

    await pool.query(
      `INSERT INTO entrega_tarea (
         tarea_id, entregado_por, entregada_en, notas
       )
       VALUES ($1, $2, NOW(), $3)`,
      [id, entregado_por, notas || null]
    );

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

export async function listarTareasProfesorParaRevisar(req, res) {
  try {
    const profesorId = req.user.sub;
    const roles = req.user.roles || [];
    const { estado } = req.query;

    if (!roles.includes('PROFESOR')) {
      return res.status(403).json({ message: 'Solo PROFESOR puede ver estas tareas' });
    }

    const params = [profesorId];
    let where = `
      t.asignada_por_id = $1
      AND t.origen_tarea = 'PROFESOR'
    `;

    if (estado) {
      params.push(estado);
      where += ` AND t.estado = $${params.length}`;
    }

    const result = await pool.query(
      `SELECT 
          t.tarea_id,
          t.estudiante_id,
          t.titulo,
          t.descripcion,
          t.prioridad,
          t.estado,
          t.vence_en,
          t.creada_en,
          u.email AS estudiante_email,
          COALESCE(p.nombre, '')   AS estudiante_nombre,
          COALESCE(p.apellido, '') AS estudiante_apellido,
          ult_entrega.entrega_id,
          ult_entrega.entregada_en,
          ult_entrega.notas
       FROM tarea t
       JOIN usuario u
         ON u.usuario_id = t.estudiante_id
       LEFT JOIN perfil p
         ON p.usuario_id = u.usuario_id
       LEFT JOIN LATERAL (
         SELECT 
           et.entrega_id,
           et.entregada_en,
           entregado_por,
           notas
          FROM entrega_tarea et
         WHERE et.tarea_id = t.tarea_id
         ORDER BY et.entregada_en DESC
         LIMIT 1
       ) AS ult_entrega ON TRUE
      WHERE ${where}
      ORDER BY 
        t.estado ASC,
        t.vence_en NULLS LAST,
        ult_entrega.entregada_en DESC NULLS LAST`,
      params
    );

    return res.json({
      cant: result.rowCount,
      data: result.rows
    });
  } catch (e) {
    console.error('listarTareasProfesorParaRevisar error:', e.message);
    return res.status(500).json({ message: 'error en el servidor' });
  }
}

export async function revisarTareaProfesor(req, res) {
  try {
    const profesorId = req.user.sub;
    const { id } = req.params;
    const { decision, observaciones = null } = req.body;

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

    await pool.query(
      `UPDATE tarea
          SET estado = $2, retroalimentacion = $3, actualizada_en = NOW()
        WHERE tarea_id = $1`,
      [id, decision, observaciones]
    );

    if (decision === 'ACEPTADA') {
      const XP = 20; 

      await pool.query(
        `INSERT INTO evento_gamificacion (
           estudiante_id, tipo_evento, fuente_tipo, fuente_id, cantidad, ocurrido_en )
         VALUES ($1, 'XP_TAREA_PROFESOR', 'Tarea aceptada por profesor', $2, $3, NOW())`,
        [tarea.estudiante_id, tarea.tarea_id, XP ]
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
