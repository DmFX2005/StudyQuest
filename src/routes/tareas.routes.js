import { Router } from 'express';
import { requireAuth } from '../controladores/authctrl.js';

import {getMisTareas,getTareaById, postTareaPersonalNueva, postTareaPersonalconGami, putTareaPersonal,deleteTareaPersonal} from '../controladores/tareasctrl.js';

const router = Router();

router.get('/tareas', requireAuth, getMisTareas);

router.get('/tarea/:id', requireAuth, getTareaById);

router.post('/posttarea', requireAuth, postTareaPersonalNueva);

router.put('/puttarea/:id', requireAuth, putTareaPersonal);

router.delete('/deletetarea/:id', requireAuth, deleteTareaPersonal);

router.post('/posttarea/:id/completar', requireAuth, postTareaPersonalconGami);

export default router;