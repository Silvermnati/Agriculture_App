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
    CHANGE_PASSWORD: '/auth/change-password',
    ACTIVITY_STATS: '/auth/activity-stats'
  },
  POSTS: {
    BASE: '/posts',
    COMMENTS: (postId) => `/posts/${postId}/comments`,
    LIKE: (postId) => `/posts/${postId}/like`
  },
  ARTICLES: {
    BASE: '/articles'
  },
  CROPS: {
    BASE: '/crops',
    USER_CROPS: '/user-crops'
  },
  LOCATIONS: {
    BASE: '/locations',
    COUNTRIES: '/locations/countries',
    STATES: (countryId) => `/locations/states/${countryId}`
  },
  CATEGORIES: {
    BASE: '/categories'
  },
  TAGS: {
    BASE: '/tags'
  },
  REVIEWS: {
    BASE: '/reviews'
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
    BASE: '/uploads'
  },
  PAYMENTS: {
    BASE: '/payments',
    INITIATE: '/payments/initiate',
    CALLBACK: '/payments/callback',
    STATUS: (paymentId) => `/payments/${paymentId}/status`,
    HISTORY: '/payments/history',
    REFUND: (paymentId) => `/payments/${paymentId}/refund`
  },
  NOTIFICATIONS: {
    BASE: '/notifications',
    MARK_READ: '/notifications/mark-read',
    PREFERENCES: '/notifications/preferences',
    HISTORY: '/notifications/history'
  },
  FOLLOW: {
    FOLLOW_USER: (userId) => `/follow/users/${userId}/follow`,
    FOLLOWERS: (userId) => `/follow/users/${userId}/followers`,
    FOLLOWING: (userId) => `/follow/users/${userId}/following`
  },
  COMMENTS: {
    EDIT: (commentId) => `/comments/${commentId}`,
    DELETE: (commentId) => `/comments/${commentId}`,
    EDIT_HISTORY: (commentId) => `/comments/${commentId}/edit-history`
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

// Countries with phone data for international phone number support
export const COUNTRIES_WITH_PHONE_DATA = [
  {
    code: 'US',
    name: 'United States',
    flag: '🇺🇸',
    phoneCode: '+1',
    format: '+1 (XXX) XXX-XXXX',
    pattern: /^\+1\s?\(?\d{3}\)?\s?\d{3}-?\d{4}$/,
    example: '+1 (555) 123-4567'
  },
  {
    code: 'KE',
    name: 'Kenya',
    flag: '🇰🇪',
    phoneCode: '+254',
    format: '+254 XXX XXX XXX',
    pattern: /^\+254\s?[17]\d{8}$/,
    example: '+254 712 345 678'
  },
  {
    code: 'NG',
    name: 'Nigeria',
    flag: '🇳🇬',
    phoneCode: '+234',
    format: '+234 XXX XXX XXXX',
    pattern: /^\+234\s?[789]\d{9}$/,
    example: '+234 803 123 4567'
  },
  {
    code: 'GB',
    name: 'United Kingdom',
    flag: '🇬🇧',
    phoneCode: '+44',
    format: '+44 XXXX XXX XXX',
    pattern: /^\+44\s?[17]\d{9}$/,
    example: '+44 7700 900123'
  },
  {
    code: 'CA',
    name: 'Canada',
    flag: '🇨🇦',
    phoneCode: '+1',
    format: '+1 (XXX) XXX-XXXX',
    pattern: /^\+1\s?\(?\d{3}\)?\s?\d{3}-?\d{4}$/,
    example: '+1 (416) 555-0123'
  },
  {
    code: 'AU',
    name: 'Australia',
    flag: '🇦🇺',
    phoneCode: '+61',
    format: '+61 X XXXX XXXX',
    pattern: /^\+61\s?[2-9]\d{8}$/,
    example: '+61 4 1234 5678'
  },
  {
    code: 'IN',
    name: 'India',
    flag: '🇮🇳',
    phoneCode: '+91',
    format: '+91 XXXXX XXXXX',
    pattern: /^\+91\s?[6-9]\d{9}$/,
    example: '+91 98765 43210'
  },
  {
    code: 'ZA',
    name: 'South Africa',
    flag: '🇿🇦',
    phoneCode: '+27',
    format: '+27 XX XXX XXXX',
    pattern: /^\+27\s?[1-9]\d{8}$/,
    example: '+27 82 123 4567'
  },
  {
    code: 'GH',
    name: 'Ghana',
    flag: '🇬🇭',
    phoneCode: '+233',
    format: '+233 XX XXX XXXX',
    pattern: /^\+233\s?[2-9]\d{8}$/,
    example: '+233 24 123 4567'
  },
  {
    code: 'TZ',
    name: 'Tanzania',
    flag: '🇹🇿',
    phoneCode: '+255',
    format: '+255 XXX XXX XXX',
    pattern: /^\+255\s?[67]\d{8}$/,
    example: '+255 712 345 678'
  },
  {
    code: 'UG',
    name: 'Uganda',
    flag: '🇺🇬',
    phoneCode: '+256',
    format: '+256 XXX XXX XXX',
    pattern: /^\+256\s?[37]\d{8}$/,
    example: '+256 712 345 678'
  },
  {
    code: 'RW',
    name: 'Rwanda',
    flag: '🇷🇼',
    phoneCode: '+250',
    format: '+250 XXX XXX XXX',
    pattern: /^\+250\s?[78]\d{8}$/,
    example: '+250 788 123 456'
  },
  {
    code: 'ET',
    name: 'Ethiopia',
    flag: '🇪🇹',
    phoneCode: '+251',
    format: '+251 XX XXX XXXX',
    pattern: /^\+251\s?[9]\d{8}$/,
    example: '+251 91 123 4567'
  },
  {
    code: 'EG',
    name: 'Egypt',
    flag: '🇪🇬',
    phoneCode: '+20',
    format: '+20 XX XXXX XXXX',
    pattern: /^\+20\s?[1]\d{9}$/,
    example: '+20 10 1234 5678'
  },
  {
    code: 'MA',
    name: 'Morocco',
    flag: '🇲🇦',
    phoneCode: '+212',
    format: '+212 XXX XXX XXX',
    pattern: /^\+212\s?[5-7]\d{8}$/,
    example: '+212 612 345 678'
  },
  {
    code: 'BR',
    name: 'Brazil',
    flag: '🇧🇷',
    phoneCode: '+55',
    format: '+55 XX XXXXX XXXX',
    pattern: /^\+55\s?[1-9]\d{10}$/,
    example: '+55 11 91234 5678'
  },
  {
    code: 'MX',
    name: 'Mexico',
    flag: '🇲🇽',
    phoneCode: '+52',
    format: '+52 XXX XXX XXXX',
    pattern: /^\+52\s?[1-9]\d{9}$/,
    example: '+52 55 1234 5678'
  },
  {
    code: 'AR',
    name: 'Argentina',
    flag: '🇦🇷',
    phoneCode: '+54',
    format: '+54 XXX XXX XXXX',
    pattern: /^\+54\s?[1-9]\d{9}$/,
    example: '+54 11 1234 5678'
  },
  {
    code: 'FR',
    name: 'France',
    flag: '🇫🇷',
    phoneCode: '+33',
    format: '+33 X XX XX XX XX',
    pattern: /^\+33\s?[1-9]\d{8}$/,
    example: '+33 6 12 34 56 78'
  },
  {
    code: 'DE',
    name: 'Germany',
    flag: '🇩🇪',
    phoneCode: '+49',
    format: '+49 XXX XXXXXXX',
    pattern: /^\+49\s?[1-9]\d{10}$/,
    example: '+49 151 12345678'
  },
  {
    code: 'IT',
    name: 'Italy',
    flag: '🇮🇹',
    phoneCode: '+39',
    format: '+39 XXX XXX XXXX',
    pattern: /^\+39\s?[3]\d{9}$/,
    example: '+39 320 123 4567'
  },
  {
    code: 'ES',
    name: 'Spain',
    flag: '🇪🇸',
    phoneCode: '+34',
    format: '+34 XXX XXX XXX',
    pattern: /^\+34\s?[6-9]\d{8}$/,
    example: '+34 612 345 678'
  },
  {
    code: 'NL',
    name: 'Netherlands',
    flag: '🇳🇱',
    phoneCode: '+31',
    format: '+31 X XXXX XXXX',
    pattern: /^\+31\s?[6]\d{8}$/,
    example: '+31 6 1234 5678'
  },
  {
    code: 'BE',
    name: 'Belgium',
    flag: '🇧🇪',
    phoneCode: '+32',
    format: '+32 XXX XX XX XX',
    pattern: /^\+32\s?[4]\d{8}$/,
    example: '+32 470 12 34 56'
  },
  {
    code: 'CH',
    name: 'Switzerland',
    flag: '🇨🇭',
    phoneCode: '+41',
    format: '+41 XX XXX XX XX',
    pattern: /^\+41\s?[7]\d{8}$/,
    example: '+41 76 123 45 67'
  },
  {
    code: 'AT',
    name: 'Austria',
    flag: '🇦🇹',
    phoneCode: '+43',
    format: '+43 XXX XXXXXXX',
    pattern: /^\+43\s?[6]\d{9}$/,
    example: '+43 664 1234567'
  },
  {
    code: 'SE',
    name: 'Sweden',
    flag: '🇸🇪',
    phoneCode: '+46',
    format: '+46 XX XXX XX XX',
    pattern: /^\+46\s?[7]\d{8}$/,
    example: '+46 70 123 45 67'
  },
  {
    code: 'NO',
    name: 'Norway',
    flag: '🇳🇴',
    phoneCode: '+47',
    format: '+47 XXX XX XXX',
    pattern: /^\+47\s?[4-9]\d{7}$/,
    example: '+47 412 34 567'
  },
  {
    code: 'DK',
    name: 'Denmark',
    flag: '🇩🇰',
    phoneCode: '+45',
    format: '+45 XX XX XX XX',
    pattern: /^\+45\s?[2-9]\d{7}$/,
    example: '+45 20 12 34 56'
  },
  {
    code: 'FI',
    name: 'Finland',
    flag: '🇫🇮',
    phoneCode: '+358',
    format: '+358 XX XXX XXXX',
    pattern: /^\+358\s?[4-5]\d{8}$/,
    example: '+358 40 123 4567'
  },
  {
    code: 'PL',
    name: 'Poland',
    flag: '🇵🇱',
    phoneCode: '+48',
    format: '+48 XXX XXX XXX',
    pattern: /^\+48\s?[5-9]\d{8}$/,
    example: '+48 501 234 567'
  },
  {
    code: 'CZ',
    name: 'Czech Republic',
    flag: '🇨🇿',
    phoneCode: '+420',
    format: '+420 XXX XXX XXX',
    pattern: /^\+420\s?[6-7]\d{8}$/,
    example: '+420 601 234 567'
  },
  {
    code: 'HU',
    name: 'Hungary',
    flag: '🇭🇺',
    phoneCode: '+36',
    format: '+36 XX XXX XXXX',
    pattern: /^\+36\s?[2-7]\d{8}$/,
    example: '+36 20 123 4567'
  },
  {
    code: 'RO',
    name: 'Romania',
    flag: '🇷🇴',
    phoneCode: '+40',
    format: '+40 XXX XXX XXX',
    pattern: /^\+40\s?[7]\d{8}$/,
    example: '+40 721 234 567'
  },
  {
    code: 'BG',
    name: 'Bulgaria',
    flag: '🇧🇬',
    phoneCode: '+359',
    format: '+359 XX XXX XXXX',
    pattern: /^\+359\s?[8-9]\d{8}$/,
    example: '+359 87 123 4567'
  },
  {
    code: 'GR',
    name: 'Greece',
    flag: '🇬🇷',
    phoneCode: '+30',
    format: '+30 XXX XXX XXXX',
    pattern: /^\+30\s?[6]\d{9}$/,
    example: '+30 694 123 4567'
  },
  {
    code: 'TR',
    name: 'Turkey',
    flag: '🇹🇷',
    phoneCode: '+90',
    format: '+90 XXX XXX XXXX',
    pattern: /^\+90\s?[5]\d{9}$/,
    example: '+90 532 123 4567'
  },
  {
    code: 'RU',
    name: 'Russia',
    flag: '🇷🇺',
    phoneCode: '+7',
    format: '+7 XXX XXX XXXX',
    pattern: /^\+7\s?[9]\d{9}$/,
    example: '+7 912 345 6789'
  },
  {
    code: 'UA',
    name: 'Ukraine',
    flag: '🇺🇦',
    phoneCode: '+380',
    format: '+380 XX XXX XXXX',
    pattern: /^\+380\s?[6-9]\d{8}$/,
    example: '+380 67 123 4567'
  },
  {
    code: 'CN',
    name: 'China',
    flag: '🇨🇳',
    phoneCode: '+86',
    format: '+86 XXX XXXX XXXX',
    pattern: /^\+86\s?[1]\d{10}$/,
    example: '+86 138 0013 8000'
  },
  {
    code: 'JP',
    name: 'Japan',
    flag: '🇯🇵',
    phoneCode: '+81',
    format: '+81 XX XXXX XXXX',
    pattern: /^\+81\s?[7-9]\d{9}$/,
    example: '+81 90 1234 5678'
  },
  {
    code: 'KR',
    name: 'South Korea',
    flag: '🇰🇷',
    phoneCode: '+82',
    format: '+82 XX XXXX XXXX',
    pattern: /^\+82\s?[1]\d{9}$/,
    example: '+82 10 1234 5678'
  },
  {
    code: 'TH',
    name: 'Thailand',
    flag: '🇹🇭',
    phoneCode: '+66',
    format: '+66 XX XXX XXXX',
    pattern: /^\+66\s?[6-9]\d{8}$/,
    example: '+66 81 234 5678'
  },
  {
    code: 'VN',
    name: 'Vietnam',
    flag: '🇻🇳',
    phoneCode: '+84',
    format: '+84 XX XXX XXXX',
    pattern: /^\+84\s?[3-9]\d{8}$/,
    example: '+84 91 234 5678'
  },
  {
    code: 'PH',
    name: 'Philippines',
    flag: '🇵🇭',
    phoneCode: '+63',
    format: '+63 XXX XXX XXXX',
    pattern: /^\+63\s?[9]\d{9}$/,
    example: '+63 917 123 4567'
  },
  {
    code: 'ID',
    name: 'Indonesia',
    flag: '🇮🇩',
    phoneCode: '+62',
    format: '+62 XXX XXX XXXX',
    pattern: /^\+62\s?[8]\d{9}$/,
    example: '+62 812 345 6789'
  },
  {
    code: 'MY',
    name: 'Malaysia',
    flag: '🇲🇾',
    phoneCode: '+60',
    format: '+60 XX XXX XXXX',
    pattern: /^\+60\s?[1]\d{8}$/,
    example: '+60 12 345 6789'
  },
  {
    code: 'SG',
    name: 'Singapore',
    flag: '🇸🇬',
    phoneCode: '+65',
    format: '+65 XXXX XXXX',
    pattern: /^\+65\s?[6-9]\d{7}$/,
    example: '+65 8123 4567'
  },
  {
    code: 'PK',
    name: 'Pakistan',
    flag: '🇵🇰',
    phoneCode: '+92',
    format: '+92 XXX XXX XXXX',
    pattern: /^\+92\s?[3]\d{9}$/,
    example: '+92 300 123 4567'
  },
  {
    code: 'BD',
    name: 'Bangladesh',
    flag: '🇧🇩',
    phoneCode: '+880',
    format: '+880 XXXX XXXXXX',
    pattern: /^\+880\s?[1]\d{9}$/,
    example: '+880 1712 345678'
  },
  {
    code: 'LK',
    name: 'Sri Lanka',
    flag: '🇱🇰',
    phoneCode: '+94',
    format: '+94 XX XXX XXXX',
    pattern: /^\+94\s?[7]\d{8}$/,
    example: '+94 71 234 5678'
  },
  {
    code: 'NP',
    name: 'Nepal',
    flag: '🇳🇵',
    phoneCode: '+977',
    format: '+977 XXX XXX XXXX',
    pattern: /^\+977\s?[9]\d{9}$/,
    example: '+977 984 123 4567'
  },
  {
    code: 'AF',
    name: 'Afghanistan',
    flag: '🇦🇫',
    phoneCode: '+93',
    format: '+93 XX XXX XXXX',
    pattern: /^\+93\s?[7]\d{8}$/,
    example: '+93 70 123 4567'
  },
  {
    code: 'IR',
    name: 'Iran',
    flag: '🇮🇷',
    phoneCode: '+98',
    format: '+98 XXX XXX XXXX',
    pattern: /^\+98\s?[9]\d{9}$/,
    example: '+98 912 345 6789'
  },
  {
    code: 'IQ',
    name: 'Iraq',
    flag: '🇮🇶',
    phoneCode: '+964',
    format: '+964 XXX XXX XXXX',
    pattern: /^\+964\s?[7]\d{9}$/,
    example: '+964 770 123 4567'
  },
  {
    code: 'SA',
    name: 'Saudi Arabia',
    flag: '🇸🇦',
    phoneCode: '+966',
    format: '+966 XX XXX XXXX',
    pattern: /^\+966\s?[5]\d{8}$/,
    example: '+966 50 123 4567'
  },
  {
    code: 'AE',
    name: 'United Arab Emirates',
    flag: '🇦🇪',
    phoneCode: '+971',
    format: '+971 XX XXX XXXX',
    pattern: /^\+971\s?[5]\d{8}$/,
    example: '+971 50 123 4567'
  },
  {
    code: 'QA',
    name: 'Qatar',
    flag: '🇶🇦',
    phoneCode: '+974',
    format: '+974 XXXX XXXX',
    pattern: /^\+974\s?[3-7]\d{7}$/,
    example: '+974 3312 3456'
  },
  {
    code: 'KW',
    name: 'Kuwait',
    flag: '🇰🇼',
    phoneCode: '+965',
    format: '+965 XXXX XXXX',
    pattern: /^\+965\s?[5-9]\d{7}$/,
    example: '+965 5012 3456'
  },
  {
    code: 'BH',
    name: 'Bahrain',
    flag: '🇧🇭',
    phoneCode: '+973',
    format: '+973 XXXX XXXX',
    pattern: /^\+973\s?[3-9]\d{7}$/,
    example: '+973 3612 3456'
  },
  {
    code: 'OM',
    name: 'Oman',
    flag: '🇴🇲',
    phoneCode: '+968',
    format: '+968 XXXX XXXX',
    pattern: /^\+968\s?[9]\d{7}$/,
    example: '+968 9123 4567'
  },
  {
    code: 'JO',
    name: 'Jordan',
    flag: '🇯🇴',
    phoneCode: '+962',
    format: '+962 X XXXX XXXX',
    pattern: /^\+962\s?[7]\d{8}$/,
    example: '+962 7 9012 3456'
  },
  {
    code: 'LB',
    name: 'Lebanon',
    flag: '🇱🇧',
    phoneCode: '+961',
    format: '+961 XX XXX XXX',
    pattern: /^\+961\s?[3-9]\d{7}$/,
    example: '+961 70 123 456'
  },
  {
    code: 'SY',
    name: 'Syria',
    flag: '🇸🇾',
    phoneCode: '+963',
    format: '+963 XXX XXX XXX',
    pattern: /^\+963\s?[9]\d{8}$/,
    example: '+963 944 567 890'
  },
  {
    code: 'IL',
    name: 'Israel',
    flag: '🇮🇱',
    phoneCode: '+972',
    format: '+972 XX XXX XXXX',
    pattern: /^\+972\s?[5]\d{8}$/,
    example: '+972 50 123 4567'
  },
  {
    code: 'CY',
    name: 'Cyprus',
    flag: '🇨🇾',
    phoneCode: '+357',
    format: '+357 XX XXX XXX',
    pattern: /^\+357\s?[9]\d{7}$/,
    example: '+357 96 123 456'
  },
  {
    code: 'MT',
    name: 'Malta',
    flag: '🇲🇹',
    phoneCode: '+356',
    format: '+356 XXXX XXXX',
    pattern: /^\+356\s?[7-9]\d{7}$/,
    example: '+356 7912 3456'
  }
];

// Validation error messages
export const VALIDATION_ERRORS = {
  REQUIRED_FIELD: 'This field is required',
  INVALID_EMAIL: 'Please enter a valid email address',
  PASSWORD_TOO_SHORT: 'Password must be at least 8 characters long',
  PASSWORD_MISSING_UPPERCASE: 'Password must contain at least one uppercase letter',
  PASSWORD_MISSING_LOWERCASE: 'Password must contain at least one lowercase letter',
  PASSWORD_MISSING_NUMBER: 'Password must contain at least one number',
  PASSWORDS_DONT_MATCH: 'Passwords do not match',
  INVALID_PHONE_FORMAT: 'Please enter a valid phone number for {country}',
  PHONE_FORMAT_EXAMPLE: 'Example: {example}',
  COUNTRY_DETECTION_FAILED: 'Could not detect your country. Please select manually.',
  FIELD_TOO_LONG: 'This field cannot exceed {maxLength} characters',
  FIELD_TOO_SHORT: 'This field must be at least {minLength} characters'
};

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
    MESSAGE: 'Password must be at least 8 characters and include uppercase, lowercase, and numbers',
    REQUIREMENTS: [
      {
        id: 'length',
        text: 'At least 8 characters long',
        validator: (pwd) => pwd.length >= 8
      },
      {
        id: 'uppercase',
        text: 'Contains uppercase letter (A-Z)',
        validator: (pwd) => /[A-Z]/.test(pwd)
      },
      {
        id: 'lowercase',
        text: 'Contains lowercase letter (a-z)',
        validator: (pwd) => /[a-z]/.test(pwd)
      },
      {
        id: 'number',
        text: 'Contains at least one number (0-9)',
        validator: (pwd) => /\d/.test(pwd)
      },
      {
        id: 'special',
        text: 'Contains special character (@$!%*?&)',
        validator: (pwd) => /[@$!%*?&]/.test(pwd),
        optional: true
      }
    ]
  },
  EMAIL: {
    PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    MESSAGE: 'Please enter a valid email address'
  },
  PHONE: {
    PATTERNS: {
      US: /^\+1\s?\(?\d{3}\)?\s?\d{3}-?\d{4}$/,
      KE: /^\+254\s?[17]\d{8}$/,
      NG: /^\+234\s?[789]\d{9}$/,
      GB: /^\+44\s?[17]\d{9}$/,
      CA: /^\+1\s?\(?\d{3}\)?\s?\d{3}-?\d{4}$/,
      AU: /^\+61\s?[2-9]\d{8}$/,
      IN: /^\+91\s?[6-9]\d{9}$/,
      ZA: /^\+27\s?[1-9]\d{8}$/,
      GH: /^\+233\s?[2-9]\d{8}$/,
      TZ: /^\+255\s?[67]\d{8}$/,
      UG: /^\+256\s?[37]\d{8}$/,
      RW: /^\+250\s?[78]\d{8}$/,
      ET: /^\+251\s?[9]\d{8}$/,
      EG: /^\+20\s?[1]\d{9}$/,
      MA: /^\+212\s?[5-7]\d{8}$/,
      BR: /^\+55\s?[1-9]\d{10}$/,
      MX: /^\+52\s?[1-9]\d{9}$/,
      AR: /^\+54\s?[1-9]\d{9}$/,
      FR: /^\+33\s?[1-9]\d{8}$/,
      DE: /^\+49\s?[1-9]\d{10}$/,
      IT: /^\+39\s?[3]\d{9}$/,
      ES: /^\+34\s?[6-9]\d{8}$/,
      NL: /^\+31\s?[6]\d{8}$/,
      BE: /^\+32\s?[4]\d{8}$/,
      CH: /^\+41\s?[7]\d{8}$/,
      AT: /^\+43\s?[6]\d{9}$/,
      SE: /^\+46\s?[7]\d{8}$/,
      NO: /^\+47\s?[4-9]\d{7}$/,
      DK: /^\+45\s?[2-9]\d{7}$/,
      FI: /^\+358\s?[4-5]\d{8}$/,
      PL: /^\+48\s?[5-9]\d{8}$/,
      CZ: /^\+420\s?[6-7]\d{8}$/,
      HU: /^\+36\s?[2-7]\d{8}$/,
      RO: /^\+40\s?[7]\d{8}$/,
      BG: /^\+359\s?[8-9]\d{8}$/,
      GR: /^\+30\s?[6]\d{9}$/,
      TR: /^\+90\s?[5]\d{9}$/,
      RU: /^\+7\s?[9]\d{9}$/,
      UA: /^\+380\s?[6-9]\d{8}$/,
      CN: /^\+86\s?[1]\d{10}$/,
      JP: /^\+81\s?[7-9]\d{9}$/,
      KR: /^\+82\s?[1]\d{9}$/,
      TH: /^\+66\s?[6-9]\d{8}$/,
      VN: /^\+84\s?[3-9]\d{8}$/,
      PH: /^\+63\s?[9]\d{9}$/,
      ID: /^\+62\s?[8]\d{9}$/,
      MY: /^\+60\s?[1]\d{8}$/,
      SG: /^\+65\s?[6-9]\d{7}$/,
      PK: /^\+92\s?[3]\d{9}$/,
      BD: /^\+880\s?[1]\d{9}$/,
      LK: /^\+94\s?[7]\d{8}$/,
      NP: /^\+977\s?[9]\d{9}$/,
      AF: /^\+93\s?[7]\d{8}$/,
      IR: /^\+98\s?[9]\d{9}$/,
      IQ: /^\+964\s?[7]\d{9}$/,
      SA: /^\+966\s?[5]\d{8}$/,
      AE: /^\+971\s?[5]\d{8}$/,
      QA: /^\+974\s?[3-7]\d{7}$/,
      KW: /^\+965\s?[5-9]\d{7}$/,
      BH: /^\+973\s?[3-9]\d{7}$/,
      OM: /^\+968\s?[9]\d{7}$/,
      JO: /^\+962\s?[7]\d{8}$/,
      LB: /^\+961\s?[3-9]\d{7}$/,
      SY: /^\+963\s?[9]\d{8}$/,
      IL: /^\+972\s?[5]\d{8}$/,
      CY: /^\+357\s?[9]\d{7}$/,
      MT: /^\+356\s?[7-9]\d{7}$/
    },
    FORMATS: {
      US: '+1 (XXX) XXX-XXXX',
      KE: '+254 XXX XXX XXX',
      NG: '+234 XXX XXX XXXX',
      GB: '+44 XXXX XXX XXX',
      CA: '+1 (XXX) XXX-XXXX',
      AU: '+61 X XXXX XXXX',
      IN: '+91 XXXXX XXXXX',
      ZA: '+27 XX XXX XXXX',
      GH: '+233 XX XXX XXXX',
      TZ: '+255 XXX XXX XXX',
      UG: '+256 XXX XXX XXX',
      RW: '+250 XXX XXX XXX',
      ET: '+251 XX XXX XXXX',
      EG: '+20 XX XXXX XXXX',
      MA: '+212 XXX XXX XXX',
      BR: '+55 XX XXXXX XXXX',
      MX: '+52 XXX XXX XXXX',
      AR: '+54 XXX XXX XXXX',
      FR: '+33 X XX XX XX XX',
      DE: '+49 XXX XXXXXXX',
      IT: '+39 XXX XXX XXXX',
      ES: '+34 XXX XXX XXX',
      NL: '+31 X XXXX XXXX',
      BE: '+32 XXX XX XX XX',
      CH: '+41 XX XXX XX XX',
      AT: '+43 XXX XXXXXXX',
      SE: '+46 XX XXX XX XX',
      NO: '+47 XXX XX XXX',
      DK: '+45 XX XX XX XX',
      FI: '+358 XX XXX XXXX',
      PL: '+48 XXX XXX XXX',
      CZ: '+420 XXX XXX XXX',
      HU: '+36 XX XXX XXXX',
      RO: '+40 XXX XXX XXX',
      BG: '+359 XX XXX XXXX',
      GR: '+30 XXX XXX XXXX',
      TR: '+90 XXX XXX XXXX',
      RU: '+7 XXX XXX XXXX',
      UA: '+380 XX XXX XXXX',
      CN: '+86 XXX XXXX XXXX',
      JP: '+81 XX XXXX XXXX',
      KR: '+82 XX XXXX XXXX',
      TH: '+66 XX XXX XXXX',
      VN: '+84 XX XXX XXXX',
      PH: '+63 XXX XXX XXXX',
      ID: '+62 XXX XXX XXXX',
      MY: '+60 XX XXX XXXX',
      SG: '+65 XXXX XXXX',
      PK: '+92 XXX XXX XXXX',
      BD: '+880 XXXX XXXXXX',
      LK: '+94 XX XXX XXXX',
      NP: '+977 XXX XXX XXXX',
      AF: '+93 XX XXX XXXX',
      IR: '+98 XXX XXX XXXX',
      IQ: '+964 XXX XXX XXXX',
      SA: '+966 XX XXX XXXX',
      AE: '+971 XX XXX XXXX',
      QA: '+974 XXXX XXXX',
      KW: '+965 XXXX XXXX',
      BH: '+973 XXXX XXXX',
      OM: '+968 XXXX XXXX',
      JO: '+962 X XXXX XXXX',
      LB: '+961 XX XXX XXX',
      SY: '+963 XXX XXX XXX',
      IL: '+972 XX XXX XXXX',
      CY: '+357 XX XXX XXX',
      MT: '+356 XXXX XXXX'
    }
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