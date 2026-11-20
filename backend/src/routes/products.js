import { Router } from 'express';
import { createProduct, getProduct, listProducts, updateProduct } from '../controllers/productController.js';
import { authorize, protect } from '../middleware/auth.js';

const router = Router();
router.use(protect, authorize('admin'));
router.route('/').get(listProducts).post(createProduct);
router.route('/:id').get(getProduct).put(updateProduct);

export default router;
