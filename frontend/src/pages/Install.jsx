import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getInstallationStatus, install } from '../api/services.js';
import { useAuth } from '../context/AuthContext.jsx';
import { errorMessage } from '../utils/errors.js';

export default function Install() {
  const { setSession } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    getInstallationStatus()
      .then((res) => {
        if (res.installed) navigate('/login', { replace: true });
      })
      .catch((err) => setError(errorMessage(err)))
      .finally(() => setChecking(false));
  }, [navigate]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.name.trim() || !form.email.trim() || form.password.length < 6) {
      setError('Nom, email et mot de passe (6 caractères minimum) requis');
      return;
    }
    try {
      const res = await install({ name: form.name.trim(), email: form.email.trim(), password: form.password });
      setSession(res);
      navigate('/admin', { replace: true });
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  if (checking) return <p className="p-8 text-center">Chargement...</p>;

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <form className="rounded-lg border border-gray-200 bg-white p-4 w-full max-w-md" onSubmit={handleSubmit}>
        <h1>Installation</h1>
        <p className="text-gray-500">Créez le premier compte administrateur.</p>
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
        <button className="inline-block cursor-pointer rounded-md disabled:cursor-not-allowed disabled:opacity-50 bg-blue-700 px-4 py-2 text-[0.95rem] text-white" type="submit">
          Initialiser
        </button>
      </form>
    </div>
  );
}
