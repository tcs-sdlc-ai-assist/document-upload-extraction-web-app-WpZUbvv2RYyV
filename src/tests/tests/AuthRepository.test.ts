import { AuthRepository, type AuthUser, type AuthSession, type AuthResult } from '../../services/AuthRepository';

describe('AuthRepository', () => {
  const TEST_USER = 'testuser';
  const TEST_PASS = 'testpass123';
  const OTHER_USER = 'otheruser';
  const OTHER_PASS = 'otherpass456';

  // Helper to clear all users and session before each test
  beforeEach(async () => {
    window.localStorage.clear();
  });

  describe('signup', () => {
    it('successfully signs up a new user (happy path)', async () => {
      const result = await AuthRepository.signup(TEST_USER, TEST_PASS);
      expect(result.success).toBe(true);
      expect(result.user).toBeDefined();
      const users = await AuthRepository.getUsers();
      expect(users.some(u => u.username === TEST_USER)).toBe(true);
      const session = await AuthRepository.getSession();
      expect(session).not.toBeNull();
      expect(session?.username).toBe(TEST_USER);
    });

    it('rejects signup with duplicate username', async () => {
      await AuthRepository.signup(TEST_USER, TEST_PASS);
      const result = await AuthRepository.signup(TEST_USER, 'anotherpass');
      expect(result.success).toBe(false);
      expect(result.error).toMatch(/already exists/i);
    });

    it('rejects username that is too short', async () => {
      const result = await AuthRepository.signup('ab', TEST_PASS);
      expect(result.success).toBe(false);
      expect(result.error).toMatch(/3–32/);
    });

    it('rejects username with invalid characters', async () => {
      const result = await AuthRepository.signup('bad*user', TEST_PASS);
      expect(result.success).toBe(false);
      expect(result.error).toMatch(/alphanumeric/);
    });

    it('rejects password that is too short', async () => {
      const result = await AuthRepository.signup(TEST_USER, '123');
      expect(result.success).toBe(false);
      expect(result.error).toMatch(/6–64/);
    });

    it('rejects password that is too long', async () => {
      const longPass = 'a'.repeat(65);
      const result = await AuthRepository.signup(TEST_USER, longPass);
      expect(result.success).toBe(false);
      expect(result.error).toMatch(/6–64/);
    });
  });

  describe('login', () => {
    beforeEach(async () => {
      await AuthRepository.signup(TEST_USER, TEST_PASS);
      await AuthRepository.signup(OTHER_USER, OTHER_PASS);
    });

    it('logs in with correct credentials (happy path)', async () => {
      await AuthRepository.logout();
      const result = await AuthRepository.login(TEST_USER, TEST_PASS);
      expect(result.success).toBe(true);
      expect(result.user).toBeDefined();
      const session = await AuthRepository.getSession();
      expect(session?.username).toBe(TEST_USER);
    });

    it('rejects login with wrong password', async () => {
      await AuthRepository.logout();
      const result = await AuthRepository.login(TEST_USER, 'wrongpass');
      expect(result.success).toBe(false);
      expect(result.error).toMatch(/invalid/i);
      const session = await AuthRepository.getSession();
      expect(session?.username).not.toBe(TEST_USER);
    });

    it('rejects login with unknown username', async () => {
      const result = await AuthRepository.login('nouser', 'nopass');
      expect(result.success).toBe(false);
      expect(result.error).toMatch(/invalid/i);
    });

    it('sets session on successful login', async () => {
      await AuthRepository.logout();
      await AuthRepository.login(OTHER_USER, OTHER_PASS);
      const session = await AuthRepository.getSession();
      expect(session?.username).toBe(OTHER_USER);
    });
  });

  describe('session management', () => {
    it('sets and gets session correctly', async () => {
      const session: AuthSession = {
        username: 'sessionuser',
        loginAt: new Date().toISOString(),
      };
      await AuthRepository.setSession(session);
      const loaded = await AuthRepository.getSession();
      expect(loaded).toEqual(session);
    });

    it('clears session', async () => {
      const session: AuthSession = {
        username: 'sessionuser',
        loginAt: new Date().toISOString(),
      };
      await AuthRepository.setSession(session);
      await AuthRepository.clearSession();
      const loaded = await AuthRepository.getSession();
      expect(loaded).toBeNull();
    });

    it('logout clears session', async () => {
      await AuthRepository.signup(TEST_USER, TEST_PASS);
      await AuthRepository.logout();
      const session = await AuthRepository.getSession();
      expect(session).toBeNull();
    });
  });

  describe('getUsers and findUserByUsername', () => {
    it('returns all users', async () => {
      await AuthRepository.signup(TEST_USER, TEST_PASS);
      await AuthRepository.signup(OTHER_USER, OTHER_PASS);
      const users = await AuthRepository.getUsers();
      expect(users.length).toBe(2);
      expect(users.some(u => u.username === TEST_USER)).toBe(true);
      expect(users.some(u => u.username === OTHER_USER)).toBe(true);
    });

    it('finds user by username', async () => {
      await AuthRepository.signup(TEST_USER, TEST_PASS);
      const user = await AuthRepository.findUserByUsername(TEST_USER);
      expect(user).not.toBeNull();
      expect(user?.username).toBe(TEST_USER);
    });

    it('returns null for unknown user', async () => {
      const user = await AuthRepository.findUserByUsername('nouser');
      expect(user).toBeNull();
    });
  });
});