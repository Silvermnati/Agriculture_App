/**
 * Utility functions for the application
 */

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
 * @returns {string|null} - Error message or null if valid
 */
export const getValidationError = (fieldName, value) => {
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
      
    default:
      return null;
  }
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