import { Router } from 'express';
import { requireAuth } from '../controladores/authctrl.js';

import {getMisTareas,getTareaById, postTareaPersonalNueva, listarTareasHijos, entregarTareaHijoPorPadre, postTareaPersonalconGami, putTareaPersonal,deleteTareaPersonal} from '../controladores/tareasctrl.js';

const router = Router();

router.get('/tareas', requireAuth, getMisTareas);

router.get('/tarea/:id', requireAuth, getTareaById);

router.get('/tareahijos', requireAuth, listarTareasHijos);

router.post('/posttarea', requireAuth, postTareaPersonalNueva);

router.post('/entregar-padre/:id', requireAuth, entregarTareaHijoPorPadre);

router.put('/puttarea/:id', requireAuth, putTareaPersonal);

router.delete('/deletetarea/:id', requireAuth, deleteTareaPersonal);

router.post('/posttarea/:id/completar', requireAuth, postTareaPersonalconGami);

export default router;