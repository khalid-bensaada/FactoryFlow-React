import { Router } from 'express';
import { install, installationStatus } from '../controllers/authController.js';

const router = Router();
router.get('/status', installationStatus);
router.post('/', install);

export default router;
