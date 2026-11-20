import Product from '../models/Product.js';
import RawMaterial from '../models/RawMaterial.js';
import HttpError from '../utils/HttpError.js';
import { asyncHandler, cleanString, escapeRegex, positive } from '../utils/helpers.js';

const parseProduct = async (body) => {
  const reference = cleanString(body.reference);
  const name = cleanString(body.name);
  if (!reference || !name) throw new HttpError(400, 'Référence et nom sont requis');
  if (!Array.isArray(body.composition) || body.composition.length === 0) {
    throw new HttpError(400, 'Un produit doit utiliser au moins une matière première');
  }
  const ids = body.composition.map((c) => String(c.material));
  if (new Set(ids).size !== ids.length) throw new HttpError(400, 'Doublon dans la composition');
  const composition = body.composition.map((c) => ({ material: c.material, quantity: positive(c.quantity, 'La quantité unitaire') }));
  const found = await RawMaterial.countDocuments({ _id: { $in: ids } });
  if (found !== ids.length) throw new HttpError(400, 'Matière première inexistante dans la composition');
  return { reference, name, composition };
};

export const listProducts = asyncHandler(async (req, res) => {
  const q = cleanString(req.query.q);
  const filter = q ? { $or: [{ name: new RegExp(escapeRegex(q), 'i') }, { reference: new RegExp(escapeRegex(q), 'i') }] } : {};
  res.json(await Product.find(filter).sort({ name: 1 }).populate('composition.material', 'name reference unit stock'));
});

export const getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).populate('composition.material', 'name reference unit stock');
  if (!product) throw new HttpError(404, 'Produit introuvable');
  res.json(product);
});

export const createProduct = asyncHandler(async (req, res) => {
  const product = await Product.create(await parseProduct(req.body));
  res.status(201).json(product);
});

export const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, await parseProduct(req.body), { new: true, runValidators: true });
  if (!product) throw new HttpError(404, 'Produit introuvable');
  res.json(product);
});
