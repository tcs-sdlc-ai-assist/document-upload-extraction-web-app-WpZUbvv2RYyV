import React from 'react';

interface AccessibleButtonProps {
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
  children: React.ReactNode;
  disabled?: boolean;
  ariaLabel?: string;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
}

/**
 * AccessibleButton is a reusable button component with ARIA and keyboard support.
 */
const AccessibleButton: React.FC<AccessibleButtonProps> = ({
  onClick,
  children,
  disabled = false,
  ariaLabel,
  type = 'button',
  className = '',
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={`px-4 py-2 bg-blue-600 text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-400 transition disabled:opacity-60 ${className}`}
    >
      {children}
    </button>
  );
};

export default AccessibleButton;