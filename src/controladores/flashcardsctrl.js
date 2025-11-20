import { pool } from '../db.js';

/* =========================
   HELPER: verificar acceso a un mazo
   - Devuelve true si el usuario:
     - es propietario del mazo, o
     - el mazo está compartido con él como ESTUDIANTE
   ========================= */
async function userTieneAccesoAMazo(mazoId, userId) {
  const res = await pool.query(
    `SELECT 1
       FROM mazo m
       LEFT JOIN mazo_destino md
         ON md.mazo_id = m.mazo_id
      WHERE m.mazo_id = $1
        AND (
              m.propietario_id = $2
           OR (md.destino_tipo = 'ESTUDIANTE' AND md.destino_id = $2)
        )`,
    [mazoId, userId]
  );
  return res.rowCount > 0;
}

/* =========================
   MAZOS
   ========================= */

/**
 * GET /api/mazos
 * Lista mazos visibles para el usuario autenticado:
 * - mazos propios (propietario_id = userId)
 * - mazos compartidos al usuario como ESTUDIANTE en mazo_destino
 */
export async function listarMazos(req, res) {
  try {
    const userId = req.user.sub;

    const result = await pool.query(
      `SELECT DISTINCT m.*
         FROM mazo m
         LEFT JOIN mazo_destino md
           ON md.mazo_id = m.mazo_id
        WHERE m.propietario_id = $1
           OR (md.destino_tipo = 'ESTUDIANTE' AND md.destino_id = $1)
        ORDER BY m.creado_en DESC`,
      [userId]
    );

    return res.json({
      cant: result.rowCount,
      data: result.rows
    });
  } catch (e) {
    console.error('listarMazos error:', e.message);
    return res.status(500).json({ message: 'error en el servidor' });
  }
}

/**
 * GET /api/mazos/:id
 * Detalle de un mazo, sólo si el usuario tiene acceso
 */
export async function getMazoById(req, res) {
  try {
    const userId = req.user.sub;
    const { id } = req.params;

    const tieneAcceso = await userTieneAccesoAMazo(id, userId);
    if (!tieneAcceso) {
      return res.status(404).json({ message: 'Mazo no encontrado o sin acceso' });
    }

    const result = await pool.query(
      `SELECT m.*
         FROM mazo m
        WHERE m.mazo_id = $1`,
      [id]
    );

    if (!result.rowCount) {
      return res.status(404).json({ message: 'Mazo no encontrado' });
    }

    return res.json({
      cant: 1,
      data: result.rows[0]
    });
  } catch (e) {
    console.error('getMazoById error:', e.message);
    return res.status(500).json({ message: 'error en el servidor' });
  }
}

/**
 * POST /api/mazos
 * Crea un mazo para el usuario autenticado
 * Body: { titulo, alcance }  alcance: PERSONAL | AULA | ESTUDIANTE
 */
export async function crearMazo(req, res) {
  try {
    const userId = req.user.sub;
    const { titulo, alcance = 'PERSONAL' } = req.body;

    if (!titulo) {
      return res.status(400).json({ message: 'titulo es requerido' });
    }

    const result = await pool.query(
      `INSERT INTO mazo (
         propietario_id, titulo, alcance, origen_mensaje_ia_id, creado_en
       )
       VALUES ($1, $2, $3, NULL, NOW())
       RETURNING *`,
      [userId, titulo, alcance]
    );

    return res.status(201).json({
      message: 'Mazo creado correctamente',
      data: result.rows[0]
    });
  } catch (e) {
    console.error('crearMazo error:', e.message);
    return res.status(500).json({ message: 'error en el servidor' });
  }
}

/**
 * PUT /api/mazos/:id
 * Actualiza un mazo (solo propietario)
 * Body: { titulo?, alcance? }
 */
export async function actualizarMazo(req, res) {
  try {
    const userId = req.user.sub;
    const { id } = req.params;
    const { titulo, alcance } = req.body;

    // Verificar que el usuario es propietario del mazo
    const esProp = await pool.query(
      `SELECT 1 FROM mazo WHERE mazo_id = $1 AND propietario_id = $2`,
      [id, userId]
    );
    if (!esProp.rowCount) {
      return res.status(403).json({ message: 'No tiene permiso para editar este mazo' });
    }

    const fields = [];
    const values = [id];
    let idx = values.length;

    const addField = (col, val) => {
      if (val !== undefined) {
        idx += 1;
        fields.push(`${col} = $${idx}`);
        values.push(val);
      }
    };

    addField('titulo', titulo);
    addField('alcance', alcance);

    if (!fields.length) {
      return res.status(400).json({ message: 'No hay campos para actualizar' });
    }

    const result = await pool.query(
      `UPDATE mazo
          SET ${fields.join(', ')}
        WHERE mazo_id = $1
       RETURNING *`,
      values
    );

    return res.json({
      message: 'Mazo actualizado correctamente',
      data: result.rows[0]
    });
  } catch (e) {
    console.error('actualizarMazo error:', e.message);
    return res.status(500).json({ message: 'error en el servidor' });
  }
}

/**
 * DELETE /api/mazos/:id
 * Elimina un mazo (solo propietario)
 */
export async function eliminarMazo(req, res) {
  try {
    const userId = req.user.sub;
    const { id } = req.params;

    const result = await pool.query(
      `DELETE FROM mazo
        WHERE mazo_id = $1
          AND propietario_id = $2`,
      [id, userId]
    );

    if (!result.rowCount) {
      return res.status(404).json({ message: 'Mazo no encontrado o sin permiso' });
    }

    return res.json({ message: 'Mazo eliminado' });
  } catch (e) {
    console.error('eliminarMazo error:', e.message);
    return res.status(500).json({ message: 'error en el servidor' });
  }
}

