import { Router } from 'express';
import { dashboard } from '../controllers/dashboardController.js';
import { authorize, protect } from '../middleware/auth.js';

const router = Router();
router.get('/', protect, authorize('admin'), dashboard);

export default router;
