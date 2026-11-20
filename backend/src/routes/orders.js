import { Router } from 'express';
import { cancelOrder, completeOrder, createOrder, getOrder, listOrders, startOrder, updateOrder } from '../controllers/orderController.js';
import { authorize, protect } from '../middleware/auth.js';

const router = Router();
router.use(protect);
router.route('/').get(listOrders).post(authorize('admin'), createOrder);
router.route('/:id').get(getOrder).put(authorize('admin'), updateOrder);
router.patch('/:id/cancel', authorize('admin'), cancelOrder);
router.patch('/:id/start', authorize('operator'), startOrder);
router.patch('/:id/complete', authorize('operator'), completeOrder);

export default router;
