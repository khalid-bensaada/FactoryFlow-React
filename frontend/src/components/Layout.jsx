import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const adminLinks = [
  { to: '/admin', label: 'Tableau de bord', end: true },
  { to: '/admin/materials', label: 'Matières premières' },
  { to: '/admin/products', label: 'Produits' },
  { to: '/admin/orders', label: 'Ordres' },
  { to: '/admin/operators', label: 'Opérateurs' }
];

const operatorLinks = [{ to: '/operator', label: 'Mes ordres', end: true }];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const links = user.role === 'admin' ? adminLinks : operatorLinks;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen">
      <header className="flex flex-wrap items-center justify-between gap-2 bg-gray-900 px-4 py-3 text-white">
        <strong>FactoryFlow</strong>
        <button className="text-2xl md:hidden" onClick={() => setOpen(!open)} aria-label="Menu">
          ☰
        </button>
        <nav className={`${open ? 'flex' : 'hidden'} w-full flex-col items-start gap-4 md:flex md:w-auto md:flex-row md:items-center`} onClick={() => setOpen(false)}>
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) => (isActive ? 'font-semibold !text-white' : '!text-gray-300')}
            >
              {l.label}
            </NavLink>
          ))}
          <span className="text-gray-400">{user.name}</span>
          <button className="inline-block cursor-pointer rounded-md disabled:cursor-not-allowed disabled:opacity-50 bg-blue-700 px-2.5 py-1 text-sm text-white" onClick={handleLogout}>
            Déconnexion
          </button>
        </nav>
      </header>
      <main className="mx-auto max-w-5xl p-4">
        <Outlet />
      </main>
    </div>
  );
}
