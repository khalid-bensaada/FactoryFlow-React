import { Router } from 'express';
import { createMaterial, getMaterial, listMaterials, movements, stockIn, updateMaterial } from '../controllers/materialController.js';
import { authorize, protect } from '../middleware/auth.js';

const router = Router();
router.use(protect, authorize('admin'));
router.route('/').get(listMaterials).post(createMaterial);
router.route('/:id').get(getMaterial).put(updateMaterial);
router.post('/:id/stock-in', stockIn);
router.get('/:id/movements', movements);

export default router;
