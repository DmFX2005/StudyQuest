import { Router } from 'express';
import { requireAuth } from '../controladores/authctrl.js';
import { getCalendarioEstudiante } from '../controladores/calendarioctrl.js';

const router = Router();

// por ahora solo calendario de estudiante
router.get('/calendarioestudiantes', requireAuth, getCalendarioEstudiante);

export default router;
