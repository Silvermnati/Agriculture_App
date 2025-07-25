/**
 * API Helper utilities for handling common API operations
 */

/**
 * Handle API response and extract data
 * @param {Object} response - Axios response object
 * @returns {Object} - Extracted data
 */
export const extractApiData = (response) => {
  if (response.data && response.data.success) {
    return response.data.data;
  }
  return response.data;
};

/**
 * Handle API error and extract error message
 * @param {Object} error - Axios error object
 * @returns {string} - Error message
 */
export const extractApiError = (error) => {
  if (error.response?.data?.error?.message) {
    return error.response.data.error.message;
  }
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.message) {
    return error.message;
  }
  return 'An unexpected error occurred';
};

/**
 * Create form data for file uploads
 * @param {Object} data - Data object
 * @param {Array} fileFields - Array of field names that contain files
 * @returns {FormData} - FormData object
 */
export const createFormData = (data, fileFields = ['featured_image', 'avatar', 'image']) => {
  const formData = new FormData();
  
  Object.keys(data).forEach(key => {
    const value = data[key];
    
    if (fileFields.includes(key) && value instanceof File) {
      formData.append(key, value);
    } else if (Array.isArray(value)) {
      formData.append(key, JSON.stringify(value));
    } else if (value !== null && value !== undefined) {
      formData.append(key, value);
    }
  });
  
  return formData;
};

/**
 * Check if response indicates success
 * @param {Object} response - API response
 * @returns {boolean} - True if successful
 */
export const isApiSuccess = (response) => {
  return response.data && response.data.success === true;
};

/**
 * Format API error for display
 * @param {Object} error - Error object
 * @returns {Object} - Formatted error object
 */
export const formatApiError = (error) => {
  const message = extractApiError(error);
  const status = error.response?.status;
  const code = error.response?.data?.error?.code || error.code;
  
  return {
    message,
    status,
    code,
    isNetworkError: !error.response,
    isServerError: status >= 500,
    isClientError: status >= 400 && status < 500,
    isAuthError: status === 401 || status === 403
  };
};

/**
 * Retry API call with exponential backoff
 * @param {Function} apiCall - API function to retry
 * @param {number} maxRetries - Maximum number of retries
 * @param {number} baseDelay - Base delay in milliseconds
 * @returns {Promise} - Promise that resolves with API response
 */
export const retryApiCall = async (apiCall, maxRetries = 3, baseDelay = 1000) => {
  let lastError;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await apiCall();
    } catch (error) {
      lastError = error;
      
      // Don't retry on client errors (4xx) except 429 (rate limit)
      if (error.response?.status >= 400 && error.response?.status < 500 && error.response?.status !== 429) {
        throw error;
      }
      
      // Don't retry on the last attempt
      if (attempt === maxRetries) {
        break;
      }
      
      // Calculate delay with exponential backoff
      const delay = baseDelay * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
};

/**
 * Create pagination parameters
 * @param {number} page - Current page
 * @param {number} perPage - Items per page
 * @param {Object} filters - Additional filters
 * @returns {Object} - Pagination parameters
 */
export const createPaginationParams = (page = 1, perPage = 10, filters = {}) => {
  return {
    page,
    per_page: perPage,
    ...filters
  };
};

/**
 * Handle file upload validation
 * @param {File} file - File to validate
 * @param {Object} options - Validation options
 * @returns {Object} - Validation result
 */
export const validateFileUpload = (file, options = {}) => {
  const {
    maxSize = 5 * 1024 * 1024, // 5MB default
    allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'],
    maxWidth = null,
    maxHeight = null
  } = options;
  
  const errors = [];
  
  if (!file) {
    return { isValid: true, errors: [] };
  }
  
  // Check file size
  if (file.size > maxSize) {
    errors.push(`File size must be less than ${Math.round(maxSize / (1024 * 1024))}MB`);
  }
  
  // Check file type
  if (!allowedTypes.includes(file.type)) {
    const allowedExtensions = allowedTypes.map(type => type.split('/')[1]).join(', ');
    errors.push(`Only ${allowedExtensions} files are allowed`);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};