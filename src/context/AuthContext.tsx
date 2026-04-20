import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { User, Session, AuthContextType } from '../types';
import type { AuthUser, AuthSession, AuthResult } from '../services/AuthRepository';
import { AuthRepository } from '../services/AuthRepository';

// --- AuthContext ---

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: React.ReactNode;
}

/**
 * Maps AuthUser to User type.
 */
function mapAuthUserToUser(authUser: AuthUser): User {
  return {
    id: authUser.username,
    name: authUser.username,
    email: `${authUser.username}@demo.local`,
  };
}

/**
 * Maps AuthSession and AuthUser to Session type.
 */
function mapAuthSessionToSession(authSession: AuthSession, user: User): Session {
  return {
    token: `${authSession.username}:${authSession.loginAt}`,
    user,
    expiresAt: '', // No expiration in demo
  };
}

/**
 * AuthProvider manages authentication state and provides context.
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Restore session on mount
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    AuthRepository.getSession()
      .then(async (authSession) => {
        if (!authSession) {
          if (mounted) {
            setUser(null);
            setSession(null);
            setLoading(false);
          }
          return;
        }
        const authUser = await AuthRepository.findUserByUsername(authSession.username);
        if (authUser && mounted) {
          const mappedUser = mapAuthUserToUser(authUser);
          setUser(mappedUser);
          setSession(mapAuthSessionToSession(authSession, mappedUser));
        } else if (mounted) {
          setUser(null);
          setSession(null);
        }
      })
      .catch(() => {
        if (mounted) {
          setUser(null);
          setSession(null);
        }
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const result: AuthResult = await AuthRepository.login(username, password);
      if (result.success && result.user) {
        const mappedUser = mapAuthUserToUser(result.user);
        setUser(mappedUser);
        setSession({
          token: `${result.user.username}:${new Date().toISOString()}`,
          user: mappedUser,
          expiresAt: '',
        });
      } else {
        setUser(null);
        setSession(null);
        setError(result.error || 'Login failed.');
        throw new Error(result.error || 'Login failed.');
      }
    } catch (e: any) {
      setUser(null);
      setSession(null);
      setError(e?.message || 'Login failed.');
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const signup = useCallback(async (username: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const result: AuthResult = await AuthRepository.signup(username, password);
      if (result.success && result.user) {
        const mappedUser = mapAuthUserToUser(result.user);
        setUser(mappedUser);
        setSession({
          token: `${result.user.username}:${new Date().toISOString()}`,
          user: mappedUser,
          expiresAt: '',
        });
      } else {
        setUser(null);
        setSession(null);
        setError(result.error || 'Signup failed.');
        throw new Error(result.error || 'Signup failed.');
      }
    } catch (e: any) {
      setUser(null);
      setSession(null);
      setError(e?.message || 'Signup failed.');
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setLoading(true);
    setError(null);
    AuthRepository.logout()
      .then(() => {
        setUser(null);
        setSession(null);
      })
      .catch(() => {
        setUser(null);
        setSession(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const refreshSession = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const authSession = await AuthRepository.getSession();
      if (!authSession) {
        setUser(null);
        setSession(null);
        return;
      }
      const authUser = await AuthRepository.findUserByUsername(authSession.username);
      if (authUser) {
        const mappedUser = mapAuthUserToUser(authUser);
        setUser(mappedUser);
        setSession(mapAuthSessionToSession(authSession, mappedUser));
      } else {
        setUser(null);
        setSession(null);
      }
    } catch {
      setUser(null);
      setSession(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const value: AuthContextType = {
    user,
    session,
    loading,
    error,
    login,
    logout,
    refreshSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * useAuth hook for accessing auth context.
 */
export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}

export { AuthContext };