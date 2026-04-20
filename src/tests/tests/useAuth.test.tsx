import React from 'react';
import { renderHook, act } from '@testing-library/react';
import type { AuthContextType } from '../../types';
import { AuthContext } from '../../context/AuthContext';
import useAuth from '../../hooks/useAuth';

describe('useAuth', () => {
  const mockAuth: AuthContextType = {
    user: { id: '1', name: 'Alice', email: 'alice@example.com' },
    session: {
      token: 'token',
      user: { id: '1', name: 'Alice', email: 'alice@example.com' },
      expiresAt: '',
    },
    loading: false,
    error: null,
    login: jest.fn(),
    logout: jest.fn(),
    refreshSession: jest.fn(),
  };

  it('returns the auth context when used inside provider (happy path)', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthContext.Provider value={mockAuth}>{children}</AuthContext.Provider>
    );
    const { result } = renderHook(() => useAuth(), { wrapper });
    expect(result.current.user?.name).toBe('Alice');
    expect(result.current.session?.token).toBe('token');
    expect(typeof result.current.login).toBe('function');
    expect(typeof result.current.logout).toBe('function');
    expect(typeof result.current.refreshSession).toBe('function');
  });

  it('throws if used outside AuthProvider', () => {
    // Suppress error boundary logs
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => renderHook(() => useAuth())).toThrow(
      /useAuth must be used within an AuthProvider/
    );
    spy.mockRestore();
  });

  it('returns loading and error state from context', () => {
    const errorAuth: AuthContextType = {
      ...mockAuth,
      loading: true,
      error: 'Something went wrong',
    };
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthContext.Provider value={errorAuth}>{children}</AuthContext.Provider>
    );
    const { result } = renderHook(() => useAuth(), { wrapper });
    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBe('Something went wrong');
  });

  it('calls login, logout, and refreshSession from context', async () => {
    const login = jest.fn().mockResolvedValue(undefined);
    const logout = jest.fn();
    const refreshSession = jest.fn().mockResolvedValue(undefined);
    const ctx: AuthContextType = {
      ...mockAuth,
      login,
      logout,
      refreshSession,
    };
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthContext.Provider value={ctx}>{children}</AuthContext.Provider>
    );
    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.login('bob', 'pw');
      await result.current.refreshSession();
    });
    act(() => {
      result.current.logout();
    });

    expect(login).toHaveBeenCalledWith('bob', 'pw');
    expect(refreshSession).toHaveBeenCalled();
    expect(logout).toHaveBeenCalled();
  });
});