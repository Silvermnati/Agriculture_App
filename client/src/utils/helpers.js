import { VALIDATION } from './constants';

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} - True if valid
 */
export const isValidEmail = (email) => {
  return VALIDATION.EMAIL.PATTERN.test(email);
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {boolean} - True if valid
 */
export const isValidPassword = (password) => {
  return password && password.length >= VALIDATION.PASSWORD.MIN_LENGTH && 
         VALIDATION.PASSWORD.PATTERN.test(password);
};

/**
 * Validate farm size
 * @param {number} size - Farm size to validate
 * @returns {boolean} - True if valid
 */
export const isValidFarmSize = (size) => {
  const numSize = parseFloat(size);
  return !isNaN(numSize) && numSize >= VALIDATION.FARM_SIZE.MIN && numSize <= VALIDATION.FARM_SIZE.MAX;
};

/**
 * Validate farming experience
 * @param {number} years - Years of experience to validate
 * @returns {boolean} - True if valid
 */
export const isValidFarmingExperience = (years) => {
  const numYears = parseInt(years);
  return !isNaN(numYears) && numYears >= VALIDATION.FARMING_EXPERIENCE.MIN && 
         numYears <= VALIDATION.FARMING_EXPERIENCE.MAX;
};

/**
 * Validate name (first name, last name)
 * @param {string} name - Name to validate
 * @returns {boolean} - True if valid
 */
export const isValidName = (name) => {
  return name && name.length >= VALIDATION.NAME.MIN_LENGTH && 
         name.length <= VALIDATION.NAME.MAX_LENGTH;
};

/**
 * Format date to locale string
 * @param {string} dateString - ISO date string
 * @returns {string} - Formatted date
 */
export const formatDate = (dateString) => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

/**
 * Calculate read time for content
 * @param {string} content - Content to calculate read time for
 * @returns {number} - Read time in minutes
 */
export const calculateReadTime = (content) => {
  if (!content) return 1;
  
  // Average reading speed: 200 words per minute
  const words = content.trim().split(/\s+/).length;
  const readTime = Math.ceil(words / 200);
  
  return readTime < 1 ? 1 : readTime;
};

/**
 * Truncate text with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} - Truncated text
 */
export const truncateText = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) return text;
  
  return text.substring(0, maxLength) + '...';
};

/**
 * Format number with commas
 * @param {number} number - Number to format
 * @returns {string} - Formatted number
 */
export const formatNumber = (number) => {
  return number?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') || '0';
};

/**
 * Get error message for form validation
 * @param {string} field - Field name
 * @param {any} value - Field value
 * @returns {string|null} - Error message or null if valid
 */
export const getValidationError = (field, value) => {
  switch (field) {
    case 'email':
      return isValidEmail(value) ? null : VALIDATION.EMAIL.MESSAGE;
    case 'password':
      return isValidPassword(value) ? null : VALIDATION.PASSWORD.MESSAGE;
    case 'farm_size':
      return isValidFarmSize(value) ? null : VALIDATION.FARM_SIZE.MESSAGE;
    case 'farming_experience':
      return isValidFarmingExperience(value) ? null : VALIDATION.FARMING_EXPERIENCE.MESSAGE;
    case 'first_name':
    case 'last_name':
      return isValidName(value) ? null : VALIDATION.NAME.MESSAGE;
    default:
      return null;
  }
};