export const notFound = (req, res) => res.status(404).json({ message: 'Ressource introuvable' });

export const errorHandler = (err, req, res, next) => {
  if (err.status) return res.status(err.status).json({ message: err.message });
  if (err.code === 11000) return res.status(409).json({ message: 'Valeur déjà utilisée (référence ou email unique)' });
  if (err.name === 'ValidationError') return res.status(400).json({ message: Object.values(err.errors).map((e) => e.message).join(', ') });
  if (err.name === 'CastError') return res.status(400).json({ message: 'Identifiant invalide' });
  console.error(err);
  res.status(500).json({ message: 'Erreur serveur' });
};
