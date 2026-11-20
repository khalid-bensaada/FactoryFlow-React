import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import Login from '../pages/Login.jsx';
import { AuthProvider } from '../context/AuthContext.jsx';
import * as api from '../api/services.js';

jest.mock('../api/services.js', () => ({
  getInstallationStatus: jest.fn(),
  login: jest.fn(),
  getMe: jest.fn()
}));

const setup = () =>
  render(
    <MemoryRouter initialEntries={['/login']}>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={<p>Espace admin</p>} />
          <Route path="/operator" element={<p>Espace opérateur</p>} />
          <Route path="/install" element={<p>Installation</p>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  );

describe('Login', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
    api.getInstallationStatus.mockResolvedValue({ installed: true });
  });

  it('redirige un admin vers son espace après connexion', async () => {
    api.login.mockResolvedValue({ token: 'jwt', user: { id: '1', name: 'Admin', role: 'admin' } });
    setup();
    await userEvent.type(screen.getByLabelText('Email'), 'admin@test.com');
    await userEvent.type(screen.getByLabelText('Mot de passe'), 'secret123');
    await userEvent.click(screen.getByRole('button', { name: /se connecter/i }));
    expect(await screen.findByText('Espace admin')).toBeInTheDocument();
    expect(localStorage.getItem('token')).toBe('jwt');
  });

  it('affiche le message d’erreur de l’API', async () => {
    api.login.mockRejectedValue({ response: { data: { message: 'Email ou mot de passe incorrect' } } });
    setup();
    await userEvent.type(screen.getByLabelText('Email'), 'x@test.com');
    await userEvent.type(screen.getByLabelText('Mot de passe'), 'wrong');
    await userEvent.click(screen.getByRole('button', { name: /se connecter/i }));
    expect(await screen.findByText('Email ou mot de passe incorrect')).toBeInTheDocument();
  });

  it('redirige vers l’installation si l’application n’est pas installée', async () => {
    api.getInstallationStatus.mockResolvedValue({ installed: false });
    setup();
    await waitFor(() => expect(screen.getByText('Installation')).toBeInTheDocument());
  });
});
