import { pool } from '../db.js';

function getRoles(req) {
  return Array.isArray(req.user?.roles) ? req.user.roles : [];
}

export async function listarAulasProfesor(req, res) {
  try {
    const userId = req.user.sub;
    const roles = getRoles(req);

    if (!roles.includes('PROFESOR')) {
      return res.status(403).json({ message: 'Solo PROFESOR puede ver sus aulas' });
    }

    const result = await pool.query(
      `SELECT aula_id, nombre, creado_en
         FROM aula
        WHERE profesor_id = $1
        ORDER BY creado_en DESC`,
      [userId]
    );

    return res.json({
      cant: result.rowCount,
      data: result.rows
    });
  } catch (e) {
    console.error('listarAulasProfesor error:', e.message);
    return res.status(500).json({ message: 'error en el servidor' });
  }
}

export async function crearAula(req, res) {
  try {
    const userId = req.user.sub;
    const roles = getRoles(req);
    const { nombre } = req.body;

    if (!roles.includes('PROFESOR')) {
      return res.status(403).json({ message: 'Solo PROFESOR puede crear aulas' });
    }

    if (!nombre) {
      return res.status(400).json({ message: 'nombre es requerido' });
    }

    const insert = await pool.query(
      `INSERT INTO aula (profesor_id, nombre, creado_en)
       VALUES ($1, $2, NOW())
       RETURNING aula_id, profesor_id, nombre, creado_en`,
      [userId, nombre]
    );

    return res.status(201).json({
      message: 'Aula creada correctamente',
      data: insert.rows[0]
    });
  } catch (e) {
    console.error('crearAula error:', e.message);
    return res.status(500).json({ message: 'error en el servidor' });
  }
}

export async function actualizarAula(req, res) {
  try {
    const userId = req.user.sub;
    const roles = Array.isArray(req.user?.roles) ? req.user.roles : [];
    const { id } = req.params;
    const { nombre } = req.body;

    if (!roles.includes('PROFESOR')) {
      return res.status(403).json({ message: 'Solo PROFESOR puede actualizar aulas' });
    }

    if (!nombre || !nombre.trim()) {
      return res.status(400).json({ message: 'nombre es requerido' });
    }

    const result = await pool.query(
      `UPDATE aula
          SET nombre = $3
        WHERE aula_id = $1
          AND profesor_id = $2
       RETURNING aula_id, profesor_id, nombre, creado_en`,
      [id, userId, nombre.trim()]
    );

    if (!result.rowCount) {
      return res.status(404).json({ message: 'Aula no encontrada o no pertenece al profesor' });
    }

    return res.json({
      message: 'Aula actualizada correctamente',
      data: result.rows[0]
    });
  } catch (e) {
    console.error('actualizarAula error:', e.message);
    return res.status(500).json({ message: 'error en el servidor' });
  }
}


export async function listarEstudiantesDeAula(req, res) {
  try {
    const userId = req.user.sub;
    const roles = getRoles(req);
    const { id } = req.params; // aula_id

    if (!roles.includes('PROFESOR')) {
      return res.status(403).json({ message: 'Solo PROFESOR puede ver estudiantes del aula' });
    }

    // validar que el aula pertenece a este profesor
    const aulaRes = await pool.query(
      `SELECT aula_id, nombre
         FROM aula
        WHERE aula_id = $1 AND profesor_id = $2`,
      [id, userId]
    );

    if (!aulaRes.rowCount) {
      return res.status(404).json({ message: 'Aula no encontrada o no pertenece al profesor' });
    }

    const result = await pool.query(
      `SELECT 
          u.usuario_id AS id,
          u.email,
          COALESCE(p.nombre, '')   AS nombre,
          COALESCE(p.apellido, '') AS apellido,
          p.grado_grupo
       FROM aula_estudiante ae
       JOIN usuario u ON u.usuario_id = ae.estudiante_id
       LEFT JOIN perfil p ON p.usuario_id = u.usuario_id
      WHERE ae.aula_id = $1
      ORDER BY p.nombre, p.apellido, u.email`,
      [id]
    );

    return res.json({
      aula: aulaRes.rows[0],
      cant: result.rowCount,
      data: result.rows
    });
  } catch (e) {
    console.error('listarEstudiantesDeAula error:', e.message);
    return res.status(500).json({ message: 'error en el servidor' });
  }
}

