// src/db.js
import pkg from 'pg';
import {
  BD_HOST,
  BD_DATABASE,
  BD_USER,
  BD_PASSWORD,
  BD_PORT
} from './config.js';

const { Pool } = pkg;

export const pool = new Pool({
  host: BD_HOST,
  database: BD_DATABASE,
  user: BD_USER,
  password: BD_PASSWORD,
  port: Number(BD_PORT)

});


// test de conexión al arrancar
(async () => {
  try {
    await pool.query('SELECT 1');
    console.log('✅ Conectado a PostgreSQL');
  } catch (e) {
    console.error('❌ Error conectando a PostgreSQL:', e.message);
  }
})();
