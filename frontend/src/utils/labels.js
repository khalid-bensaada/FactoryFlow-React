export const statusLabels = {
  planned: 'Planifié',
  in_progress: 'En cours',
  completed: 'Terminé',
  cancelled: 'Annulé'
};

export const formatDate = (value) => (value ? new Date(value).toLocaleString('fr-FR') : '-');
