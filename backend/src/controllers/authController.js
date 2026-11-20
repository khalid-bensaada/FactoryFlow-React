import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import HttpError from '../utils/HttpError.js';
import { asyncHandler, cleanString } from '../utils/helpers.js';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validateUserInput = (body) => {
  const name = cleanString(body.name);
  const email = cleanString(body.email).toLowerCase();
  const password = typeof body.password === 'string' ? body.password : '';
  if (!name) throw new HttpError(400, 'Le nom est requis');
  if (!emailRegex.test(email)) throw new HttpError(400, 'Email invalide');
  if (password.length < 6) throw new HttpError(400, 'Le mot de passe doit contenir au moins 6 caractères');
  return { name, email, password };
};

export const signToken = (user) =>
  jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '1d' });

export const publicUser = (user) => ({ id: user._id, name: user.name, email: user.email, role: user.role });

export const installationStatus = asyncHandler(async (req, res) => {
  const count = await User.countDocuments();
  res.json({ installed: count > 0 });
});

export const install = asyncHandler(async (req, res) => {
  if ((await User.countDocuments()) > 0) throw new HttpError(403, 'Application déjà installée');
  const { name, email, password } = validateUserInput(req.body);
  const user = await User.create({ name, email, password: await bcrypt.hash(password, 10), role: 'admin' });
  res.status(201).json({ token: signToken(user), user: publicUser(user) });
});

export const login = asyncHandler(async (req, res) => {
  const email = cleanString(req.body.email).toLowerCase();
  const password = typeof req.body.password === 'string' ? req.body.password : '';
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await bcrypt.compare(password, user.password))) throw new HttpError(401, 'Email ou mot de passe incorrect');
  res.json({ token: signToken(user), user: publicUser(user) });
});

export const me = asyncHandler(async (req, res) => res.json({ user: publicUser(req.user) }));
