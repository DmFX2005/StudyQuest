import { Router } from 'express';
import { requireAuth } from '../controladores/authctrl.js';

import {getTareasProfesorParaEstudiante, listarTareasProfesorParaRevisar, asignarTareaAulaProfesor,asignarTareaProfesor, entregarTareaEstudiante, revisarTareaProfesor} from '../controladores/tareasProfectrl.js';

const router = Router();

router.post('/asignar', requireAuth, asignarTareaProfesor);

router.post('/asignarenaula', requireAuth, asignarTareaAulaProfesor);

router.get('/getmisasignadas', requireAuth, getTareasProfesorParaEstudiante);

router.get('/tareaspararevisar', requireAuth, listarTareasProfesorParaRevisar);

router.post('/postentregar/:id', requireAuth, entregarTareaEstudiante);

router.post('/postrevisar/:id', requireAuth, revisarTareaProfesor);

export default router;