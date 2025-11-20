import { Router } from 'express';
import { requireAuth } from '../controladores/authctrl.js';
import { getMenuForUser } from '../controladores/menuctrl.js';

const router = Router();

router.get('/', requireAuth, getMenuForUser);

export default router;  