import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import type { AuthContextType } from '../../types';
import { AuthContext } from '../../AuthContext';
import LoginForm from '../../components/LoginForm';

describe('LoginForm', () => {
  const mockLogin = jest.fn();
  const mockLogout = jest.fn();
  const mockRefreshSession = jest.fn();

  const renderWithAuth = (authOverrides?: Partial<AuthContextType>) => {
    const defaultAuth: AuthContextType = {
      user: null,
      session: null,
      loading: false,
      error: null,
      login: mockLogin,
      logout: mockLogout,
      refreshSession: mockRefreshSession,
      ...authOverrides,
    };
    return render(
      <AuthContext.Provider value={defaultAuth}>
        <LoginForm />
      </AuthContext.Provider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders email and password fields and submit button', () => {
    renderWithAuth();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument();
  });

  it('calls login with email and password on submit (happy path)', async () => {
    mockLogin.mockResolvedValueOnce(undefined);
    renderWithAuth();

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /log in/i }));

    await waitFor(() =>
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123')
    );
  });

  it('shows loading state when loading is true', () => {
    renderWithAuth({ loading: true });
    expect(screen.getByRole('button', { name: /log in/i })).toBeDisabled();
    expect(screen.getByText(/logging in/i)).toBeInTheDocument();
  });

  it('shows error message when error is present', () => {
    renderWithAuth({ error: 'Invalid credentials' });
    expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
  });

  it('does not call login if fields are empty', async () => {
    renderWithAuth();
    fireEvent.click(screen.getByRole('button', { name: /log in/i }));
    await waitFor(() => {
      expect(mockLogin).not.toHaveBeenCalled();
      expect(screen.getByText(/please enter email and password/i)).toBeInTheDocument();
    });
  });
});