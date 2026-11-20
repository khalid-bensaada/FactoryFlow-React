import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { cancelOrder, completeOrder, getOrder, startOrder } from '../api/services.js';
import DataState from '../components/DataState.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import useFetch from '../hooks/useFetch.js';
import { errorMessage } from '../utils/errors.js';
import { formatDate } from '../utils/labels.js';

export default function OrderDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [actionError, setActionError] = useState('');
  const [busy, setBusy] = useState(false);
  const { data: order, loading, error, reload } = useFetch(() => getOrder(id), [id]);

  const base = user.role === 'admin' ? '/admin' : '/operator';
  const backTo = user.role === 'admin' ? '/admin/orders' : '/operator';

  const run = async (action, confirmText) => {
    if (confirmText && !window.confirm(confirmText)) return;
    setActionError('');
    setBusy(true);
    try {
      await action(id);
      await reload();
    } catch (err) {
      setActionError(errorMessage(err));
      await reload();
    } finally {
      setBusy(false);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm('Annuler cet ordre ?')) return;
    setActionError('');
    try {
      await cancelOrder(id);
      navigate(`${base}/orders`);
    } catch (err) {
      setActionError(errorMessage(err));
    }
  };

  return (
    <div>
      <Link to={backTo}>← Retour</Link>
      <DataState loading={loading} error={error}>
        {order && (
          <>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h1>{order.reference}</h1>
              <StatusBadge status={order.status} />
            </div>
            <p>
              Opérateur : {order.assignedTo?.name} — Créé le {formatDate(order.createdAt)}
            </p>
            <p>
              Démarré : {formatDate(order.startedAt)} — Terminé : {formatDate(order.completedAt)}
            </p>

            {actionError && <p className="rounded-md bg-red-100 px-3 py-2 text-red-800">{actionError}</p>}

            <div className="my-3 flex flex-wrap items-center gap-2">
              {user.role === 'operator' && order.status === 'planned' && (
                <button className="inline-block cursor-pointer rounded-md disabled:cursor-not-allowed disabled:opacity-50 bg-blue-700 px-4 py-2 text-[0.95rem] text-white" disabled={busy} onClick={() => run(startOrder, 'Démarrer cet ordre ? Le stock sera consommé.')}>
                  Démarrer
                </button>
              )}
              {user.role === 'operator' && order.status === 'in_progress' && (
                <button className="inline-block cursor-pointer rounded-md disabled:cursor-not-allowed disabled:opacity-50 bg-blue-700 px-4 py-2 text-[0.95rem] text-white" disabled={busy} onClick={() => run(completeOrder, 'Terminer cet ordre ?')}>
                  Terminer
                </button>
              )}
              {user.role === 'admin' && order.status === 'planned' && (
                <>
                  <Link className="inline-block cursor-pointer rounded-md disabled:cursor-not-allowed disabled:opacity-50 bg-gray-200 px-4 py-2 text-[0.95rem] text-gray-900" to={`/admin/orders/${order._id}/edit`}>
                    Modifier
                  </Link>
                  <button className="inline-block cursor-pointer rounded-md disabled:cursor-not-allowed disabled:opacity-50 bg-red-600 px-4 py-2 text-[0.95rem] text-white" onClick={handleCancel}>
                    Annuler l’ordre
                  </button>
                </>
              )}
            </div>

            <h2>Produits</h2>
            <div className="mb-4 overflow-x-auto rounded-lg border border-gray-200 bg-white">
              <table>
                <thead>
                  <tr>
                    <th>Référence</th>
                    <th>Produit</th>
                    <th>Quantité</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((i) => (
                    <tr key={i.product}>
                      <td>{i.reference}</td>
                      <td>{i.name}</td>
                      <td>{i.quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h2>Besoins en matières premières</h2>
            <div className="mb-4 overflow-x-auto rounded-lg border border-gray-200 bg-white">
              <table>
                <thead>
                  <tr>
                    <th>Matière</th>
                    <th>Requis</th>
                    <th>Stock actuel</th>
                  </tr>
                </thead>
                <tbody>
                  {order.requirements.map((r) => (
                    <tr key={r.material._id}>
                      <td>{r.material.name}</td>
                      <td>
                        {r.required} {r.material.unit}
                      </td>
                      <td className={order.status === 'planned' && r.required > r.material.stock ? 'font-semibold text-red-600' : ''}>
                        {r.material.stock} {r.material.unit}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </DataState>
    </div>
  );
}
