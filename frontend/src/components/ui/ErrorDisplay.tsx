import React from 'react';
import { FormattedError } from '../../utils/errorHandler';

interface ErrorDisplayProps {
  error: FormattedError | string | null;
  className?: string;
  showIcon?: boolean;
  onRetry?: () => void;
  onDismiss?: () => void;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  error,
  className = '',
  showIcon = true,
  onRetry,
  onDismiss
}) => {
  if (!error) return null;

  const formattedError = typeof error === 'string' 
    ? { message: error, type: 'unknown' as const }
    : error;

  const getErrorStyles = () => {
    switch (formattedError.type) {
      case 'validation':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'authentication':
      case 'authorization':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'network':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'server':
        return 'bg-red-50 border-red-200 text-red-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getErrorIcon = () => {
    switch (formattedError.type) {
      case 'validation':
        return (
          <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        );
      case 'authentication':
      case 'authorization':
        return (
          <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v2H2v-4l4.257-4.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 2 2 0 012 2 1 1 0 102 0 4 4 0 00-4-4z" clipRule="evenodd" />
          </svg>
        );
      case 'network':
        return (
          <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        );
      case 'server':
        return (
          <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        );
      default:
        return (
          <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  return (
    <div className={`rounded-md border p-4 ${getErrorStyles()} ${className}`}>
      <div className="flex">
        {showIcon && (
          <div className="flex-shrink-0">
            {getErrorIcon()}
          </div>
        )}
        <div className={showIcon ? 'ml-3' : ''}>
          <div className="text-sm">
            <p className="font-medium">{formattedError.message}</p>
            {formattedError.details && formattedError.details.length > 0 && (
              <ul className="mt-2 list-disc list-inside space-y-1">
                {formattedError.details.map((detail, index) => (
                  <li key={index} className="text-sm">{detail}</li>
                ))}
              </ul>
            )}
          </div>
          {(onRetry || onDismiss) && (
            <div className="mt-4 flex space-x-2">
              {onRetry && (
                <button
                  type="button"
                  onClick={onRetry}
                  className="text-sm font-medium underline hover:no-underline focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Try Again
                </button>
              )}
              {onDismiss && (
                <button
                  type="button"
                  onClick={onDismiss}
                  className="text-sm font-medium underline hover:no-underline focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Dismiss
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Field-specific error display
interface FieldErrorProps {
  error?: string;
  className?: string;
}

export const FieldError: React.FC<FieldErrorProps> = ({ error, className = '' }) => {
  if (!error) return null;

  return (
    <p className={`mt-1 text-sm text-red-600 ${className}`}>
      {error}
    </p>
  );
};

// Loading error display with retry
interface LoadingErrorProps {
  error: FormattedError | string;
  onRetry: () => void;
  className?: string;
}

export const LoadingError: React.FC<LoadingErrorProps> = ({ error, onRetry, className = '' }) => {
  return (
    <div className={`text-center py-8 ${className}`}>
      <ErrorDisplay 
        error={error}
        onRetry={onRetry}
        className="max-w-md mx-auto"
      />
    </div>
  );
};