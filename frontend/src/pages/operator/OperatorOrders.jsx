import { useState } from 'react';
import { Link } from 'react-router-dom';
import { getOrders } from '../../api/services.js';
import DataState from '../../components/DataState.jsx';
import Pagination from '../../components/Pagination.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import useFetch from '../../hooks/useFetch.js';
import { formatDate } from '../../utils/labels.js';

const tabs = {
  active: { label: 'Ordres affectés', status: 'planned,in_progress' },
  history: { label: 'Historique', status: 'completed' }
};

export default function OperatorOrders() {
  const [tab, setTab] = useState('active');
  const [page, setPage] = useState(1);
  const { data, loading, error } = useFetch(() => getOrders({ status: tabs[tab].status, page, limit: 10 }), [tab, page]);

  const changeTab = (key) => {
    setTab(key);
    setPage(1);
  };

  return (
    <div>
      <h1>Mes ordres</h1>
      <div className="my-3 flex flex-wrap items-center gap-2">
        {Object.entries(tabs).map(([key, t]) => (
          <button key={key} className={tab === key ? 'inline-block cursor-pointer rounded-md disabled:cursor-not-allowed disabled:opacity-50 bg-blue-700 px-4 py-2 text-[0.95rem] text-white' : 'inline-block cursor-pointer rounded-md disabled:cursor-not-allowed disabled:opacity-50 bg-gray-200 px-4 py-2 text-[0.95rem] text-gray-900'} onClick={() => changeTab(key)}>
            {t.label}
          </button>
        ))}
      </div>

      <DataState loading={loading} error={error} empty={data && data.data.length === 0} emptyText="Aucun ordre">
        {data && (
          <>
            <div className="mb-4 overflow-x-auto rounded-lg border border-gray-200 bg-white">
              <table>
                <thead>
                  <tr>
                    <th>Référence</th>
                    <th>Produits</th>
                    <th>Statut</th>
                    <th>Créé le</th>
                  </tr>
                </thead>
                <tbody>
                  {data.data.map((o) => (
                    <tr key={o._id}>
                      <td>
                        <Link to={`/operator/orders/${o._id}`}>{o.reference}</Link>
                      </td>
                      <td>{o.items.map((i) => `${i.name} × ${i.quantity}`).join(', ')}</td>
                      <td>
                        <StatusBadge status={o.status} />
                      </td>
                      <td>{formatDate(o.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={data.page} pages={data.pages} onChange={setPage} />
          </>
        )}
      </DataState>
    </div>
  );
}
