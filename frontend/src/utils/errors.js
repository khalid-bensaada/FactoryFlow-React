export const errorMessage = (err) =>
  err?.response?.data?.message || (err?.request ? 'Serveur injoignable' : err?.message || 'Une erreur est survenue');
