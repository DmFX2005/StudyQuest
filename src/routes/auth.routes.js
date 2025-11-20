import { Router } from 'express';
import { login, register, demoToken } from '../controladores/authctrl.js';

const router = Router();

router.post('/login', login);

router.post('/demo', demoToken);

router.post('/register', register);

export default router;