/* =========================
   TARJETAS (FLASHCARDS)
   ========================= */

/**
 * GET /api/mazos/:id/tarjetas
 * Lista tarjetas de un mazo, si el usuario tiene acceso al mazo
 */
export async function listarTarjetasDeMazo(req, res) {
  try {
    const userId = req.user.sub;
    const { id } = req.params; // mazo_id

    const tieneAcceso = await userTieneAccesoAMazo(id, userId);
    if (!tieneAcceso) {
      return res.status(404).json({ message: 'Mazo no encontrado o sin acceso' });
    }

    const result = await pool.query(
      `SELECT t.*
         FROM tarjeta t
        WHERE t.mazo_id = $1
        ORDER BY t.creado_en ASC`,
      [id]
    );

    return res.json({
      cant: result.rowCount,
      data: result.rows
    });
  } catch (e) {
    console.error('listarTarjetasDeMazo error:', e.message);
    return res.status(500).json({ message: 'error en el servidor' });
  }
}

/**
 * POST /api/mazos/:id/tarjetas
 * Crea una tarjeta en un mazo (si el usuario tiene acceso)
 * Body: { frente, reverso, pista }
 */
export async function crearTarjeta(req, res) {
  try {
    const userId = req.user.sub;
    const { id } = req.params; // mazo_id
    const { frente, reverso, pista = null } = req.body;

    if (!frente || !reverso) {
      return res.status(400).json({ message: 'frente y reverso son requeridos' });
    }

    const tieneAcceso = await userTieneAccesoAMazo(id, userId);
    if (!tieneAcceso) {
      return res.status(404).json({ message: 'Mazo no encontrado o sin acceso' });
    }

    const result = await pool.query(
      `INSERT INTO tarjeta (
         mazo_id, frente, reverso, pista, creado_por_id, creado_en
       )
       VALUES ($1, $2, $3, $4, $5, NOW())
       RETURNING *`,
      [id, frente, reverso, pista, userId]
    );

    return res.status(201).json({
      message: 'Tarjeta creada correctamente',
      data: result.rows[0]
    });
  } catch (e) {
    console.error('crearTarjeta error:', e.message);
    return res.status(500).json({ message: 'error en el servidor' });
  }
}

/**
 * PUT /api/tarjetas/:id
 * Actualiza una tarjeta.
 * Permitimos que edite:
 * - el propietario del mazo, o
 * - quien creó la tarjeta (creado_por_id)
 */
export async function actualizarTarjeta(req, res) {
  try {
    const userId = req.user.sub;
    const { id } = req.params;
    const { frente, reverso, pista } = req.body;

    const result = await pool.query(
      `UPDATE tarjeta t
          SET frente = COALESCE($3, t.frente),
              reverso = COALESCE($4, t.reverso),
              pista = COALESCE($5, t.pista)
        FROM mazo m
       WHERE t.tarjeta_id = $1
         AND t.mazo_id = m.mazo_id
         AND (m.propietario_id = $2 OR t.creado_por_id = $2)
       RETURNING t.*`,
      [id, userId, frente, reverso, pista]
    );

    if (!result.rowCount) {
      return res.status(404).json({ message: 'Tarjeta no encontrada o sin permiso' });
    }

    return res.json({
      message: 'Tarjeta actualizada correctamente',
      data: result.rows[0]
    });
  } catch (e) {
    console.error('actualizarTarjeta error:', e.message);
    return res.status(500).json({ message: 'error en el servidor' });
  }
}

/**
 * DELETE /api/tarjetas/:id
 * Elimina una tarjeta.
 * Solo el propietario del mazo o el creador de la tarjeta.
 */
export async function eliminarTarjeta(req, res) {
  try {
    const userId = req.user.sub;
    const { id } = req.params;

    const result = await pool.query(
      `DELETE FROM tarjeta t
        USING mazo m
       WHERE t.tarjeta_id = $1
         AND t.mazo_id = m.mazo_id
         AND (m.propietario_id = $2 OR t.creado_por_id = $2)`,
      [id, userId]
    );

    if (!result.rowCount) {
      return res.status(404).json({ message: 'Tarjeta no encontrada o sin permiso' });
    }

    return res.json({ message: 'Tarjeta eliminada' });
  } catch (e) {
    console.error('eliminarTarjeta error:', e.message);
    return res.status(500).json({ message: 'error en el servidor' });
  }
}


export async function compartirMazoConEstudiante(req, res) {
  try {
    const userId = req.user.sub;   
    const { id } = req.params;     // mazo_id
    const { estudiante_id } = req.body;

    if (!estudiante_id) {
      return res.status(400).json({ message: 'estudiante_id es requerido' });
    }

    // verificar que el mazo le pertenece
    const esProp = await pool.query(
      `SELECT 1 FROM mazo WHERE mazo_id = $1 AND propietario_id = $2`,
      [id, userId]
    );
    if (!esProp.rowCount) {
      return res.status(403).json({ message: 'No tiene permiso para compartir este mazo' });
    }

    // insertar destino (evitar duplicado)
    await pool.query(
      `INSERT INTO mazo_destino (mazo_id, destino_tipo, destino_id)
       VALUES ($1, 'ESTUDIANTE', $2)
       ON CONFLICT DO NOTHING`,
      [id, estudiante_id]
    );

    return res.json({ message: 'Mazo compartido con el estudiante' });
  } catch (e) {
    console.error('compartirMazoConEstudiante error:', e.message);
    return res.status(500).json({ message: 'error en el servidor' });
  }
}
