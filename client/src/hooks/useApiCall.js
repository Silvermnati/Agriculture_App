import { useState, useCallback } from 'react';
import { formatApiError, retryApiCall } from '../utils/apiHelpers';

/**
 * Custom hook for handling API calls with loading states and error handling
 * @param {Object} options - Configuration options
 * @returns {Object} - API call utilities
 */
export const useApiCall = (options = {}) => {
  const {
    onSuccess = () => {},
    onError = () => {},
    enableRetry = false,
    maxRetries = 3,
    showToast = false
  } = options;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const execute = useCallback(async (apiFunction, ...args) => {
    setLoading(true);
    setError(null);
    
    try {
      let result;
      
      if (enableRetry) {
        result = await retryApiCall(() => apiFunction(...args), maxRetries);
      } else {
        result = await apiFunction(...args);
      }
      
      setData(result);
      onSuccess(result);
      
      if (showToast && window.toast) {
        window.toast.success('Operation completed successfully');
      }
      
      return result;
    } catch (err) {
      const formattedError = formatApiError(err);
      setError(formattedError);
      onError(formattedError);
      
      if (showToast && window.toast) {
        window.toast.error(formattedError.message);
      }
      
      throw err;
    } finally {
      setLoading(false);
    }
  }, [onSuccess, onError, enableRetry, maxRetries, showToast]);

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setData(null);
  }, []);

  const retry = useCallback((apiFunction, ...args) => {
    return execute(apiFunction, ...args);
  }, [execute]);

  return {
    loading,
    error,
    data,
    execute,
    reset,
    retry,
    isError: !!error,
    isSuccess: !loading && !error && data !== null
  };
};

/**
 * Hook specifically for authentication API calls
 */
export const useAuthApi = () => {
  return useApiCall({
    onError: (error) => {
      if (error.isAuthError) {
        // Clear local storage on auth errors
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Redirect to login if not already there
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    },
    showToast: true
  });
};

/**
 * Hook for CRUD operations with optimistic updates
 */
export const useCrudApi = (options = {}) => {
  const {
    optimisticUpdate = false,
    revalidate = () => {},
    ...restOptions
  } = options;

  const apiCall = useApiCall({
    ...restOptions,
    onSuccess: (result) => {
      if (revalidate) {
        revalidate();
      }
      if (restOptions.onSuccess) {
        restOptions.onSuccess(result);
      }
    }
  });

  const create = useCallback(async (apiFunction, data, optimisticData = null) => {
    if (optimisticUpdate && optimisticData) {
      // Apply optimistic update immediately
      if (restOptions.onOptimisticUpdate) {
        restOptions.onOptimisticUpdate('create', optimisticData);
      }
    }

    try {
      return await apiCall.execute(apiFunction, data);
    } catch (error) {
      if (optimisticUpdate && optimisticData) {
        // Revert optimistic update on error
        if (restOptions.onOptimisticRevert) {
          restOptions.onOptimisticRevert('create', optimisticData);
        }
      }
      throw error;
    }
  }, [apiCall, optimisticUpdate, restOptions]);

  const update = useCallback(async (apiFunction, id, data, optimisticData = null) => {
    if (optimisticUpdate && optimisticData) {
      if (restOptions.onOptimisticUpdate) {
        restOptions.onOptimisticUpdate('update', optimisticData);
      }
    }

    try {
      return await apiCall.execute(apiFunction, id, data);
    } catch (error) {
      if (optimisticUpdate && optimisticData) {
        if (restOptions.onOptimisticRevert) {
          restOptions.onOptimisticRevert('update', optimisticData);
        }
      }
      throw error;
    }
  }, [apiCall, optimisticUpdate, restOptions]);

  const remove = useCallback(async (apiFunction, id, optimisticData = null) => {
    if (optimisticUpdate && optimisticData) {
      if (restOptions.onOptimisticUpdate) {
        restOptions.onOptimisticUpdate('delete', optimisticData);
      }
    }

    try {
      return await apiCall.execute(apiFunction, id);
    } catch (error) {
      if (optimisticUpdate && optimisticData) {
        if (restOptions.onOptimisticRevert) {
          restOptions.onOptimisticRevert('delete', optimisticData);
        }
      }
      throw error;
    }
  }, [apiCall, optimisticUpdate, restOptions]);

  return {
    ...apiCall,
    create,
    update,
    remove,
    delete: remove // Alias for remove
  };
};

export default useApiCall;