import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getMaterial, getMovements, stockIn } from '../../api/services.js';
import DataState from '../../components/DataState.jsx';
import useFetch from '../../hooks/useFetch.js';
import { errorMessage } from '../../utils/errors.js';
import { formatDate } from '../../utils/labels.js';

export default function MaterialDetail() {
  const { id } = useParams();
  const [quantity, setQuantity] = useState('');
  const [error, setError] = useState('');
  const material = useFetch(() => getMaterial(id), [id]);
  const movements = useFetch(() => getMovements(id), [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!(Number(quantity) > 0)) {
      setError('La quantité doit être strictement positive');
      return;
    }
    try {
      await stockIn(id, Number(quantity));
      setQuantity('');
      material.reload();
      movements.reload();
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  const m = material.data;

  return (
    <div>
      <Link to="/admin/materials">← Retour</Link>
      <DataState loading={material.loading} error={material.error}>
        {m && (
          <>
            <h1>
              {m.name} <small>({m.reference})</small>
            </h1>
            <p>
              Stock : <strong className={m.stock <= m.threshold ? 'font-semibold text-red-600' : ''}>{m.stock} {m.unit}</strong> — seuil : {m.threshold} {m.unit}
            </p>

            <form className="mb-4 rounded-lg border border-gray-200 bg-white p-4 flex flex-wrap items-end gap-3" onSubmit={handleSubmit}>
              <label>
                Entrée de stock ({m.unit})
                <input type="number" min="0" step="any" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
              </label>
              <button className="inline-block cursor-pointer rounded-md disabled:cursor-not-allowed disabled:opacity-50 bg-blue-700 px-4 py-2 text-[0.95rem] text-white" type="submit">
                Enregistrer l’entrée
              </button>
              {error && <p className="rounded-md bg-red-100 px-3 py-2 text-red-800">{error}</p>}
            </form>
          </>
        )}
      </DataState>

      <h2>Historique des mouvements</h2>
      <DataState loading={movements.loading} error={movements.error} empty={movements.data && movements.data.length === 0} emptyText="Aucun mouvement">
        <div className="mb-4 overflow-x-auto rounded-lg border border-gray-200 bg-white">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Quantité</th>
                <th>Ordre</th>
                <th>Par</th>
              </tr>
            </thead>
            <tbody>
              {movements.data?.map((mv) => (
                <tr key={mv._id}>
                  <td>{formatDate(mv.createdAt)}</td>
                  <td>{mv.type === 'in' ? 'Entrée' : 'Sortie'}</td>
                  <td>{mv.quantity}</td>
                  <td>{mv.order?.reference || '-'}</td>
                  <td>{mv.createdBy?.name || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DataState>
    </div>
  );
}
