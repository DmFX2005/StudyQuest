import { Router } from 'express';
import { requireAuth } from '../controladores/authctrl.js';
import {
  listarAulasProfesor,
  crearAula,
  listarEstudiantesDeAula,
  agregarEstudianteAula,
  eliminarEstudianteDeAula,
  listarAulasEstudiante,
  actualizarAula,
  eliminarAula
} from '../controladores/aulactrl.js';

const router = Router();

// PROFESOR
router.get('/aulasprofesor', requireAuth, listarAulasProfesor);
router.post('/postaula', requireAuth, crearAula);
router.put('/putaula/:id', requireAuth, actualizarAula);
router.get('/estudiantesaulas/:id', requireAuth, listarEstudiantesDeAula);
router.post('/postestudiantesaulas/:id', requireAuth, agregarEstudianteAula);
router.delete('/deleteestudiantes/:id/:estudianteId', requireAuth, eliminarEstudianteDeAula);
router.delete('/deleteaula/:id', requireAuth, eliminarAula);

// ESTUDIANTE
router.get('/aulasestudiante', requireAuth, listarAulasEstudiante);

export default router;
