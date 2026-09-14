import { Router } from 'express';
import { getAllUsers, getUserContacts } from '../controllers/userController.js';
import { authRequired, adminRequired } from '../middleware/authMiddleware.js';

const router = Router();

// Rutas protegidas exclusivamente para Administradores
router.use(authRequired, adminRequired);

router.get('/', getAllUsers);
router.get('/:id/contacts', getUserContacts);

export default router;
