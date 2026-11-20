import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute.jsx';
import * as auth from '../context/AuthContext.jsx';

jest.mock('../context/AuthContext.jsx', () => ({ useAuth: jest.fn() }));

const setup = (value) => {
  auth.useAuth.mockReturnValue(value);
  return render(
    <MemoryRouter initialEntries={['/admin']}>
      <Routes>
        <Route path="/login" element={<p>Page login</p>} />
        <Route path="/forbidden" element={<p>Accès refusé</p>} />
        <Route element={<ProtectedRoute roles={['admin']} />}>
          <Route path="/admin" element={<p>Zone admin</p>} />
        </Route>
      </Routes>
    </MemoryRouter>
  );
};

describe('ProtectedRoute', () => {
  it('redirige vers la connexion si non connecté', () => {
    setup({ user: null, loading: false });
    expect(screen.getByText('Page login')).toBeInTheDocument();
  });

  it('redirige un opérateur vers accès refusé', () => {
    setup({ user: { role: 'operator' }, loading: false });
    expect(screen.getByText('Accès refusé')).toBeInTheDocument();
  });

  it('autorise un admin', () => {
    setup({ user: { role: 'admin' }, loading: false });
    expect(screen.getByText('Zone admin')).toBeInTheDocument();
  });
});
