import HttpError from './HttpError.js';

export const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

export const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const cleanString = (value) => (typeof value === 'string' ? value.trim() : '');

export const positive = (value, label) => {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) throw new HttpError(400, `${label} doit être strictement positive`);
  return n;
};

export const nonNegative = (value, label) => {
  const n = Number(value === undefined || value === '' ? 0 : value);
  if (!Number.isFinite(n) || n < 0) throw new HttpError(400, `${label} doit être positive ou nulle`);
  return n;
};

export const paginate = (query) => {
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(query.limit, 10) || 10, 1), 100);
  return { page, limit, skip: (page - 1) * limit };
};
