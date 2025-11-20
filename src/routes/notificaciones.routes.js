import { Router } from 'express';
import { requireAuth } from '../controladores/authctrl.js';
import { listarMisNotificaciones, marcarNotificacionLeida} from '../controladores/notificacionctrl.js';

const router = Router();

router.get('/notificaciones', requireAuth, listarMisNotificaciones);
router.post('/postnotificacionleida:id', requireAuth, marcarNotificacionLeida);

export default router;
