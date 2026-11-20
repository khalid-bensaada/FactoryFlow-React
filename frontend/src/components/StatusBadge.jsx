import { statusLabels } from '../utils/labels.js';

const styles = {
  planned: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-amber-100 text-amber-800',
  completed: 'bg-emerald-100 text-emerald-800',
  cancelled: 'bg-red-100 text-red-800'
};

export default function StatusBadge({ status }) {
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs ${styles[status] || 'bg-gray-200'}`}>{statusLabels[status] || status}</span>
  );
}
