import Order from '../models/Order.js';
import Product from '../models/Product.js';
import RawMaterial from '../models/RawMaterial.js';
import { asyncHandler } from '../utils/helpers.js';

export const dashboard = asyncHandler(async (req, res) => {
  const [products, materials, orders, byStatus, lowStock] = await Promise.all([
    Product.countDocuments(),
    RawMaterial.countDocuments(),
    Order.countDocuments(),
    Order.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    RawMaterial.find({ $expr: { $lte: ['$stock', '$threshold'] } }).sort({ stock: 1 })
  ]);
  const ordersByStatus = { planned: 0, in_progress: 0, completed: 0, cancelled: 0 };
  byStatus.forEach((s) => {
    ordersByStatus[s._id] = s.count;
  });
  res.json({ products, materials, orders, ordersByStatus, lowStock });
});
