import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { asyncHandler } from '../utils/helpers.js';
import { validateUserInput, publicUser } from './authController.js';

export const listUsers = asyncHandler(async (req, res) => {
  const filter = req.query.role ? { role: req.query.role } : {};
  const users = await User.find(filter).sort({ name: 1 });
  res.json(users.map(publicUser));
});

export const createOperator = asyncHandler(async (req, res) => {
  const { name, email, password } = validateUserInput(req.body);
  const user = await User.create({ name, email, password: await bcrypt.hash(password, 10), role: 'operator' });
  res.status(201).json(publicUser(user));
});
