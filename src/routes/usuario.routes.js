import { Router } from 'express';
import {getMe, updateMyPerfil, buscarEstudiantes, listarEstudiantes} from '../controladores/usuarioctrl.js';
import { requireAuth } from '../controladores/authctrl.js';


const router = Router();

router.get('/me',requireAuth, getMe);

router.put('/postperfil',requireAuth, updateMyPerfil);

router.get('/getbuscarestudiantes', requireAuth, buscarEstudiantes);

router.get('/getlistarestudiantes', requireAuth, listarEstudiantes);

export default router;