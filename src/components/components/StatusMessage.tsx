import React from 'react';

interface StatusMessageProps {
  status: 'info' | 'success' | 'error' | 'warning';
  message: string;
  className?: string;
}

const statusStyles: Record<
  StatusMessageProps['status'],
  string
> = {
  info: 'bg-blue-50 border-blue-400 text-blue-800',
  success: 'bg-green-50 border-green-400 text-green-800',
  error: 'bg-red-50 border-red-400 text-red-800',
  warning: 'bg-yellow-50 border-yellow-400 text-yellow-800',
};

const StatusMessage: React.FC<StatusMessageProps> = ({
  status,
  message,
  className = '',
}) => {
  return (
    <div
      className={`border-l-4 p-4 rounded-md mb-4 ${statusStyles[status]} ${className}`}
      role={
        status === 'error'
          ? 'alert'
          : status === 'warning'
          ? 'status'
          : 'status'
      }
      aria-live={status === 'error' ? 'assertive' : 'polite'}
    >
      <span className="block text-sm font-medium">{message}</span>
    </div>
  );
};

export default StatusMessage;