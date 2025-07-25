/**
 * User Data Adapter
 * Handles transformation between backend user data structure and frontend profile structure
 */

/**
 * Transform backend user data to frontend profile structure
 * @param {Object} backendUser - User data from backend
 * @returns {Object} - Transformed user data for frontend
 */
export const transformBackendUserToProfile = (backendUser) => {
  if (!backendUser) return null;

  return {
    // Core fields (exist in database)
    id: backendUser.user_id || backendUser.id,
    email: backendUser.email,
    first_name: backendUser.first_name,
    last_name: backendUser.last_name,
    role: backendUser.role,
    bio: backendUser.bio || '',
    
    // Media fields (exist in database)
    avatar_url: backendUser.avatar_url,
    cover_image_url: backendUser.cover_image_url,
    
    // Contact information (exist in database)
    phone: backendUser.phone_number,
    whatsapp: backendUser.whatsapp_number,
    is_phone_verified: backendUser.is_phone_verified || false,
    
    // Location (using simple fields that exist in database)
    location: {
      city: backendUser.city || '',
      country: backendUser.country || ''
    },
    
    // Farming information (exist in database)
    farm_size: backendUser.farm_size,
    farm_size_unit: backendUser.farm_size_unit || 'hectares',
    farming_experience: backendUser.farming_experience,
    farming_type: backendUser.farming_type,
    
    // Language (exists in database)
    primary_language: backendUser.primary_language || 'en',
    
    // Expert profile and expertise (exist in database)
    expert_profile: backendUser.expert_profile || null,
    expertise: backendUser.expertise || [],
    
    // Status and timestamps (exist in database)
    is_verified: backendUser.is_verified || false,
    is_active: backendUser.is_active !== false,
    created_at: backendUser.join_date || backendUser.created_at,
    updated_at: backendUser.updated_at,
    last_login: backendUser.last_login
  };
};

/**
 * Transform frontend profile data to backend user structure for updates
 * @param {Object} profileData - Profile data from frontend
 * @returns {Object} - Transformed data for backend
 */
export const transformProfileToBackendUser = (profileData) => {
  if (!profileData) return null;

  const backendData = {
    first_name: profileData.first_name,
    last_name: profileData.last_name,
    bio: profileData.bio,
    phone_number: profileData.phone,
    farm_size: profileData.farm_size,
    farm_size_unit: profileData.farm_size_unit,
    farming_experience: profileData.farming_experience,
    farming_type: profileData.farming_type
  };

  // Handle location transformation - use simple fields for now
  if (profileData.location) {
    if (profileData.location.city) {
      backendData.city = profileData.location.city;
    }
    if (profileData.location.country) {
      backendData.country = profileData.location.country;
    }
  }

  // Handle social links (might need to be stored as JSON in backend)
  if (profileData.social_links) {
    backendData.social_links = profileData.social_links;
  }

  // Handle crops grown (might need to be stored as array in backend)
  if (profileData.crops_grown && profileData.crops_grown.length > 0) {
    backendData.crops_grown = profileData.crops_grown;
  }

  // Handle additional fields
  if (profileData.gender) {
    backendData.gender = profileData.gender;
  }

  if (profileData.date_of_birth) {
    backendData.date_of_birth = profileData.date_of_birth;
  }

  // Remove undefined values
  Object.keys(backendData).forEach(key => {
    if (backendData[key] === undefined || backendData[key] === '') {
      delete backendData[key];
    }
  });

  return backendData;
};

/**
 * Get default profile structure for new users
 * @param {Object} basicUserData - Basic user data from registration
 * @returns {Object} - Complete profile structure with defaults
 */
export const getDefaultProfileStructure = (basicUserData = {}) => {
  return {
    id: basicUserData.user_id || basicUserData.id || '',
    email: basicUserData.email || '',
    first_name: basicUserData.first_name || '',
    last_name: basicUserData.last_name || '',
    role: basicUserData.role || 'farmer',
    bio: '',
    avatar_url: null,
    cover_image_url: null,
    gender: basicUserData.gender || '',
    phone: basicUserData.phone_number || '',
    date_of_birth: '',
    location: {
      city: basicUserData.city || '',
      country: basicUserData.country || ''
    },
    farm_size: basicUserData.farm_size || '',
    farm_size_unit: basicUserData.farm_size_unit || 'hectares',
    farming_experience: basicUserData.farming_experience || '',
    farming_type: basicUserData.farming_type || '',
    crops_grown: [],
    social_links: {
      website: '',
      linkedin: '',
      twitter: '',
      facebook: ''
    },
    expert_profile: null,
    is_verified: false,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
};

/**
 * Merge user data with profile defaults to ensure all fields exist
 * @param {Object} userData - User data from backend or localStorage
 * @returns {Object} - Complete profile structure
 */
export const ensureCompleteProfile = (userData) => {
  const defaultProfile = getDefaultProfileStructure();
  const transformedUser = transformBackendUserToProfile(userData);
  
  return {
    ...defaultProfile,
    ...transformedUser
  };
};

/**
 * Check if user data needs profile completion
 * @param {Object} userData - User data to check
 * @returns {boolean} - True if profile needs completion
 */
export const needsProfileCompletion = (userData) => {
  if (!userData) return true;
  
  const requiredFields = ['first_name', 'last_name', 'email'];
  const optionalButImportant = ['bio', 'phone'];
  
  // Check required fields
  for (const field of requiredFields) {
    if (!userData[field] || userData[field].trim() === '') {
      return true;
    }
  }
  
  // For farmers, check farming-specific fields
  if (userData.role === 'farmer') {
    const farmingFields = ['farming_type', 'farming_experience'];
    for (const field of farmingFields) {
      if (!userData[field]) {
        return true;
      }
    }
  }
  
  return false;
};

/**
 * Get profile completion percentage
 * @param {Object} userData - User data to analyze
 * @returns {number} - Completion percentage (0-100)
 */
export const getProfileCompletionPercentage = (userData) => {
  if (!userData) return 0;
  
  const allFields = [
    'first_name', 'last_name', 'email', 'bio', 'phone', 'avatar_url',
    'location.city', 'location.country'
  ];
  
  // Add role-specific fields
  if (userData.role === 'farmer') {
    allFields.push('farm_size', 'farming_experience', 'farming_type');
  }
  
  let completedFields = 0;
  
  allFields.forEach(field => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      if (userData[parent] && userData[parent][child]) {
        completedFields++;
      }
    } else {
      if (userData[field] && userData[field] !== '') {
        completedFields++;
      }
    }
  });
  
  return Math.round((completedFields / allFields.length) * 100);
};