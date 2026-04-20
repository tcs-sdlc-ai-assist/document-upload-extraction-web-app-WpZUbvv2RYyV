import React from 'react';
import type { User } from '../../types';

interface HeaderProps {
  user?: User | null;
  onLogout?: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onLogout }) => {
  return (
    <header className="w-full bg-white shadow flex items-center justify-between px-6 py-3">
      <div className="flex items-center space-x-2">
        <span className="text-xl font-bold text-blue-700 tracking-tight">
          doc-upload-extract
        </span>
      </div>
      <div className="flex items-center space-x-4">
        {user ? (
          <>
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt="Avatar"
                className="w-8 h-8 rounded-full object-cover border"
              />
            ) : (
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold text-base uppercase">
                {user.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .slice(0, 2)}
              </span>
            )}
            <span className="text-gray-800 font-medium">{user.name}</span>
            <button
              type="button"
              className="ml-2 px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition focus:outline-none focus:ring-2 focus:ring-blue-400"
              onClick={onLogout}
              aria-label="Logout"
            >
              Logout
            </button>
          </>
        ) : (
          <a
            href="/login"
            className="px-4 py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 transition focus:outline-none focus:ring-2 focus:ring-blue-400"
            role="button"
            aria-label="Login"
          >
            Login
          </a>
        )}
      </div>
    </header>
  );
};

export default Header;