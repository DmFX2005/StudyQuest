import { pool } from '../db.js';

/**
 * GET /api/menu
 * Devuelve las opciones de menú para el usuario autenticado, según sus roles.
 */
export async function getMenuForUser(req, res) {
  try {
    const userId = req.user.sub;

    const result = await pool.query(
      `SELECT
         m.menu_id,
         m.nombre       AS menu_nombre,
         om.opcion_menu_id,
         om.clave,
         om.etiqueta,
         om.ruta,
         om.orden
       FROM usuario_rol ur
       JOIN rol_opcion_menu rom ON rom.rol_id = ur.rol_id
       JOIN opcion_menu om       ON om.opcion_menu_id = rom.opcion_menu_id
       JOIN menu m               ON m.menu_id = om.menu_id
      WHERE ur.usuario_id = $1
      ORDER BY m.menu_id, om.orden, om.opcion_menu_id`,
      [userId]
    );

    const menusMap = new Map();

    for (const row of result.rows) {
      const menuId = row.menu_id;
      if (!menusMap.has(menuId)) {
        menusMap.set(menuId, {
          menu_id: menuId,
          nombre: row.menu_nombre,
          opciones: []
        });
      }

      menusMap.get(menuId).opciones.push({
        opcion_menu_id: row.opcion_menu_id,
        clave: row.clave,     
        etiqueta: row.etiqueta,
        ruta: row.ruta,        
        orden: row.orden
      });
    }

    const data = Array.from(menusMap.values());

    return res.json({
      cant: data.length,
      data
    });
  } catch (e) {
    console.error('getMenuForUser error:', e.message);
    return res.status(500).json({ message: 'error en el servidor' });
  }
}
