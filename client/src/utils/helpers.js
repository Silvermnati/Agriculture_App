/**
 * Utility functions for the application
 */
import { VALIDATION } from './constants';
import CountryDetectionService from './countryDetectionService';

/**
 * Check if the current user can manage (edit/delete) a post
 * @param {Object} user - Current user object
 * @param {Object} post - Post object
 * @returns {boolean} - True if user can manage the post
 */
export const canManagePost = (user, post) => {
  if (!user || !post) return false;
  
  // Admin can manage any post
  if (user.role === 'admin') return true;
  
  // Author can manage their own post
  return user.id === post.author?.user_id || 
         user.id === post.author_id ||
         user.user_id === post.author?.user_id ||
         user.user_id === post.author_id;
};

/**
 * Format date to readable string
 * @param {string} dateString - ISO date string
 * @returns {string} - Formatted date
 */
export const formatDate = (dateString) => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

/**
 * Format number with commas
 * @param {number} num - Number to format
 * @returns {string} - Formatted number
 */
export const formatNumber = (num) => {
  if (!num) return '0';
  return num.toLocaleString();
};

/**
 * Truncate text to specified length
 * @param {string} text - Text to truncate
 * @param {number} length - Maximum length
 * @returns {string} - Truncated text
 */
export const truncateText = (text, length = 100) => {
  if (!text) return '';
  if (text.length <= length) return text;
  return text.substring(0, length) + '...';
};

/**
 * Get validation error for form fields
 * @param {string} fieldName - Name of the field
 * @param {any} value - Value to validate
 * @param {Object} options - Additional validation options
 * @returns {string|null} - Error message or null if valid
 */
export const getValidationError = (fieldName, value, options = {}) => {
  switch (fieldName) {
    case 'email':
      if (!value) return 'Email is required';
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) return 'Please enter a valid email address';
      return null;
      
    case 'password':
      if (!value) return 'Password is required';
      if (value.length < 8) return 'Password must be at least 8 characters long';
      return null;
      
    case 'first_name':
    case 'last_name':
      if (!value) return `${fieldName.replace('_', ' ')} is required`;
      if (value.length < 2) return `${fieldName.replace('_', ' ')} must be at least 2 characters long`;
      return null;

    case 'phone_number':
      if (!value) return null; // Phone is optional
      if (options.countryCode) {
        try {
          if (!CountryDetectionService.validatePhoneNumber(value, options.countryCode)) {
            const example = CountryDetectionService.getPhoneExample(options.countryCode);
            return `Please enter a valid phone number${example ? `. Example: ${example}` : ''}`;
          }
        } catch (error) {
          console.warn('Phone validation failed:', error);
        }
      }
      return null;
      
    default:
      return null;
  }
};

/**
 * Validate password against all requirements
 * @param {string} password - Password to validate
 * @returns {Object} - Validation result with details
 */
export const validatePassword = (password) => {
  const requirements = VALIDATION.PASSWORD.REQUIREMENTS;
  
  const result = {
    isValid: true,
    requirements: [],
    strength: 0
  };

  requirements.forEach(req => {
    const met = req.validator(password);
    result.requirements.push({
      ...req,
      met
    });
    
    if (met) {
      result.strength += req.optional ? 0.5 : 1;
    } else if (!req.optional) {
      result.isValid = false;
    }
  });

  // Calculate strength percentage
  const totalRequired = requirements.filter(req => !req.optional).length;
  const totalOptional = requirements.filter(req => req.optional).length;
  result.strengthPercentage = Math.min(100, (result.strength / (totalRequired + totalOptional)) * 100);

  return result;
};

/**
 * Debounced validation function
 * @param {Function} validationFn - Validation function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} - Debounced validation function
 */
export const createDebouncedValidator = (validationFn, delay = 300) => {
  return debounce(validationFn, delay);
};

/**
 * Validate form field with enhanced options
 * @param {string} fieldName - Field name
 * @param {any} value - Field value
 * @param {Object} options - Validation options
 * @returns {Object} - Validation result
 */
export const validateField = (fieldName, value, options = {}) => {
  const error = getValidationError(fieldName, value, options);
  
  return {
    isValid: !error,
    error,
    value,
    fieldName
  };
};

/**
 * Validate entire form
 * @param {Object} formData - Form data object
 * @param {Object} validationRules - Validation rules for each field
 * @returns {Object} - Form validation result
 */
export const validateForm = (formData, validationRules = {}) => {
  const errors = {};
  const validFields = {};
  let isValid = true;

  Object.keys(formData).forEach(fieldName => {
    const value = formData[fieldName];
    const rules = validationRules[fieldName] || {};
    
    const fieldResult = validateField(fieldName, value, rules);
    
    if (!fieldResult.isValid) {
      errors[fieldName] = fieldResult.error;
      isValid = false;
    } else {
      validFields[fieldName] = true;
    }
  });

  return {
    isValid,
    errors,
    validFields,
    hasErrors: Object.keys(errors).length > 0
  };
};

/**
 * Format validation error message with placeholders
 * @param {string} message - Error message template
 * @param {Object} placeholders - Placeholder values
 * @returns {string} - Formatted message
 */
export const formatValidationMessage = (message, placeholders = {}) => {
  let formatted = message;
  
  Object.keys(placeholders).forEach(key => {
    const placeholder = `{${key}}`;
    formatted = formatted.replace(new RegExp(placeholder, 'g'), placeholders[key]);
  });
  
  return formatted;
};

/**
 * Generate a random color for avatars
 * @param {string} seed - Seed for consistent color generation
 * @returns {string} - Hex color code
 */
export const generateAvatarColor = (seed) => {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
  ];
  
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  return colors[Math.abs(hash) % colors.length];
};

/**
 * Get initials from name
 * @param {string} name - Full name
 * @returns {string} - Initials
 */
export const getInitials = (name) => {
  if (!name) return 'U';
  
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('');
};

/**
 * Check if user is authenticated
 * @param {Object} user - User object
 * @returns {boolean} - True if authenticated
 */
export const isAuthenticated = (user) => {
  return user && user.id && localStorage.getItem('token');
};

/**
 * Get post status badge color
 * @param {string} status - Post status
 * @returns {string} - CSS class name
 */
export const getStatusBadgeColor = (status) => {
  switch (status) {
    case 'published':
      return 'badge-success';
    case 'draft':
      return 'badge-warning';
    case 'archived':
      return 'badge-secondary';
    default:
      return 'badge-default';
  }
};

/**
 * Calculate reading time
 * @param {string} content - HTML content
 * @returns {number} - Reading time in minutes
 */
export const calculateReadingTime = (content) => {
  if (!content) return 1;
  
  // Remove HTML tags and count words
  const text = content.replace(/<[^>]*>/g, '');
  const wordCount = text.split(/\s+/).length;
  
  // Average reading speed is 200 words per minute
  return Math.max(1, Math.ceil(wordCount / 200));
};

/**
 * Debounce function
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} - Debounced function
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Check if string is valid URL
 * @param {string} string - String to check
 * @returns {boolean} - True if valid URL
 */
export const isValidUrl = (string) => {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
};

export default {
  canManagePost,
  formatDate,
  formatNumber,
  truncateText,
  getValidationError,
  generateAvatarColor,
  getInitials,
  isAuthenticated,
  getStatusBadgeColor,
  calculateReadingTime,
  debounce,
  isValidUrl
};