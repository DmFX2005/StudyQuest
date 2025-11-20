import { Router } from 'express';
import { crearVinculoPadreHijo, listarMisHijos, listarMisPadres } from '../controladores/vinculosctrl.js';
import { requireAuth } from '../controladores/authctrl.js';

const router = Router();

router.post('/postpadre-hijo', requireAuth, crearVinculoPadreHijo);

router.get('/mis-hijos', requireAuth, listarMisHijos);

router.get('/mis-padres', requireAuth, listarMisPadres);

export default router;