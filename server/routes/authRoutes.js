import { Router } from 'express';
import { login, register, me } from '../controllers/authController.js';
import { authRequired } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/login', login);
router.post('/register', register);
router.get('/me', authRequired, me);

export default router;
