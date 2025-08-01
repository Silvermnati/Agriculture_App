/**
 * Time utility functions for consistent timezone handling
 *
 * @format
 */

/**
 * Parse a timestamp from the backend and ensure it's treated as UTC
 * @param {string} timestamp - ISO timestamp from backend
 * @returns {Date} - Properly parsed Date object
 */
export const parseBackendTimestamp = (timestamp) => {
  if (!timestamp) return null;

  // Ensure timestamp is treated as UTC
  let utcTimestamp = timestamp;
  if (!timestamp.endsWith("Z") && !timestamp.includes("+")) {
    utcTimestamp = `${timestamp}Z`;
  }

  return new Date(utcTimestamp);
};

/**
 * Format time ago with proper timezone handling
 * @param {string} timestamp - ISO timestamp from backend
 * @returns {string} - Formatted time ago string
 */
export const formatTimeAgo = (timestamp) => {
  if (!timestamp) return "";

  const now = new Date();
  const time = parseBackendTimestamp(timestamp);

  if (!time || isNaN(time.getTime())) return "";

  const diffInSeconds = Math.floor((now - time) / 1000);

  if (diffInSeconds < 30) return "Just now";
  if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800)
    return `${Math.floor(diffInSeconds / 86400)}d ago`;

  return time.toLocaleDateString();
};

/**
 * Format a timestamp for display with proper timezone handling
 * @param {string} timestamp - ISO timestamp from backend
 * @param {Object} options - Intl.DateTimeFormat options
 * @returns {string} - Formatted date string
 */
export const formatDateTime = (timestamp, options = {}) => {
  if (!timestamp) return "";

  const time = parseBackendTimestamp(timestamp);
  if (!time) return "";

  const defaultOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    ...options,
  };

  return time.toLocaleString("en-US", defaultOptions);
};

/**
 * Format a date for display with proper timezone handling
 * @param {string} timestamp - ISO timestamp from backend
 * @param {Object} options - Intl.DateTimeFormat options
 * @returns {string} - Formatted date string
 */
export const formatDate = (timestamp, options = {}) => {
  if (!timestamp) return "";

  const time = parseBackendTimestamp(timestamp);
  if (!time) return "";

  const defaultOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
    ...options,
  };

  return time.toLocaleDateString("en-US", defaultOptions);
};

/**
 * Get current timestamp in UTC for sending to backend
 * @returns {string} - ISO timestamp string
 */
export const getCurrentUTCTimestamp = () => {
  return new Date().toISOString();
};

/**
 * Check if a timestamp is within a certain time range
 * @param {string} timestamp - ISO timestamp from backend
 * @param {number} minutes - Number of minutes to check
 * @returns {boolean} - Whether timestamp is within range
 */
export const isWithinTimeRange = (timestamp, minutes) => {
  if (!timestamp) return false;

  const now = new Date();
  const time = parseBackendTimestamp(timestamp);

  if (!time) return false;

  const diffInMinutes = Math.floor((now - time) / (1000 * 60));
  return diffInMinutes <= minutes;
};

/**
 * Format time for input fields (datetime-local)
 * @param {Date|string} date - Date object or timestamp
 * @returns {string} - Formatted string for datetime-local input
 */
export const formatForDateTimeInput = (date) => {
  const dateObj = date instanceof Date ? date : parseBackendTimestamp(date);
  if (!dateObj) return "";

  // Convert to local time for input field
  const localDate = new Date(
    dateObj.getTime() - dateObj.getTimezoneOffset() * 60000
  );
  return localDate.toISOString().slice(0, 16);
};
