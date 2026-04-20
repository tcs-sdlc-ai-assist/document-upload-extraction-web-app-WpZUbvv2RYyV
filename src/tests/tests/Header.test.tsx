import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

// Assume Header is exported from ../Header
import Header from '../Header';

describe('Header', () => {
  it('renders the app title', () => {
    render(<Header />);
    expect(screen.getByText(/doc-upload-extract/i)).toBeInTheDocument();
  });

  it('shows user avatar and name when user is logged in', () => {
    const user = {
      id: '1',
      name: 'Alice',
      email: 'alice@example.com',
      avatarUrl: 'https://example.com/avatar.png'
    };
    render(<Header user={user} onLogout={jest.fn()} />);
    expect(screen.getByAltText(/avatar/i)).toBeInTheDocument();
    expect(screen.getByText(/alice/i)).toBeInTheDocument();
  });

  it('shows login button when no user is logged in', () => {
    render(<Header user={null} onLogout={jest.fn()} />);
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  it('calls onLogout when logout button is clicked', () => {
    const user = {
      id: '2',
      name: 'Bob',
      email: 'bob@example.com',
      avatarUrl: undefined
    };
    const onLogout = jest.fn();
    render(<Header user={user} onLogout={onLogout} />);
    const logoutBtn = screen.getByRole('button', { name: /logout/i });
    fireEvent.click(logoutBtn);
    expect(onLogout).toHaveBeenCalledTimes(1);
  });
});