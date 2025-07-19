// User roles
export const USER_ROLES = [
  { value: 'farmer', label: 'Farmer' },
  { value: 'expert', label: 'Agricultural Expert' },
  { value: 'supplier', label: 'Supplier' },
  { value: 'researcher', label: 'Researcher' },
  { value: 'student', label: 'Student' }
];

// Farming types
export const FARMING_TYPES = [
  { value: 'organic', label: 'Organic' },
  { value: 'conventional', label: 'Conventional' },
  { value: 'mixed', label: 'Mixed' },
  { value: 'permaculture', label: 'Permaculture' },
  { value: 'biodynamic', label: 'Biodynamic' },
  { value: 'hydroponic', label: 'Hydroponic' },
  { value: 'aquaponic', label: 'Aquaponic' }
];

// Farm size units
export const FARM_SIZE_UNITS = [
  { value: 'hectares', label: 'Hectares' },
  { value: 'acres', label: 'Acres' },
  { value: 'square_meters', label: 'Square Meters' }
];

// Seasons
export const SEASONS = [
  { value: 'spring', label: 'Spring' },
  { value: 'summer', label: 'Summer' },
  { value: 'fall', label: 'Fall' },
  { value: 'winter', label: 'Winter' },
  { value: 'year_round', label: 'Year-round' }
];

// API endpoints
export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    PROFILE: '/auth/profile',
    CHANGE_PASSWORD: '/auth/change-password'
  },
  POSTS: {
    BASE: '/posts',
    COMMENTS: (postId) => `/posts/${postId}/comments`,
    LIKE: (postId) => `/posts/${postId}/like`
  },
  COMMUNITIES: {
    BASE: '/communities',
    JOIN: (communityId) => `/communities/${communityId}/join`,
    POSTS: (communityId) => `/communities/${communityId}/posts`
  },
  EXPERTS: {
    BASE: '/experts',
    CONSULTATIONS: '/consultations'
  }
};

// Form validation
export const VALIDATION = {
  PASSWORD: {
    MIN_LENGTH: 8,
    PATTERN: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/,
    MESSAGE: 'Password must be at least 8 characters and include uppercase, lowercase, and numbers'
  },
  EMAIL: {
    PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    MESSAGE: 'Please enter a valid email address'
  },
  FARM_SIZE: {
    MIN: 0.01,
    MAX: 100000,
    MESSAGE: 'Farm size must be greater than 0'
  },
  FARMING_EXPERIENCE: {
    MIN: 0,
    MAX: 100,
    MESSAGE: 'Farming experience must be between 0 and 100 years'
  },
  NAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 50,
    MESSAGE: 'Name must be between 2 and 50 characters'
  }
};