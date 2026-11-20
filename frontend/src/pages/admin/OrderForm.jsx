import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { createOrder, getOperators, getOrder, getProducts, updateOrder } from '../../api/services.js';
import DataState from '../../components/DataState.jsx';
import useFetch from '../../hooks/useFetch.js';
import { errorMessage } from '../../utils/errors.js';

export default function OrderForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [items, setItems] = useState([{ product: '', quantity: '' }]);
  const [assignedTo, setAssignedTo] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const products = useFetch(() => getProducts());
  const operators = useFetch(getOperators);

  useEffect(() => {
    if (!id) return;
    getOrder(id)
      .then((order) => {
        setItems(order.items.map((i) => ({ product: i.product, quantity: String(i.quantity) })));
        setAssignedTo(order.assignedTo._id);
      })
      .catch((err) => setError(errorMessage(err)));
  }, [id]);

  const requirements = useMemo(() => {
    const totals = new Map();
    if (!products.data) return [];
    items.forEach((item) => {
      const product = products.data.find((p) => p._id === item.product);
      const qty = Number(item.quantity);
      if (!product || !(qty > 0)) return;
      product.composition.forEach((c) => {
        const current = totals.get(c.material._id) || { material: c.material, required: 0 };
        current.required += c.quantity * qty;
        totals.set(c.material._id, current);
      });
    });
    return [...totals.values()];
  }, [items, products.data]);

  const updateItem = (index, field, value) => setItems(items.map((it, i) => (i === index ? { ...it, [field]: value } : it)));

  const addItem = () => setItems([...items, { product: '', quantity: '' }]);

  const removeItem = (index) => setItems(items.filter((_, i) => i !== index));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (items.length === 0 || items.some((i) => !i.product || !(Number(i.quantity) > 0))) {
      setError('Chaque produit doit avoir une quantité strictement positive');
      return;
    }
    const ids = items.map((i) => i.product);
    if (new Set(ids).size !== ids.length) {
      setError('Un produit ne peut figurer qu’une seule fois');
      return;
    }
    if (!assignedTo) {
      setError('Choisissez un opérateur');
      return;
    }
    const body = { assignedTo, items: items.map((i) => ({ product: i.product, quantity: Number(i.quantity) })) };
    setSubmitting(true);
    try {
      const order = id ? await updateOrder(id, body) : await createOrder(body);
      navigate(`/admin/orders/${order._id}`);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <Link to="/admin/orders">← Retour</Link>
      <h1>{id ? 'Modifier l’ordre' : 'Nouvel ordre multi-produits'}</h1>
      <DataState loading={products.loading || operators.loading} error={products.error || operators.error}>
        <form className="mb-4 rounded-lg border border-gray-200 bg-white p-4" onSubmit={handleSubmit}>
          {error && <p className="rounded-md bg-red-100 px-3 py-2 text-red-800">{error}</p>}

          <label>
            Opérateur
            <select value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)}>
              <option value="">-- Choisir --</option>
              {operators.data?.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name}
                </option>
              ))}
            </select>
          </label>

          <h3>Produits</h3>
          {items.map((item, index) => (
            <div className="mb-2 flex flex-col gap-2 md:flex-row" key={index}>
              <select value={item.product} onChange={(e) => updateItem(index, 'product', e.target.value)}>
                <option value="">-- Produit --</option>
                {products.data?.map((p) => (
                  <option key={p._id} value={p._id} disabled={items.some((it, i) => i !== index && it.product === p._id)}>
                    {p.name} ({p.reference})
                  </option>
                ))}
              </select>
              <input
                type="number"
                min="0"
                step="any"
                placeholder="Quantité"
                value={item.quantity}
                onChange={(e) => updateItem(index, 'quantity', e.target.value)}
              />
              <button type="button" className="inline-block cursor-pointer rounded-md disabled:cursor-not-allowed disabled:opacity-50 bg-red-600 px-2.5 py-1 text-sm text-white" onClick={() => removeItem(index)} disabled={items.length === 1}>
                ✕
              </button>
            </div>
          ))}
          <button type="button" className="inline-block cursor-pointer rounded-md disabled:cursor-not-allowed disabled:opacity-50 bg-gray-200 px-4 py-2 text-[0.95rem] text-gray-900" onClick={addItem}>
            + Produit
          </button>

          <h3>Besoins totaux en matières premières</h3>
          {requirements.length === 0 ? (
            <p className="text-gray-500">Sélectionnez des produits et des quantités.</p>
          ) : (
            <ul>
              {requirements.map((r) => (
                <li key={r.material._id} className={r.required > r.material.stock ? 'font-semibold text-red-600' : ''}>
                  {r.material.name} : {r.required} {r.material.unit} (stock : {r.material.stock})
                </li>
              ))}
            </ul>
          )}

          <div className="my-3 flex flex-wrap items-center gap-2">
            <button className="inline-block cursor-pointer rounded-md disabled:cursor-not-allowed disabled:opacity-50 bg-blue-700 px-4 py-2 text-[0.95rem] text-white" type="submit" disabled={submitting}>
              {id ? 'Enregistrer' : 'Créer l’ordre'}
            </button>
          </div>
        </form>
      </DataState>
    </div>
  );
}
