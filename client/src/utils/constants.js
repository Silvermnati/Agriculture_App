// API URL
export const API_URL = 'http://localhost:5000/api';

// User roles
export const USER_ROLES = {
  FARMER: 'farmer',
  EXPERT: 'expert',
  SUPPLIER: 'supplier',
  RESEARCHER: 'researcher',
  STUDENT: 'student',
  ADMIN: 'admin',
};

// Farming types
export const FARMING_TYPES = [
  { value: 'organic', label: 'Organic' },
  { value: 'conventional', label: 'Conventional' },
  { value: 'mixed', label: 'Mixed' },
  { value: 'subsistence', label: 'Subsistence' },
  { value: 'commercial', label: 'Commercial' },
];

// Seasons
export const SEASONS = [
  { value: 'spring', label: 'Spring' },
  { value: 'summer', label: 'Summer' },
  { value: 'fall', label: 'Fall' },
  { value: 'winter', label: 'Winter' },
  { value: 'year-round', label: 'Year-round' },
];

// Post status options
export const POST_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  ARCHIVED: 'archived',
};

// Community types
export const COMMUNITY_TYPES = [
  { value: 'general', label: 'General' },
  { value: 'crop_specific', label: 'Crop Specific' },
  { value: 'location_based', label: 'Location Based' },
  { value: 'expert_group', label: 'Expert Group' },
];

// Expert availability status
export const AVAILABILITY_STATUS = {
  AVAILABLE: 'available',
  BUSY: 'busy',
  UNAVAILABLE: 'unavailable',
};

// Consultation types
export const CONSULTATION_TYPES = [
  { value: 'video', label: 'Video Call' },
  { value: 'audio', label: 'Audio Call' },
  { value: 'chat', label: 'Chat' },
  { value: 'field_visit', label: 'Field Visit' },
];

// Pagination defaults
export const DEFAULT_PAGE_SIZE = 10;