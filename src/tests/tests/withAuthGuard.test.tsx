import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { withAuthGuard } from '../../hoc/withAuthGuard';
import type { AuthContextType, User, Session } from '../../types';

const TestComponent: React.FC = () => <div>Protected Content</div>;
const GuardedComponent = withAuthGuard(TestComponent);

function renderWithAuth(
  authOverrides: Partial<AuthContextType> = {},
  initialEntries: string[] = ['/']
) {
  const defaultUser: User = {
    id: 'u1',
    name: 'Alice',
    email: 'alice@example.com',
  };
  const defaultSession: Session = {
    token: 'token',
    user: defaultUser,
    expiresAt: '',
  };
  const defaultAuth: AuthContextType = {
    user: defaultUser,
    session: defaultSession,
    loading: false,
    error: null,
    login: jest.fn(),
    logout: jest.fn(),
    refreshSession: jest.fn(),
    ...authOverrides,
  };
  return render(
    <AuthContext.Provider value={defaultAuth}>
      <MemoryRouter initialEntries={initialEntries}>
        <Routes>
          <Route path="/" element={<GuardedComponent />} />
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>
  );
}

describe('withAuthGuard', () => {
  it('renders the wrapped component when user is authenticated (happy path)', async () => {
    renderWithAuth();
    expect(await screen.findByText('Protected Content')).toBeInTheDocument();
  });

  it('shows loading state when loading is true', () => {
    renderWithAuth({ loading: true, user: null });
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('redirects to /login when user is not authenticated', async () => {
    renderWithAuth({ user: null, session: null, loading: false });
    await waitFor(() => {
      expect(screen.getByText(/login page/i)).toBeInTheDocument();
    });
  });

  it('renders nothing while redirecting if not authenticated', async () => {
    // We want to check that the protected content is not rendered
    renderWithAuth({ user: null, session: null, loading: false });
    await waitFor(() => {
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });
  });

  it('does not redirect while loading', () => {
    renderWithAuth({ user: null, loading: true });
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
    expect(screen.queryByText('Login Page')).not.toBeInTheDocument();
  });
});