// Enhanced user profile data models and TypeScript interfaces

export interface Location {
  city?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
}

export interface UserProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  avatar_url?: string;
  bio?: string;
  role: 'farmer' | 'expert' | 'supplier' | 'researcher' | 'student';
  gender?: 'male' | 'female' | 'other';
  location?: Location;
  phone?: string;
  date_of_birth?: string;
  
  // Role-specific fields
  farm_size?: number;
  farm_size_unit?: 'hectares' | 'acres' | 'square_meters';
  farming_experience?: number;
  farming_type?: string;
  crops_grown?: string[];
  
  // Expert-specific fields
  expert_profile?: ExpertProfile;
  
  // Social links
  social_links?: {
    website?: string;
    linkedin?: string;
    twitter?: string;
    facebook?: string;
  };
  
  // Timestamps
  created_at: string;
  updated_at: string;
}

export interface ExpertProfile {
  id: string;
  user_id: string;
  title: string;
  specializations: string[];
  certification?: string;
  certification_url?: string;
  education?: string;
  years_experience: number;
  hourly_rate: number;
  currency: string;
  availability_status: 'available' | 'busy' | 'unavailable';
  languages_spoken: string[];
  bio?: string;
  rating?: number;
  review_count?: number;
  consultation_count?: number;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProfileSettings {
  notifications: {
    email_notifications: boolean;
    push_notifications: boolean;
    community_updates: boolean;
    consultation_reminders: boolean;
    marketing_emails: boolean;
  };
  privacy: {
    profile_visibility: 'public' | 'private' | 'community_only';
    show_email: boolean;
    show_location: boolean;
    show_farming_details: boolean;
    show_phone: boolean;
  };
  preferences: {
    language: string;
    timezone: string;
    currency: string;
    theme: 'light' | 'dark' | 'auto';
  };
}

export interface ActivityStats {
  posts_created: number;
  communities_joined: number;
  consultations_booked: number;
  consultations_given?: number;
  comments_made: number;
  likes_received: number;
  profile_views: number;
}

export interface RecentActivity {
  id: string;
  type: 'post' | 'comment' | 'community_join' | 'consultation' | 'like';
  title: string;
  description: string;
  timestamp: string;
  link?: string;
}

// Form data interfaces
export interface ProfileUpdateData {
  first_name?: string;
  last_name?: string;
  bio?: string;
  gender?: string;
  location?: Location;
  phone?: string;
  date_of_birth?: string;
  farm_size?: number;
  farm_size_unit?: string;
  farming_experience?: number;
  farming_type?: string;
  crops_grown?: string[];
  social_links?: UserProfile['social_links'];
}

export interface ExpertProfileData {
  title: string;
  specializations: string[];
  certification?: string;
  certification_file?: File;
  education?: string;
  years_experience: number;
  hourly_rate: number;
  currency: string;
  languages_spoken: string[];
  bio?: string;
}

export interface PasswordChangeData {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

export interface ImageCropData {
  x: number;
  y: number;
  width: number;
  height: number;
  scale: number;
  rotation: number;
}

// Component prop interfaces
export interface ProfileTabProps {
  user: UserProfile;
  isLoading?: boolean;
  onUpdate?: (data: ProfileUpdateData) => void;
}

export interface EditFormProps {
  user: UserProfile;
  onSave: (data: ProfileUpdateData) => void;
  onCancel: () => void;
  isLoading: boolean;
  hasUnsavedChanges: boolean;
}

export interface ExpertApplicationProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ExpertProfileData) => void;
  isLoading: boolean;
}

// Validation interfaces
export interface ValidationError {
  field: string;
  message: string;
}

export interface FormValidation {
  isValid: boolean;
  errors: ValidationError[];
}

// API response interfaces
export interface ProfileResponse {
  success: boolean;
  data: UserProfile;
  message?: string;
}

export interface ExpertProfileResponse {
  success: boolean;
  data: ExpertProfile;
  message?: string;
}

export interface SettingsResponse {
  success: boolean;
  data: ProfileSettings;
  message?: string;
}

export interface StatsResponse {
  success: boolean;
  data: ActivityStats;
  message?: string;
}

export interface ActivityResponse {
  success: boolean;
  data: RecentActivity[];
  message?: string;
}