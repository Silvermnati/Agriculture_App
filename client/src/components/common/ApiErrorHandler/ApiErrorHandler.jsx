import React from 'react';
import { formatApiError } from '../../../utils/apiHelpers';
import './ApiErrorHandler.css';

const ApiErrorHandler = ({ error, onRetry, showRetry = true }) => {
  if (!error) return null;
  
  const formattedError = formatApiError(error);
  
  const getErrorIcon = () => {
    if (formattedError.isNetworkError) return '🌐';
    if (formattedError.isServerError) return '🔧';
    if (formattedError.isAuthError) return '🔒';
    return '⚠️';
  };
  
  const getErrorTitle = () => {
    if (formattedError.isNetworkError) return 'Connection Error';
    if (formattedError.isServerError) return 'Server Error';
    if (formattedError.isAuthError) return 'Authentication Error';
    return 'Error';
  };
  
  const getErrorDescription = () => {
    if (formattedError.isNetworkError) {
      return 'Please check your internet connection and try again.';
    }
    if (formattedError.isServerError) {
      return 'Our servers are experiencing issues. Please try again later.';
    }
    if (formattedError.isAuthError) {
      return 'Please log in again to continue.';
    }
    return 'Something went wrong. Please try again.';
  };
  
  return (
    <div className={`api-error-handler ${formattedError.isAuthError ? 'auth-error' : ''}`}>
      <div className="error-content">
        <div className="error-icon">{getErrorIcon()}</div>
        <div className="error-details">
          <h3 className="error-title">{getErrorTitle()}</h3>
          <p className="error-message">{formattedError.message}</p>
          <p className="error-description">{getErrorDescription()}</p>
          {formattedError.status && (
            <small className="error-status">Status: {formattedError.status}</small>
          )}
        </div>
      </div>
      
      {showRetry && onRetry && !formattedError.isAuthError && (
        <div className="error-actions">
          <button 
            className="retry-button"
            onClick={onRetry}
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
};

export default ApiErrorHandler;