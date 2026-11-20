import { useState } from 'react';
import { createProduct, getMaterials, getProducts, updateProduct } from '../../api/services.js';
import DataState from '../../components/DataState.jsx';
import useFetch from '../../hooks/useFetch.js';
import { errorMessage } from '../../utils/errors.js';

const emptyForm = { reference: '', name: '', composition: [{ material: '', quantity: '' }] };

export default function Products() {
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const products = useFetch(() => getProducts({ q: search }), [search]);
  const materials = useFetch(() => getMaterials());

  const updateLine = (index, field, value) => {
    const composition = form.composition.map((line, i) => (i === index ? { ...line, [field]: value } : line));
    setForm({ ...form, composition });
  };

  const addLine = () => setForm({ ...form, composition: [...form.composition, { material: '', quantity: '' }] });

  const removeLine = (index) => setForm({ ...form, composition: form.composition.filter((_, i) => i !== index) });

  const reset = () => {
    setEditing(null);
    setForm(emptyForm);
    setError('');
  };

  const startEdit = (p) => {
    setEditing(p._id);
    setForm({
      reference: p.reference,
      name: p.name,
      composition: p.composition.map((c) => ({ material: c.material._id, quantity: String(c.quantity) }))
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.reference.trim() || !form.name.trim()) {
      setError('Référence et nom sont requis');
      return;
    }
    if (form.composition.length === 0 || form.composition.some((c) => !c.material || !(Number(c.quantity) > 0))) {
      setError('Chaque ligne doit avoir une matière et une quantité strictement positive');
      return;
    }
    const ids = form.composition.map((c) => c.material);
    if (new Set(ids).size !== ids.length) {
      setError('Une matière ne peut apparaître qu’une seule fois');
      return;
    }
    const body = {
      reference: form.reference.trim(),
      name: form.name.trim(),
      composition: form.composition.map((c) => ({ material: c.material, quantity: Number(c.quantity) }))
    };
    try {
      if (editing) await updateProduct(editing, body);
      else await createProduct(body);
      reset();
      products.reload();
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  return (
    <div>
      <h1>Produits</h1>

      <form className="mb-4 rounded-lg border border-gray-200 bg-white p-4" onSubmit={handleSubmit}>
        <h2>{editing ? 'Modifier le produit' : 'Nouveau produit'}</h2>
        {error && <p className="rounded-md bg-red-100 px-3 py-2 text-red-800">{error}</p>}
        <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-3">
          <label>
            Référence
            <input value={form.reference} onChange={(e) => setForm({ ...form, reference: e.target.value })} />
          </label>
          <label>
            Nom
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </label>
        </div>

        <h3>Composition</h3>
        {form.composition.map((line, index) => (
          <div className="mb-2 flex flex-col gap-2 md:flex-row" key={index}>
            <select value={line.material} onChange={(e) => updateLine(index, 'material', e.target.value)}>
              <option value="">-- Matière --</option>
              {materials.data?.map((m) => (
                <option key={m._id} value={m._id} disabled={form.composition.some((c, i) => i !== index && c.material === m._id)}>
                  {m.name} ({m.unit})
                </option>
              ))}
            </select>
            <input
              type="number"
              min="0"
              step="any"
              placeholder="Quantité unitaire"
              value={line.quantity}
              onChange={(e) => updateLine(index, 'quantity', e.target.value)}
            />
            <button type="button" className="inline-block cursor-pointer rounded-md disabled:cursor-not-allowed disabled:opacity-50 bg-red-600 px-2.5 py-1 text-sm text-white" onClick={() => removeLine(index)} disabled={form.composition.length === 1}>
              ✕
            </button>
          </div>
        ))}
        <div className="my-3 flex flex-wrap items-center gap-2">
          <button type="button" className="inline-block cursor-pointer rounded-md disabled:cursor-not-allowed disabled:opacity-50 bg-gray-200 px-4 py-2 text-[0.95rem] text-gray-900" onClick={addLine}>
            + Matière
          </button>
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

      <DataState loading={products.loading} error={products.error} empty={products.data && products.data.length === 0} emptyText="Aucun produit">
        <div className="mb-4 overflow-x-auto rounded-lg border border-gray-200 bg-white">
          <table>
            <thead>
              <tr>
                <th>Référence</th>
                <th>Nom</th>
                <th>Composition (par unité)</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {products.data?.map((p) => (
                <tr key={p._id}>
                  <td>{p.reference}</td>
                  <td>{p.name}</td>
                  <td>{p.composition.map((c) => `${c.material.name}: ${c.quantity} ${c.material.unit}`).join(' · ')}</td>
                  <td>
                    <button className="inline-block cursor-pointer rounded-md disabled:cursor-not-allowed disabled:opacity-50 bg-blue-700 px-2.5 py-1 text-sm text-white" onClick={() => startEdit(p)}>
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
