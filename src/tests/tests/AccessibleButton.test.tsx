import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

interface AccessibleButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  disabled?: boolean;
  ariaLabel?: string;
}

const AccessibleButton: React.FC<AccessibleButtonProps> = ({
  onClick,
  children,
  disabled = false,
  ariaLabel,
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    aria-label={ariaLabel}
    className="px-4 py-2 bg-blue-600 text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
  >
    {children}
  </button>
);

describe('AccessibleButton', () => {
  it('renders with provided children and responds to click', () => {
    const handleClick = jest.fn();
    render(<AccessibleButton onClick={handleClick}>Submit</AccessibleButton>);
    const button = screen.getByRole('button', { name: /submit/i });
    expect(button).toBeInTheDocument();
    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('applies disabled state and does not call onClick', () => {
    const handleClick = jest.fn();
    render(
      <AccessibleButton onClick={handleClick} disabled>
        Disabled
      </AccessibleButton>
    );
    const button = screen.getByRole('button', { name: /disabled/i });
    expect(button).toBeDisabled();
    fireEvent.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('sets aria-label when provided', () => {
    render(
      <AccessibleButton onClick={() => {}} ariaLabel="Custom Label">
        Icon
      </AccessibleButton>
    );
    const button = screen.getByLabelText('Custom Label');
    expect(button).toBeInTheDocument();
  });

  it('renders children correctly', () => {
    render(<AccessibleButton onClick={() => {}}>Hello World</AccessibleButton>);
    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });
});