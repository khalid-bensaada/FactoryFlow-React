import { useState } from 'react';
import { Link } from 'react-router-dom';
import { createMaterial, getMaterials, updateMaterial } from '../../api/services.js';
import DataState from '../../components/DataState.jsx';
import useFetch from '../../hooks/useFetch.js';
import { errorMessage } from '../../utils/errors.js';

const emptyForm = { reference: '', name: '', unit: '', stock: '0', threshold: '0' };

export default function Materials() {
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const { data, loading, error: loadError, reload } = useFetch(() => getMaterials({ q: search }), [search]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const startEdit = (m) => {
    setEditing(m._id);
    setForm({ reference: m.reference, name: m.name, unit: m.unit, stock: String(m.stock), threshold: String(m.threshold) });
  };

  const reset = () => {
    setEditing(null);
    setForm(emptyForm);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.reference.trim() || !form.name.trim() || !form.unit.trim()) {
      setError('Référence, nom et unité sont requis');
      return;
    }
    if (Number(form.stock) < 0 || Number(form.threshold) < 0) {
      setError('Le stock et le seuil ne peuvent pas être négatifs');
      return;
    }
    const body = {
      reference: form.reference.trim(),
      name: form.name.trim(),
      unit: form.unit.trim(),
      stock: Number(form.stock),
      threshold: Number(form.threshold)
    };
    try {
      if (editing) await updateMaterial(editing, body);
      else await createMaterial(body);
      reset();
      reload();
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  return (
    <div>
      <h1>Matières premières</h1>

      <form className="mb-4 rounded-lg border border-gray-200 bg-white p-4 grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] items-end gap-3 [&>h2]:col-span-full [&>p]:col-span-full [&>div]:col-span-full" onSubmit={handleSubmit}>
        <h2>{editing ? 'Modifier la matière' : 'Nouvelle matière'}</h2>
        {error && <p className="rounded-md bg-red-100 px-3 py-2 text-red-800">{error}</p>}
        <label>
          Référence
          <input name="reference" value={form.reference} onChange={handleChange} />
        </label>
        <label>
          Nom
          <input name="name" value={form.name} onChange={handleChange} />
        </label>
        <label>
          Unité
          <input name="unit" value={form.unit} onChange={handleChange} placeholder="kg" />
        </label>
        {!editing && (
          <label>
            Stock initial
            <input name="stock" type="number" min="0" step="any" value={form.stock} onChange={handleChange} />
          </label>
        )}
        <label>
          Seuil d’alerte
          <input name="threshold" type="number" min="0" step="any" value={form.threshold} onChange={handleChange} />
        </label>
        <div className="my-3 flex flex-wrap items-center gap-2">
          <button className="inline-block cursor-pointer rounded-md disabled:cursor-not-allowed disabled:opacity-50 bg-blue-700 px-4 py-2 text-[0.95rem] text-white" type="submit">
            {editing ? 'Enregistrer' : 'Créer'}
          </button>
          {editing && (
            <button className="inline-block cursor-pointer rounded-md disabled:cursor-not-allowed disabled:opacity-50 bg-gray-200 px-4 py-2 text-[0.95rem] text-gray-900" type="button" onClick={reset}>
              Annuler
            </button>
          )}
        </div>
      </form>

      <input className="mb-4" placeholder="Rechercher..." value={search} onChange={(e) => setSearch(e.target.value)} />

      <DataState loading={loading} error={loadError} empty={data && data.length === 0} emptyText="Aucune matière première">
        <div className="mb-4 overflow-x-auto rounded-lg border border-gray-200 bg-white">
          <table>
            <thead>
              <tr>
                <th>Référence</th>
                <th>Nom</th>
                <th>Stock</th>
                <th>Seuil</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {data?.map((m) => (
                <tr key={m._id}>
                  <td>{m.reference}</td>
                  <td>
                    <Link to={`/admin/materials/${m._id}`}>{m.name}</Link>
                  </td>
                  <td className={m.stock <= m.threshold ? 'font-semibold text-red-600' : ''}>
                    {m.stock} {m.unit}
                  </td>
                  <td>
                    {m.threshold} {m.unit}
                  </td>
                  <td>
                    <button className="inline-block cursor-pointer rounded-md disabled:cursor-not-allowed disabled:opacity-50 bg-blue-700 px-2.5 py-1 text-sm text-white" onClick={() => startEdit(m)}>
                      Modifier
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DataState>
    </div>
  );
}
