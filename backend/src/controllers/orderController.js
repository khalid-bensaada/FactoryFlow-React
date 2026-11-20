import Order from '../models/Order.js';
import Product from '../models/Product.js';
import RawMaterial from '../models/RawMaterial.js';
import StockMovement from '../models/StockMovement.js';
import User from '../models/User.js';
import HttpError from '../utils/HttpError.js';
import { asyncHandler, escapeRegex, paginate, positive, cleanString } from '../utils/helpers.js';

const computeNeeds = (items) => {
  const needs = new Map();
  for (const item of items) {
    for (const c of item.composition) {
      const key = String(c.material);
      needs.set(key, (needs.get(key) || 0) + c.quantity * item.quantity);
    }
  }
  return needs;
};

const buildItems = async (rawItems) => {
  if (!Array.isArray(rawItems) || rawItems.length === 0) throw new HttpError(400, 'Un ordre doit contenir au moins un produit');
  const ids = rawItems.map((i) => String(i.product));
  if (new Set(ids).size !== ids.length) throw new HttpError(400, 'Un produit ne peut figurer qu’une seule fois dans un ordre');
  const products = await Product.find({ _id: { $in: ids } });
  if (products.length !== ids.length) throw new HttpError(400, 'Produit inexistant');
  const byId = new Map(products.map((p) => [String(p._id), p]));
  return rawItems.map((i) => {
    const p = byId.get(String(i.product));
    return {
      product: p._id,
      reference: p.reference,
      name: p.name,
      quantity: positive(i.quantity, 'La quantité à fabriquer'),
      composition: p.composition.map((c) => ({ material: c.material, quantity: c.quantity }))
    };
  });
};

const checkOperator = async (id) => {
  const operator = await User.findOne({ _id: id, role: 'operator' });
  if (!operator) throw new HttpError(400, 'Opérateur invalide');
  return operator._id;
};

const withRequirements = async (order) => {
  const needs = computeNeeds(order.items);
  const materials = await RawMaterial.find({ _id: { $in: [...needs.keys()] } });
  const requirements = materials.map((m) => ({
    material: { _id: m._id, name: m.name, reference: m.reference, unit: m.unit, stock: m.stock },
    required: needs.get(String(m._id))
  }));
  return { ...order.toObject(), requirements };
};

const loadOrder = async (id, user) => {
  const order = await Order.findById(id).populate('assignedTo', 'name email').populate('createdBy', 'name');
  if (!order) throw new HttpError(404, 'Ordre introuvable');
  if (user.role === 'operator' && String(order.assignedTo._id) !== String(user._id)) throw new HttpError(403, 'Accès refusé');
  return order;
};

export const listOrders = asyncHandler(async (req, res) => {
  const { page, limit, skip } = paginate(req.query);
  const filter = {};
  if (req.user.role === 'operator') filter.assignedTo = req.user._id;
  if (req.query.status) filter.status = { $in: String(req.query.status).split(',') };
  if (req.query.product) filter['items.product'] = req.query.product;
  if (req.query.q) filter.reference = new RegExp(escapeRegex(cleanString(req.query.q)), 'i');
  if (req.query.from || req.query.to) {
    filter.createdAt = {};
    if (req.query.from) filter.createdAt.$gte = new Date(req.query.from);
    if (req.query.to) {
      const to = new Date(req.query.to);
      to.setHours(23, 59, 59, 999);
      filter.createdAt.$lte = to;
    }
  }
  const [data, total] = await Promise.all([
    Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).populate('assignedTo', 'name'),
    Order.countDocuments(filter)
  ]);
  res.json({ data, page, total, pages: Math.max(Math.ceil(total / limit), 1) });
});

export const getOrder = asyncHandler(async (req, res) => {
  res.json(await withRequirements(await loadOrder(req.params.id, req.user)));
});

export const createOrder = asyncHandler(async (req, res) => {
  const items = await buildItems(req.body.items);
  const assignedTo = await checkOperator(req.body.assignedTo);
  const order = await Order.create({
    reference: `OF-${Date.now().toString(36).toUpperCase()}`,
    items,
    assignedTo,
    createdBy: req.user._id
  });
  res.status(201).json(order);
});

export const updateOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) throw new HttpError(404, 'Ordre introuvable');
  if (order.status !== 'planned') throw new HttpError(409, 'Seul un ordre planifié peut être modifié');
  order.items = await buildItems(req.body.items);
  order.assignedTo = await checkOperator(req.body.assignedTo);
  await order.save();
  res.json(order);
});

export const cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findOneAndUpdate({ _id: req.params.id, status: 'planned' }, { status: 'cancelled' }, { new: true });
  if (!order) throw new HttpError(409, 'Seul un ordre planifié peut être annulé');
  res.json(order);
});

export const startOrder = asyncHandler(async (req, res) => {
  const order = await Order.findOneAndUpdate(
    { _id: req.params.id, status: 'planned', assignedTo: req.user._id },
    { status: 'in_progress', startedAt: new Date() },
    { new: true }
  );
  if (!order) throw new HttpError(409, 'Ordre introuvable, non affecté ou non planifié');

  const consumed = [];
  try {
    for (const [materialId, quantity] of computeNeeds(order.items)) {
      const updated = await RawMaterial.findOneAndUpdate({ _id: materialId, stock: { $gte: quantity } }, { $inc: { stock: -quantity } });
      if (!updated) {
        const material = await RawMaterial.findById(materialId);
        throw new HttpError(409, `Stock insuffisant pour ${material ? material.name : 'une matière première'}`);
      }
      consumed.push({ material: materialId, quantity });
    }
  } catch (err) {
    await Promise.all(consumed.map((c) => RawMaterial.updateOne({ _id: c.material }, { $inc: { stock: c.quantity } })));
    await Order.updateOne({ _id: order._id }, { status: 'planned', $unset: { startedAt: 1 } });
    throw err;
  }

  await StockMovement.insertMany(
    consumed.map((c) => ({ material: c.material, type: 'out', quantity: c.quantity, order: order._id, createdBy: req.user._id }))
  );
  res.json(order);
});

export const completeOrder = asyncHandler(async (req, res) => {
  const order = await Order.findOneAndUpdate(
    { _id: req.params.id, status: 'in_progress', assignedTo: req.user._id },
    { status: 'completed', completedAt: new Date() },
    { new: true }
  );
  if (!order) throw new HttpError(409, 'Seul un ordre en cours qui vous est affecté peut être terminé');
  res.json(order);
});
