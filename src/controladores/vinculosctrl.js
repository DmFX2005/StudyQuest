import { pool } from '../db.js';
// Body: { emailHijo: "correo@delhijo.com" }
export async function crearVinculoPadreHijo(req, res) {
  try {
    const padreUserId = req.user.sub;
    const { emailHijo } = req.body;

    if (!emailHijo) {
      return res.status(400).json({ message: 'emailHijo es requerido' });
    }

    //validar que tenga rol PADRE
    const rolesPadre = await pool.query(
      `SELECT 1
         FROM usuario_rol ur
         JOIN rol r ON r.rol_id = ur.rol_id
        WHERE ur.usuario_id = $1 AND r.codigo = 'PADRE'`,
      [padreUserId]
    );
    if (!rolesPadre.rowCount) {
      return res.status(403).json({ message: 'Debe tener rol PADRE para crear vínculos' });
    }

    //Buscar hijo por email
    const hijoRes = await pool.query(
      'SELECT usuario_id FROM usuario WHERE email = $1',
      [emailHijo]
    );
    if (!hijoRes.rowCount) {
      return res.status(404).json({ message: 'Hijo no encontrado' });
    }
    const hijoId = hijoRes.rows[0].usuario_id;

    if (hijoId === padreUserId) {
      return res.status(400).json({ message: 'No puede vincularse a sí mismo como hijo' });
    }

    // Insertar relación 
    await pool.query(
      `INSERT INTO padre_hijo (padre_id, hijo_id, creado_en)
       VALUES ($1,$2,NOW())
       ON CONFLICT DO NOTHING`,
      [padreUserId, hijoId]
    );

    return res.status(201).json({ message: 'Vínculo padre-hijo creado (o ya existía)' });
  } catch (e) {
    console.error('crearVinculoPadreHijo error:', e.message);
    return res.status(500).json({ message: 'error en el servidor' });
  }
}

export async function listarMisHijos(req, res) {
  try {
    const padreUserId = req.user.sub;

    const result = await pool.query(
      `SELECT u.usuario_id AS id,
              u.email,
              COALESCE(p.nombre, '')   AS nombre,
              COALESCE(p.apellido, '') AS apellido
         FROM padre_hijo ph
         JOIN usuario u ON u.usuario_id = ph.hijo_id
         LEFT JOIN perfil p ON p.usuario_id = u.usuario_id
        WHERE ph.padre_id = $1`,
      [padreUserId]
    );

    return res.json({
      cant: result.rowCount,
      data: result.rows
    });
  } catch (e) {
    console.error('listarMisHijos error:', e.message);
    return res.status(500).json({ message: 'error en el servidor' });
  }
}

export async function listarMisPadres(req, res) {
  try {
    const hijoUserId = req.user.sub;

    const result = await pool.query(
      `SELECT u.usuario_id AS id,
              u.email,
              COALESCE(p.nombre, '')   AS nombre,
              COALESCE(p.apellido, '') AS apellido
         FROM padre_hijo ph
         JOIN usuario u ON u.usuario_id = ph.padre_id
         LEFT JOIN perfil p ON p.usuario_id = u.usuario_id
        WHERE ph.hijo_id = $1`,
      [hijoUserId]
    );

    return res.json({
      cant: result.rowCount,
      data: result.rows
    });
  } catch (e) {
    console.error('listarMisPadres error:', e.message);
    return res.status(500).json({ message: 'error en el servidor' });
  }
}
