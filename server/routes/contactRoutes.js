import { Router } from 'express';
import {
  createContact,
  deleteContact,
  getContact,
  getContacts,
  updateContact,
} from '../controllers/contactController.js';
import { authRequired, optionalAuth } from '../middleware/authMiddleware.js';

const router = Router();

// Usamos optionalAuth para soportar tanto requests autenticados como modo local de prueba
router.use(optionalAuth);

router.get('/', getContacts);
router.get('/:id', getContact);
router.post('/', authRequired, createContact);
router.put('/:id', authRequired, updateContact);
router.delete('/:id', authRequired, deleteContact);

export default router;
