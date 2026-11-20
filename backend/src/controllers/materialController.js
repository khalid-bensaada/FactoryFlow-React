import RawMaterial from '../models/RawMaterial.js';
import StockMovement from '../models/StockMovement.js';
import HttpError from '../utils/HttpError.js';
import { asyncHandler, cleanString, escapeRegex, nonNegative, positive } from '../utils/helpers.js';

const parseMaterial = (body) => {
  const reference = cleanString(body.reference);
  const name = cleanString(body.name);
  const unit = cleanString(body.unit);
  if (!reference || !name || !unit) throw new HttpError(400, 'Référence, nom et unité sont requis');
  return { reference, name, unit, threshold: nonNegative(body.threshold, "Le seuil d'alerte") };
};

export const listMaterials = asyncHandler(async (req, res) => {
  const q = cleanString(req.query.q);
  const filter = q ? { $or: [{ name: new RegExp(escapeRegex(q), 'i') }, { reference: new RegExp(escapeRegex(q), 'i') }] } : {};
  res.json(await RawMaterial.find(filter).sort({ name: 1 }));
});

export const getMaterial = asyncHandler(async (req, res) => {
  const material = await RawMaterial.findById(req.params.id);
  if (!material) throw new HttpError(404, 'Matière première introuvable');
  res.json(material);
});

export const createMaterial = asyncHandler(async (req, res) => {
  const data = parseMaterial(req.body);
  const stock = nonNegative(req.body.stock, 'Le stock initial');
  const material = await RawMaterial.create({ ...data, stock });
  if (stock > 0) await StockMovement.create({ material: material._id, type: 'in', quantity: stock, createdBy: req.user._id });
  res.status(201).json(material);
});

export const updateMaterial = asyncHandler(async (req, res) => {
  const material = await RawMaterial.findByIdAndUpdate(req.params.id, parseMaterial(req.body), { new: true, runValidators: true });
  if (!material) throw new HttpError(404, 'Matière première introuvable');
  res.json(material);
});

export const stockIn = asyncHandler(async (req, res) => {
  const quantity = positive(req.body.quantity, "La quantité d'entrée");
  const material = await RawMaterial.findByIdAndUpdate(req.params.id, { $inc: { stock: quantity } }, { new: true });
  if (!material) throw new HttpError(404, 'Matière première introuvable');
  await StockMovement.create({ material: material._id, type: 'in', quantity, createdBy: req.user._id });
  res.status(201).json(material);
});

export const movements = asyncHandler(async (req, res) => {
  const list = await StockMovement.find({ material: req.params.id })
    .sort({ createdAt: -1 })
    .populate('order', 'reference')
    .populate('createdBy', 'name');
  res.json(list);
});
