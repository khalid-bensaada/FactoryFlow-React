import { Link } from 'react-router-dom';
import { getDashboard } from '../../api/services.js';
import DataState from '../../components/DataState.jsx';
import useFetch from '../../hooks/useFetch.js';
import { statusLabels } from '../../utils/labels.js';

export default function Dashboard() {
  const { data, loading, error } = useFetch(getDashboard);

  return (
    <div>
      <h1>Tableau de bord</h1>
      <DataState loading={loading} error={error}>
        {data && (
          <>
            <div className="mb-4 grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-4">
              <div className="rounded-lg border border-gray-200 bg-white p-4 flex flex-col gap-1 [&_strong]:text-3xl">
                <span>Produits</span>
                <strong>{data.products}</strong>
              </div>
              <div className="rounded-lg border border-gray-200 bg-white p-4 flex flex-col gap-1 [&_strong]:text-3xl">
                <span>Matières premières</span>
                <strong>{data.materials}</strong>
              </div>
              <div className="rounded-lg border border-gray-200 bg-white p-4 flex flex-col gap-1 [&_strong]:text-3xl">
                <span>Ordres</span>
                <strong>{data.orders}</strong>
              </div>
            </div>

            <h2>Ordres par statut</h2>
            <div className="mb-4 grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-4">
              {Object.entries(data.ordersByStatus).map(([status, count]) => (
                <div key={status} className="rounded-lg border border-gray-200 bg-white p-4 flex flex-col gap-1 [&_strong]:text-3xl">
                  <span>{statusLabels[status]}</span>
                  <strong>{count}</strong>
                </div>
              ))}
            </div>

            <h2>Alertes de stock</h2>
            {data.lowStock.length === 0 ? (
              <p className="text-gray-500">Aucune matière sous son seuil.</p>
            ) : (
              <div className="mb-4 overflow-x-auto rounded-lg border border-gray-200 bg-white">
                <table>
                  <thead>
                    <tr>
                      <th>Référence</th>
                      <th>Matière</th>
                      <th>Stock</th>
                      <th>Seuil</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.lowStock.map((m) => (
                      <tr key={m._id}>
                        <td>{m.reference}</td>
                        <td>
                          <Link to={`/admin/materials/${m._id}`}>{m.name}</Link>
                        </td>
                        <td className="font-semibold text-red-600">
                          {m.stock} {m.unit}
                        </td>
                        <td>
                          {m.threshold} {m.unit}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </DataState>
    </div>
  );
}
