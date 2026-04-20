// src/services/AuthRepository.ts

import { hashPassword } from '../utils/hash';

const USERS_KEY = 'auth_users_v1';
const SESSION_KEY = 'auth_session_v1';

export interface AuthUser {
  username: string;
  passwordHash: string;
  createdAt: string; // ISO timestamp
}

export interface AuthSession {
  username: string;
  loginAt: string; // ISO timestamp
}

export interface AuthResult {
  success: boolean;
  user?: AuthUser;
  error?: string;
}

function getStoredUsers(): AuthUser[] {
  try {
    const raw = window.localStorage.getItem(USERS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as AuthUser[];
  } catch {
    return [];
  }
}

function setStoredUsers(users: AuthUser[]): void {
  try {
    window.localStorage.setItem(USERS_KEY, JSON.stringify(users));
  } catch {
    // ignore quota/storage errors
  }
}

function getStoredSession(): AuthSession | null {
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AuthSession;
  } catch {
    return null;
  }
}

function setStoredSession(session: AuthSession): void {
  try {
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch {
    // ignore
  }
}

function clearStoredSession(): void {
  try {
    window.localStorage.removeItem(SESSION_KEY);
  } catch {
    // ignore
  }
}

export class AuthRepository {
  static async getUsers(): Promise<AuthUser[]> {
    return getStoredUsers();
  }

  static async addUser(user: AuthUser): Promise<void> {
    const users = getStoredUsers();
    users.push(user);
    setStoredUsers(users);
  }

  static async findUserByUsername(username: string): Promise<AuthUser | null> {
    const users = getStoredUsers();
    return users.find(u => u.username === username) || null;
  }

  static async setSession(session: AuthSession): Promise<void> {
    setStoredSession(session);
  }

  static async getSession(): Promise<AuthSession | null> {
    return getStoredSession();
  }

  static async clearSession(): Promise<void> {
    clearStoredSession();
  }

  static async signup(username: string, password: string): Promise<AuthResult> {
    // Username validation: 3–32 chars, alphanumeric/underscore
    if (
      typeof username !== 'string' ||
      username.length < 3 ||
      username.length > 32 ||
      !/^[a-zA-Z0-9_]+$/.test(username)
    ) {
      return { success: false, error: 'Username must be 3–32 characters, alphanumeric or underscore.' };
    }
    // Password validation: 6–64 chars
    if (
      typeof password !== 'string' ||
      password.length < 6 ||
      password.length > 64
    ) {
      return { success: false, error: 'Password must be 6–64 characters.' };
    }
    const users = getStoredUsers();
    if (users.some(u => u.username === username)) {
      return { success: false, error: 'Username already exists.' };
    }
    let passwordHash = '';
    try {
      passwordHash = await hashPassword(password);
    } catch {
      return { success: false, error: 'Failed to hash password.' };
    }
    const user: AuthUser = {
      username,
      passwordHash,
      createdAt: new Date().toISOString(),
    };
    setStoredUsers([...users, user]);
    const session: AuthSession = {
      username,
      loginAt: new Date().toISOString(),
    };
    setStoredSession(session);
    return { success: true, user };
  }

  static async login(username: string, password: string): Promise<AuthResult> {
    const users = getStoredUsers();
    const user = users.find(u => u.username === username);
    if (!user) {
      return { success: false, error: 'Invalid username or password.' };
    }
    let passwordHash = '';
    try {
      passwordHash = await hashPassword(password);
    } catch {
      return { success: false, error: 'Failed to hash password.' };
    }
    if (user.passwordHash !== passwordHash) {
      return { success: false, error: 'Invalid username or password.' };
    }
    const session: AuthSession = {
      username,
      loginAt: new Date().toISOString(),
    };
    setStoredSession(session);
    return { success: true, user };
  }

  static async logout(): Promise<void> {
    clearStoredSession();
  }
}