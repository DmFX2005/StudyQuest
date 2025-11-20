import { Router } from 'express';
import { requireAuth } from '../controladores/authctrl.js';
import {
  listarMazos,
  getMazoById,
  crearMazo,
  actualizarMazo,
  eliminarMazo,
  listarTarjetasDeMazo,
  crearTarjeta,
  actualizarTarjeta,
  eliminarTarjeta,
  compartirMazoConEstudiante
} from '../controladores/flashcardsctrl.js';

const router = Router();

// MAZOS
router.get('/flashcards', requireAuth, listarMazos);
router.get('/flashcard/:id', requireAuth, getMazoById);
router.post('/postflashcard', requireAuth, crearMazo);
router.post('/postcompartir-estudiante/:id', requireAuth, compartirMazoConEstudiante);
router.put('/putflashcard/:id', requireAuth, actualizarMazo);
router.delete('/deleteflashcard/:id', requireAuth, eliminarMazo);

// TARJETAS
router.get('/tarjetas/:id', requireAuth, listarTarjetasDeMazo); // id = mazo_id
router.post('/posttarjeta/:id', requireAuth, crearTarjeta);        // id = mazo_id
router.put('/puttarjeta/:id', requireAuth, actualizarTarjeta);    // id = tarjeta_id
router.delete('/deletetarjeta/:id', requireAuth, eliminarTarjeta);   // id = tarjeta_id

export default router;