export async function agregarEstudianteAula(req, res) {
  try {
    const userId = req.user.sub;
    const roles = getRoles(req);
    const { id } = req.params; // aula_id
    const { estudiante_id } = req.body;

    if (!roles.includes('PROFESOR')) {
      return res.status(403).json({ message: 'Solo PROFESOR puede modificar sus aulas' });
    }

    if (!estudiante_id) {
      return res.status(400).json({ message: 'estudiante_id es requerido' });
    }

    // validar que el aula pertenece a este profesor
    const aulaRes = await pool.query(
      `SELECT aula_id FROM aula WHERE aula_id = $1 AND profesor_id = $2`,
      [id, userId]
    );
    if (!aulaRes.rowCount) {
      return res.status(404).json({ message: 'Aula no encontrada o no pertenece al profesor' });
    }

    const estRes = await pool.query(
      `SELECT 1
         FROM usuario_rol ur
         JOIN rol r ON r.rol_id = ur.rol_id
        WHERE ur.usuario_id = $1
          AND r.codigo = 'ESTUDIANTE'`,
      [estudiante_id]
    );
    if (!estRes.rowCount) {
      return res.status(400).json({ message: 'El usuario no tiene rol ESTUDIANTE' });
    }

    await pool.query(
      `INSERT INTO aula_estudiante (aula_id, estudiante_id)
       VALUES ($1, $2)
       ON CONFLICT DO NOTHING`,
      [id, estudiante_id]
    );

    return res.status(201).json({ message: 'Estudiante agregado al aula' });
  } catch (e) {
    console.error('agregarEstudianteAula error:', e.message);
    return res.status(500).json({ message: 'error en el servidor' });
  }
}

export async function eliminarEstudianteDeAula(req, res) {
  try {
    const userId = req.user.sub;
    const roles = getRoles(req);
    const { id, estudianteId } = req.params;

    if (!roles.includes('PROFESOR')) {
      return res.status(403).json({ message: 'Solo PROFESOR puede modificar sus aulas' });
    }

    const result = await pool.query(
      `DELETE FROM aula_estudiante ae
        USING aula a
       WHERE ae.aula_id = a.aula_id
         AND a.profesor_id = $1
         AND ae.aula_id = $2
         AND ae.estudiante_id = $3`,
      [userId, id, estudianteId]
    );

    if (!result.rowCount) {
      return res.status(404).json({ message: 'No se encontró la relación aula-estudiante' });
    }

    return res.json({ message: 'Estudiante eliminado del aula' });
  } catch (e) {
    console.error('eliminarEstudianteDeAula error:', e.message);
    return res.status(500).json({ message: 'error en el servidor' });
  }
}

export async function listarAulasEstudiante(req, res) {
  try {
    const estudianteId = req.user.sub;
    const roles = getRoles(req);

    if (!roles.includes('ESTUDIANTE')) {
      return res.status(403).json({ message: 'Solo ESTUDIANTE puede ver sus aulas' });
    }

    const result = await pool.query(
      `SELECT a.aula_id, a.nombre, a.creado_en,
              p.nombre AS profesor_nombre, p.apellido AS profesor_apellido
         FROM aula_estudiante ae
         JOIN aula a ON a.aula_id = ae.aula_id
         JOIN usuario u ON u.usuario_id = a.profesor_id
         LEFT JOIN perfil p ON p.usuario_id = u.usuario_id
        WHERE ae.estudiante_id = $1
        ORDER BY a.creado_en DESC`,
      [estudianteId]
    );

    return res.json({
      cant: result.rowCount,
      data: result.rows
    });
  } catch (e) {
    console.error('listarAulasEstudiante error:', e.message);
    return res.status(500).json({ message: 'error en el servidor' });
  }
}

export async function eliminarAula(req, res) {
  try {
    const userId = req.user.sub;
    const roles = Array.isArray(req.user?.roles) ? req.user.roles : [];
    const { id } = req.params; // aula_id

    if (!roles.includes('PROFESOR')) {
      return res.status(403).json({ message: 'Solo PROFESOR puede eliminar aulas' });
    }

    const result = await pool.query(
      `DELETE FROM aula
        WHERE aula_id = $1
          AND profesor_id = $2`,
      [id, userId]
    );

    if (!result.rowCount) {
      return res
        .status(404)
        .json({ message: 'Aula no encontrada o no pertenece al profesor' });
    }

    // gracias a ON DELETE CASCADE se borran también los registros de aula_estudiante
    return res.json({ message: 'Aula eliminada correctamente' });
  } catch (e) {
    console.error('eliminarAula error:', e.message);
    return res.status(500).json({ message: 'error en el servidor' });
  }
}


