import { Router } from 'express';
import { createOperator, listUsers } from '../controllers/userController.js';
import { authorize, protect } from '../middleware/auth.js';

const router = Router();
router.use(protect, authorize('admin'));
router.get('/', listUsers);
router.post('/', createOperator);

export default router;
