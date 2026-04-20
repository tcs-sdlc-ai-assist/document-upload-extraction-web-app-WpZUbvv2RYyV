import React, { useState } from 'react';
import useAuth from '../../hooks/useAuth';

interface SignupFormState {
  username: string;
  password: string;
  confirmPassword: string;
}

const SignupForm: React.FC = () => {
  const { signup, loading, error } = useAuth();
  const [form, setForm] = useState<SignupFormState>({
    username: '',
    password: '',
    confirmPassword: '',
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setFormError(null);
    setSuccess(false);
  };

  const validate = (): string | null => {
    if (!form.username) return 'Username is required.';
    if (!form.password) return 'Password is required.';
    if (!form.confirmPassword) return 'Please confirm your password.';
    if (form.password !== form.confirmPassword) return 'Passwords do not match.';
    if (!/^[a-zA-Z0-9_]+$/.test(form.username)) return 'Username must be alphanumeric or underscore.';
    if (form.username.length < 3 || form.username.length > 32)
      return 'Username must be 3–32 characters.';
    if (form.password.length < 6 || form.password.length > 64)
      return 'Password must be 6–64 characters.';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSuccess(false);
    const validation = validate();
    if (validation) {
      setFormError(validation);
      return;
    }
    try {
      await signup(form.username, form.password);
      setSuccess(true);
      setForm({
        username: '',
        password: '',
        confirmPassword: '',
      });
    } catch (e: any) {
      // error is set in context, but fallback here
      setFormError(e?.message || 'Signup failed.');
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 w-full max-w-md mx-auto bg-white rounded-lg shadow p-8"
      aria-label="Sign up form"
    >
      <h2 className="text-2xl font-bold mb-4 text-center">Sign Up</h2>
      {formError && (
        <div className="rounded bg-red-100 px-4 py-2 text-sm text-red-700" role="alert">
          {formError}
        </div>
      )}
      {error && !formError && (
        <div className="rounded bg-red-100 px-4 py-2 text-sm text-red-700" role="alert">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded bg-green-100 px-4 py-2 text-sm text-green-700" role="status">
          Signup successful! You can now log in.
        </div>
      )}
      <div>
        <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
          Username
        </label>
        <input
          id="username"
          name="username"
          type="text"
          autoComplete="username"
          className="w-full rounded border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none"
          value={form.username}
          onChange={handleChange}
          disabled={loading}
          required
        />
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          className="w-full rounded border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none"
          value={form.password}
          onChange={handleChange}
          disabled={loading}
          required
        />
      </div>
      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
          Confirm Password
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          className="w-full rounded border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none"
          value={form.confirmPassword}
          onChange={handleChange}
          disabled={loading}
          required
        />
      </div>
      <button
        type="submit"
        className="w-full rounded bg-blue-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 disabled:opacity-60"
        disabled={loading}
      >
        {loading ? 'Signing up...' : 'Sign Up'}
      </button>
      <div className="mt-4 text-center text-sm text-gray-600">
        Already have an account?{' '}
        <a href="/login" className="font-medium text-blue-600 hover:underline">
          Log in
        </a>
      </div>
    </form>
  );
};

export default SignupForm;