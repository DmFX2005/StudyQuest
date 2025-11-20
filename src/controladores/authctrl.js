import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { JWT_SECRET, JWT_EXPIRES_IN } from '../config.js';
import { pool } from '../db.js';


function signAccessToken(payload) {
  return jwt.sign(payload, JWT_SECRET, {
    algorithm: 'HS256',
    expiresIn: JWT_EXPIRES_IN,
  });
}

function verifyAccessToken(token) {
  return jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] });
}

export function requireAuth(req, res, next) {
  const auth = req.headers.authorization || '';
  const [scheme, token] = auth.split(' ');
  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'Token requerido (Authorization: Bearer <token>)' });
  }
  try {
    req.user = verifyAccessToken(token); // { sub, email, roles? }
    return next();
  } catch {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
}

/*  POST /api/auth/login */
// Body esperado { email, password }
export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email y password son requeridos' });
    }

    //Buscar usuario
    const userRes = await pool.query(
      `SELECT usuario_id, email, hash_password, activo
         FROM usuario
        WHERE email = $1`,
      [email]
    );

    if (!userRes.rowCount) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const u = userRes.rows[0];
    if (!u.activo) {
      return res.status(403).json({ error: 'Usuario inactivo' });
    }

    // Validar password
    const ok = await bcrypt.compare(password, u.hash_password || '');
    if (!ok) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Traer roles para incluirlos en el payload del token
    const rolesRes = await pool.query(
      `SELECT r.codigo
         FROM usuario_rol ur
         JOIN rol r ON r.rol_id = ur.rol_id
        WHERE ur.usuario_id = $1`,
      [u.usuario_id]
    );
    const roles = rolesRes.rows.map(r => r.codigo);

    const perfilRes = await pool.query(
      `SELECT nombre, apellido, nivel_educativo, institucion, grado_grupo, area_docente, telefono_contacto
        FROM perfil
        WHERE usuario_id = $1`,
      [u.usuario_id]
    );
    const perfil = perfilRes.rows[0] || null;

    // Firmar token
    const payload = {
      sub: u.usuario_id,
      email: u.email,
      roles,
      perfil
    };
    const token = signAccessToken(payload);

    return res.json({
      message: 'Login exitoso',
      token,
      token_type: 'Bearer',
      expires_in: JWT_EXPIRES_IN,
      usuario: {
        id: u.usuario_id,
        email: u.email,
        roles,
        perfil,
      },
    });
  } catch (error) {
    console.error('Error en login:', error.message);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}

export async function register(req, res) {
  try {
    const { email, password, rol, perfil } = req.body;

    if (!email || !password || !rol) {
      return res.status(400).json({ error: 'email, password y rol son obligatorios' });
    }

    // 1) Verificar si ya existe el usuario
    const existe = await pool.query(
      'SELECT 1 FROM usuario WHERE email = $1',
      [email]
    );
    if (existe.rowCount > 0) {
      return res.status(409).json({ error: 'El email ya está registrado' });
    }

    // 2) Hashear la contraseña
    const hash = await bcrypt.hash(password, 10);

    // 3) Insertar usuario
    const usuarioRes = await pool.query(
      `INSERT INTO usuario (email, hash_password, activo, creado_en)
       VALUES ($1, $2, true, NOW())
       RETURNING usuario_id, email, activo`,
      [email, hash]
    );
    const usuario = usuarioRes.rows[0];
    const userId = usuario.usuario_id;

    // 4) Insertar perfil SIEMPRE (aunque perfil venga vacío)
    const {
      nombre = null,
      apellido = null,
      fecha_nacimiento = null,
      nivel_educativo = null,
      institucion = null,
      grado_grupo = null,
      area_docente = null,
      telefono_contacto = null
    } = perfil || {};

    await pool.query(
      `INSERT INTO perfil (usuario_id, nombre, apellido, fecha_nacimiento, nivel_educativo,
                           institucion, grado_grupo, area_docente, telefono_contacto, creado_en)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,NOW())`,
      [userId, nombre, apellido, fecha_nacimiento, nivel_educativo,
       institucion, grado_grupo, area_docente, telefono_contacto]
    );

    // 5) Insertar rol
    const rolRes = await pool.query(
      'SELECT rol_id FROM rol WHERE codigo = $1',
      [rol]
    );
    if (!rolRes.rowCount) {
      return res.status(400).json({ error: 'Rol inválido' });
    }

    await pool.query(
      `INSERT INTO usuario_rol (usuario_id, rol_id)
       VALUES ($1, $2)`,
      [userId, rolRes.rows[0].rol_id]
    );

    // 6) Crear token
    const payload = {
      sub: userId,
      email,
      roles: [rol]
    };
    const token = signAccessToken(payload);

    return res.status(201).json({
      message: 'Usuario registrado correctamente',
      token,
      token_type: 'Bearer',
      expires_in: JWT_EXPIRES_IN,
      usuario: {
        id: userId,
        email,
        activo: usuario.activo,
        roles: [rol],
        perfil: {
          nombre,
          apellido,
          fecha_nacimiento,
          nivel_educativo,
          institucion,
          grado_grupo,
          area_docente,
          telefono_contacto
        }
      }
    });

  } catch (error) {
    console.error('Error en register:', error.message);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}


// ENDPOINT DEMO que emite un token sin tocar la BD
export function demoToken(req, res) {
  const payload = { sub: 123, role: 'tester', nombre: 'Usuario Demo' };
  const token = signAccessToken(payload);
  return res.json({ accessToken: token, token_type: 'Bearer', expires_in: JWT_EXPIRES_IN });
}
