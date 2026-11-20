import { useState } from 'react';
import { Link } from 'react-router-dom';
import { getOrders, getProducts } from '../../api/services.js';
import DataState from '../../components/DataState.jsx';
import Pagination from '../../components/Pagination.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import useFetch from '../../hooks/useFetch.js';
import { formatDate, statusLabels } from '../../utils/labels.js';

const emptyFilters = { q: '', status: '', product: '', from: '', to: '' };

export default function Orders() {
  const [filters, setFilters] = useState(emptyFilters);
  const [page, setPage] = useState(1);
  const products = useFetch(() => getProducts());
  const { data, loading, error } = useFetch(() => getOrders({ ...filters, page, limit: 10 }), [filters, page]);

  const handleChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
    setPage(1);
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1>Ordres de fabrication</h1>
        <Link className="inline-block cursor-pointer rounded-md disabled:cursor-not-allowed disabled:opacity-50 bg-blue-700 px-4 py-2 text-[0.95rem] text-white" to="/admin/orders/new">
          + Nouvel ordre
        </Link>
      </div>

      <div className="mb-4 rounded-lg border border-gray-200 bg-white p-4 grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-2">
        <input name="q" placeholder="Référence..." value={filters.q} onChange={handleChange} />
        <select name="status" value={filters.status} onChange={handleChange}>
          <option value="">Tous les statuts</option>
          {Object.entries(statusLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <select name="product" value={filters.product} onChange={handleChange}>
          <option value="">Tous les produits</option>
          {products.data?.map((p) => (
            <option key={p._id} value={p._id}>
              {p.name}
            </option>
          ))}
        </select>
        <input name="from" type="date" value={filters.from} onChange={handleChange} />
        <input name="to" type="date" value={filters.to} onChange={handleChange} />
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
                    <th>Opérateur</th>
                    <th>Statut</th>
                    <th>Créé le</th>
                  </tr>
                </thead>
                <tbody>
                  {data.data.map((o) => (
                    <tr key={o._id}>
                      <td>
                        <Link to={`/admin/orders/${o._id}`}>{o.reference}</Link>
                      </td>
                      <td>{o.items.map((i) => `${i.name} × ${i.quantity}`).join(', ')}</td>
                      <td>{o.assignedTo?.name}</td>
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
