import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { getInstallationStatus } from '../api/services.js';
import { useAuth } from '../context/AuthContext.jsx';
import { errorMessage } from '../utils/errors.js';

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getInstallationStatus()
      .then((res) => {
        if (!res.installed) navigate('/install', { replace: true });
      })
      .catch(() => {});
  }, [navigate]);

  if (user) return <Navigate to={user.role === 'admin' ? '/admin' : '/operator'} replace />;

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.email.trim() || !form.password) {
      setError('Email et mot de passe requis');
      return;
    }
    setSubmitting(true);
    try {
      const logged = await login(form.email.trim(), form.password);
      navigate(logged.role === 'admin' ? '/admin' : '/operator', { replace: true });
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <form className="rounded-lg border border-gray-200 bg-white p-4 w-full max-w-md" onSubmit={handleSubmit}>
        <h1>Connexion</h1>
        {error && <p className="rounded-md bg-red-100 px-3 py-2 text-red-800">{error}</p>}
        <label>
          Email
          <input name="email" type="email" value={form.email} onChange={handleChange} />
        </label>
        <label>
          Mot de passe
          <input name="password" type="password" value={form.password} onChange={handleChange} />
        </label>
        <button className="inline-block cursor-pointer rounded-md disabled:cursor-not-allowed disabled:opacity-50 bg-blue-700 px-4 py-2 text-[0.95rem] text-white" type="submit" disabled={submitting}>
          {submitting ? 'Connexion...' : 'Se connecter'}
        </button>
      </form>
    </div>
  );
}
