import { Router } from 'express';
import { requireAuth } from '../controladores/authctrl.js';
import {actualizarRecompensa, crearRecompensa, listarRecompensasEstudiante, confirmarRecompensaGanada, listarRecompensasPadre, revocarRecompensa} from '../controladores/recompensasctrl.js';


const router = Router();

// PADRE
router.get('/recompensasPadre', requireAuth, listarRecompensasPadre);         
router.post('/postrecompensa', requireAuth, crearRecompensa);               // crea recompensa
router.put('/putrecompensa/:id', requireAuth, actualizarRecompensa);        // edita recompensa OFRECIDA
router.post('/:id/revocar', requireAuth, revocarRecompensa);  // revocar
router.post('/postconfirmarrecom/:id', requireAuth, confirmarRecompensaGanada); // marcar GANADA (+XP)

// ESTUDIANTE
router.get('/misrecompensas', requireAuth, listarRecompensasEstudiante);

export default router;
