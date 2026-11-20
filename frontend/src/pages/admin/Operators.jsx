import { useState } from 'react';
import { createOperator, getOperators } from '../../api/services.js';
import DataState from '../../components/DataState.jsx';
import useFetch from '../../hooks/useFetch.js';
import { errorMessage } from '../../utils/errors.js';

export default function Operators() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const { data, loading, error: loadError, reload } = useFetch(getOperators);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.name.trim() || !form.email.trim() || form.password.length < 6) {
      setError('Nom, email et mot de passe (6 caractères minimum) requis');
      return;
    }
    try {
      await createOperator({ name: form.name.trim(), email: form.email.trim(), password: form.password });
      setForm({ name: '', email: '', password: '' });
      reload();
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  return (
    <div>
      <h1>Opérateurs</h1>
      <form className="mb-4 rounded-lg border border-gray-200 bg-white p-4 grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] items-end gap-3 [&>h2]:col-span-full [&>p]:col-span-full [&>div]:col-span-full" onSubmit={handleSubmit}>
        <h2>Nouvel opérateur</h2>
        {error && <p className="rounded-md bg-red-100 px-3 py-2 text-red-800">{error}</p>}
        <label>
          Nom
          <input name="name" value={form.name} onChange={handleChange} />
        </label>
        <label>
          Email
          <input name="email" type="email" value={form.email} onChange={handleChange} />
        </label>
        <label>
          Mot de passe
          <input name="password" type="password" value={form.password} onChange={handleChange} />
        </label>
        <div className="my-3 flex flex-wrap items-center gap-2">
          <button className="inline-block cursor-pointer rounded-md disabled:cursor-not-allowed disabled:opacity-50 bg-blue-700 px-4 py-2 text-[0.95rem] text-white" type="submit">
            Créer
          </button>
        </div>
      </form>

      <DataState loading={loading} error={loadError} empty={data && data.length === 0} emptyText="Aucun opérateur">
        <div className="mb-4 overflow-x-auto rounded-lg border border-gray-200 bg-white">
          <table>
            <thead>
              <tr>
                <th>Nom</th>
                <th>Email</th>
              </tr>
            </thead>
            <tbody>
              {data?.map((u) => (
                <tr key={u.id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DataState>
    </div>
  );
}
