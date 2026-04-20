import React from 'react';

interface ProgressIndicatorProps {
  /** Progress value between 0 and 100 */
  value: number;
  /** Optional: label to display above the progress bar */
  label?: string;
  /** Optional: show indeterminate animation if true */
  indeterminate?: boolean;
}

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  value,
  label,
  indeterminate = false,
}) => {
  return (
    <div className="w-full flex flex-col items-center">
      {label && (
        <span className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-200">
          {label}
        </span>
      )}
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
        <div
          className={`h-4 rounded-full transition-all duration-300 ease-in-out ${
            indeterminate
              ? 'bg-blue-500 animate-pulse w-1/3'
              : 'bg-blue-500'
          }`}
          style={
            indeterminate
              ? {}
              : { width: `${Math.max(0, Math.min(100, value))}%` }
          }
          aria-valuenow={indeterminate ? undefined : value}
          aria-valuemin={0}
          aria-valuemax={100}
          role="progressbar"
        />
      </div>
      {!indeterminate && (
        <span className="mt-2 text-xs text-gray-600 dark:text-gray-300">
          {Math.round(Math.max(0, Math.min(100, value)))}%
        </span>
      )}
    </div>
  );
};

export default ProgressIndicator;