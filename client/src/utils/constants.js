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
    POSTS: (communityId) => `/communities/${communityId}/posts`,
    LIKE_POST: (communityId, postId) => `/communities/${communityId}/posts/${postId}/like`,
    POST_COMMENTS: (communityId, postId) => `/communities/${communityId}/posts/${postId}/comments`
  },
  EXPERTS: {
    BASE: '/experts',
    CONSULTATIONS: '/consultations'
  },
  UPLOAD: {
    BASE: '/upload'
  }
};

// Expert specializations
export const EXPERT_SPECIALIZATIONS = [
  'Soil Health',
  'Crop Disease',
  'Pest Management',
  'Irrigation',
  'Organic Farming',
  'Sustainable Agriculture',
  'Plant Nutrition',
  'Seed Technology',
  'Post-Harvest Management',
  'Agricultural Economics',
  'Climate Change Adaptation',
  'Precision Agriculture',
  'Livestock Management',
  'Aquaculture',
  'Agroforestry'
];

// Languages
export const LANGUAGES = [
  'English',
  'Spanish',
  'French',
  'Portuguese',
  'Arabic',
  'Swahili',
  'Amharic',
  'Hausa',
  'Yoruba',
  'Igbo',
  'Mandarin',
  'Hindi',
  'Bengali'
];

// Currencies
export const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling' },
  { code: 'NGN', symbol: '₦', name: 'Nigerian Naira' },
  { code: 'GHS', symbol: '₵', name: 'Ghanaian Cedi' },
  { code: 'ZAR', symbol: 'R', name: 'South African Rand' }
];

// Countries (focusing on agricultural regions and common countries)
export const COUNTRIES = [
  'Afghanistan', 'Albania', 'Algeria', 'Argentina', 'Armenia', 'Australia',
  'Austria', 'Azerbaijan', 'Bahrain', 'Bangladesh', 'Belarus', 'Belgium',
  'Bolivia', 'Bosnia and Herzegovina', 'Brazil', 'Bulgaria', 'Burkina Faso',
  'Cambodia', 'Cameroon', 'Canada', 'Chad', 'Chile', 'China', 'Colombia',
  'Costa Rica', 'Croatia', 'Czech Republic', 'Denmark', 'Dominican Republic',
  'Ecuador', 'Egypt', 'El Salvador', 'Estonia', 'Ethiopia', 'Finland',
  'France', 'Georgia', 'Germany', 'Ghana', 'Greece', 'Guatemala', 'Guinea',
  'Haiti', 'Honduras', 'Hungary', 'Iceland', 'India', 'Indonesia', 'Iran',
  'Iraq', 'Ireland', 'Israel', 'Italy', 'Jamaica', 'Japan', 'Jordan',
  'Kazakhstan', 'Kenya', 'Kuwait', 'Kyrgyzstan', 'Latvia', 'Lebanon',
  'Lithuania', 'Luxembourg', 'Madagascar', 'Malawi', 'Malaysia', 'Mali',
  'Mexico', 'Moldova', 'Mongolia', 'Morocco', 'Mozambique', 'Myanmar',
  'Nepal', 'Netherlands', 'New Zealand', 'Nicaragua', 'Niger', 'Nigeria',
  'North Korea', 'Norway', 'Pakistan', 'Panama', 'Paraguay', 'Peru',
  'Philippines', 'Poland', 'Portugal', 'Romania', 'Russia', 'Rwanda',
  'Saudi Arabia', 'Senegal', 'Serbia', 'Sierra Leone', 'Singapore',
  'Slovakia', 'Slovenia', 'Somalia', 'South Africa', 'South Korea', 'Spain',
  'Sri Lanka', 'Sudan', 'Sweden', 'Switzerland', 'Syria', 'Taiwan',
  'Tajikistan', 'Tanzania', 'Thailand', 'Togo', 'Tunisia', 'Turkey',
  'Turkmenistan', 'Uganda', 'Ukraine', 'United Arab Emirates', 'United Kingdom',
  'United States', 'Uruguay', 'Uzbekistan', 'Venezuela', 'Vietnam',
  'Yemen', 'Zambia', 'Zimbabwe'
];

// Community types
export const COMMUNITY_TYPES = [
  { value: 'Regional', label: 'Regional', description: 'Location-based community' },
  { value: 'Crop-Specific', label: 'Crop-Specific', description: 'Focused on specific crops' },
  { value: 'Urban', label: 'Urban', description: 'Urban farming community' },
  { value: 'Professional', label: 'Professional', description: 'Professional network' }
];

// Common crops for communities and posts
export const COMMON_CROPS = [
  'Corn', 'Wheat', 'Rice', 'Soybeans', 'Coffee', 'Tea', 'Cotton', 'Sugarcane',
  'Tomatoes', 'Potatoes', 'Onions', 'Carrots', 'Lettuce', 'Spinach', 'Beans',
  'Peas', 'Peppers', 'Cucumbers', 'Squash', 'Pumpkins', 'Cabbage', 'Broccoli',
  'Cauliflower', 'Eggplant', 'Okra', 'Sweet Potatoes', 'Cassava', 'Yams',
  'Bananas', 'Plantains', 'Mangoes', 'Avocados', 'Citrus', 'Apples', 'Grapes'
];

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
  },
  COMMUNITY_NAME: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 100,
    MESSAGE: 'Community name must be between 3 and 100 characters'
  },
  DESCRIPTION: {
    MIN_LENGTH: 10,
    MAX_LENGTH: 1000,
    MESSAGE: 'Description must be between 10 and 1000 characters'
  }
};