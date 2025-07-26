import React from 'react';
import { AlertCircle, RefreshCw, X } from 'lucide-react';

const ErrorMessage = ({ 
  error, 
  onRetry, 
  onDismiss, 
  showRetry = true, 
  showDismiss = true,
  className = '',
  variant = 'error' // 'error', 'warning', 'info'
}) => {
  if (!error) return null;

  const getVariantStyles = () => {
    switch (variant) {
      case 'warning':
        return 'bg-yellow-100 border-yellow-400 text-yellow-700';
      case 'info':
        return 'bg-blue-100 border-blue-400 text-blue-700';
      default:
        return 'bg-red-100 border-red-400 text-red-700';
    }
  };

  const getIcon = () => {
    switch (variant) {
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'info':
        return <AlertCircle className="w-5 h-5 text-blue-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-red-500" />;
    }
  };

  return (
    <div className={`border rounded-md p-4 ${getVariantStyles()} ${className}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          {getIcon()}
        </div>
        <div className="ml-3 flex-1">
          <p className="text-sm font-medium">
            {typeof error === 'string' ? error : error.message || 'An error occurred'}
          </p>
          {error.details && (
            <p className="mt-1 text-xs opacity-75">
              {error.details}
            </p>
          )}
        </div>
        <div className="ml-4 flex space-x-2">
          {showRetry && onRetry && (
            <button
              onClick={onRetry}
              className="inline-flex items-center px-2 py-1 text-xs font-medium rounded hover:opacity-75 transition-opacity"
            >
              <RefreshCw className="w-3 h-3 mr-1" />
              Retry
            </button>
          )}
          {showDismiss && onDismiss && (
            <button
              onClick={onDismiss}
              className="inline-flex items-center p-1 rounded hover:opacity-75 transition-opacity"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorMessage;