import { pool } from "../db.js";

export async function getMe(req, res) {
  try {
    const userId = req.user.sub;

    const userRes = await pool.query(
      `SELECT u.usuario_id, u.email, u.activo,
              jsonb_build_object(
                'nombre', p.nombre,
                'apellido', p.apellido,
                'fecha_nacimiento', p.fecha_nacimiento,
                'nivel_educativo', p.nivel_educativo,
                'institucion', p.institucion,
                'grado_grupo', p.grado_grupo,
                'area_docente', p.area_docente,
                'telefono_contacto', p.telefono_contacto
              ) AS perfil
         FROM usuario u
         LEFT JOIN perfil p ON p.usuario_id = u.usuario_id
        WHERE u.usuario_id = $1`,
      [userId]
    );

    if (!userRes.rowCount) {
      return res.status(404).json({ cant: 0, message: 'Usuario no encontrado' });
    }

    const rolesRes = await pool.query(
      `SELECT r.codigo
         FROM usuario_rol ur
         JOIN rol r ON r.rol_id = ur.rol_id
        WHERE ur.usuario_id = $1`,
      [userId]
    );

    const data = userRes.rows[0];
    const roles = rolesRes.rows.map(r => r.codigo);

    return res.json({
      cant: 1,
      data: { ...data, roles }
    });
  } catch (e) {
    console.error('getMe error:', e.message);
    return res.status(500).json({ message: 'error en el servidor' });
  }
}

export async function updateMyPerfil(req, res) {
  try {
    const userId = req.user.sub;
    const {
      nombre = null, apellido = null, fecha_nacimiento = null,
      nivel_educativo = null, institucion = null, grado_grupo = null,
      area_docente = null, telefono_contacto = null
    } = req.body;

    const result = await pool.query(
      `UPDATE perfil
          SET nombre=$2,
              apellido=$3,
              fecha_nacimiento=$4,
              nivel_educativo=$5,
              institucion=$6,
              grado_grupo=$7,
              area_docente=$8,
              telefono_contacto=$9
        WHERE usuario_id=$1
       RETURNING usuario_id, nombre, apellido, fecha_nacimiento,
                 nivel_educativo, institucion, grado_grupo,
                 area_docente, telefono_contacto`,
      [userId, nombre, apellido, fecha_nacimiento, nivel_educativo,
       institucion, grado_grupo, area_docente, telefono_contacto]
    );

    if (!result.rowCount) {
      // En teoría, no debería pasar porque siempre creamos perfil en register
      return res.status(404).json({ message: 'Perfil no encontrado' });
    }

    return res.json({
      message: 'Perfil actualizado correctamente',
      data: result.rows[0]
    });
  } catch (e) {
    console.error('updateMyPerfil error:', e.message);
    return res.status(500).json({ message: 'error en el servidor' });
  }
}

export async function buscarEstudiantes(req, res) {
  try {
    const { q } = req.query;

    if (!q || q.trim() === '') {
      return res.status(400).json({ message: 'Parámetro q es requerido' });
    }

    const filtro = `%${q.trim()}%`;

    const result = await pool.query(
      `SELECT 
          u.usuario_id AS id,
          u.email,
          COALESCE(p.nombre, '')   AS nombre,
          COALESCE(p.apellido, '') AS apellido,
          p.nivel_educativo,
          p.institucion,
          p.grado_grupo
       FROM usuario u
       JOIN usuario_rol ur ON ur.usuario_id = u.usuario_id
       JOIN rol r ON r.rol_id = ur.rol_id
       LEFT JOIN perfil p ON p.usuario_id = u.usuario_id
      WHERE r.codigo = 'ESTUDIANTE'
        AND (
              p.nombre ILIKE $1
           OR p.apellido ILIKE $1
           OR (p.nombre || ' ' || p.apellido) ILIKE $1
          )
      ORDER BY p.nombre, p.apellido`,
      [filtro]
    );

    return res.json({
      cant: result.rowCount,
      data: result.rows
    });
  } catch (e) {
    console.error('buscarEstudiantes error:', e.message);
    return res.status(500).json({ message: 'error en el servidor' });
  }
}

export async function listarEstudiantes(req, res) {
  try {
    const result = await pool.query(
      `SELECT 
          u.usuario_id AS id,
          u.email,
          COALESCE(p.nombre, '')   AS nombre,
          COALESCE(p.apellido, '') AS apellido,
          p.nivel_educativo,
          p.institucion,
          p.grado_grupo
       FROM usuario u
       JOIN usuario_rol ur ON ur.usuario_id = u.usuario_id
       JOIN rol r ON r.rol_id = ur.rol_id
       LEFT JOIN perfil p ON p.usuario_id = u.usuario_id
      WHERE r.codigo = 'ESTUDIANTE'
      ORDER BY p.nombre, p.apellido, u.email`
    );

    return res.json({
      cant: result.rowCount,
      data: result.rows
    });
  } catch (e) {
    console.error('listarEstudiantes error:', e.message);
    return res.status(500).json({ message: 'error en el servidor' });
  }
}
