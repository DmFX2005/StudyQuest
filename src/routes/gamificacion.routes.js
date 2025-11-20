import { Router } from 'express';
import { requireAuth } from '../controladores/authctrl.js';
import {registrarPomodoro, listarMisEventosGamificacion, resumenGamificacion} from '../controladores/gamificacionctrl.js';

const router = Router();

router.post('/postpomodoro', requireAuth, registrarPomodoro);

router.get('/historialpomodoro', requireAuth, listarMisEventosGamificacion);

router.get('/resumenpomodoro', requireAuth, resumenGamificacion);

export default router;
