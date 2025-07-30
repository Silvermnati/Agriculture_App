import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authAPI, expertsAPI, uploadAPI } from '../../utils/api';
import { 
  transformBackendUserToProfile, 
  transformProfileToBackendUser, 
  ensureCompleteProfile 
} from '../../utils/userDataAdapter';
import { updateUserData } from './authSlice';

// Async thunks for profile operations

// Get user profile with extended data
export const getExtendedProfile = createAsyncThunk(
  'profile/getExtendedProfile',
  async (_, thunkAPI) => {
    try {
      const response = await authAPI.getProfile();
      const userData = response.data.success ? response.data.data : response.data;
      return transformBackendUserToProfile(userData);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.error?.message || error.response?.data?.message || 'Failed to get profile'
      );
    }
  }
);

// Update user profile
export const updateUserProfile = createAsyncThunk(
  'profile/updateUserProfile',
  async (profileData, thunkAPI) => {
    try {
      // Transform frontend profile data to backend format
      const backendData = transformProfileToBackendUser(profileData);
      const response = await authAPI.updateProfile(backendData);
      
      // Transform and update localStorage with new user data
      if (response.data && response.data.success && response.data.data?.user) {
        const transformedUser = transformBackendUserToProfile(response.data.data.user);
        const completeProfile = ensureCompleteProfile(transformedUser);
        localStorage.setItem('user', JSON.stringify(completeProfile));
        return { user: completeProfile };
      }
      
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.error?.message || error.response?.data?.message || 'Failed to update profile'
      );
    }
  }
);

// Upload profile picture
export const uploadProfilePicture = createAsyncThunk(
  'profile/uploadProfilePicture',
  async (file, thunkAPI) => {
    try {
      const uploadResponse = await uploadAPI.uploadFile(file);
      const imageUrl = uploadResponse.data.url || uploadResponse.data.file_url;
      
      // Update profile with new avatar URL
      const profileResponse = await authAPI.updateProfile({ 
        avatar_url: imageUrl 
      });
      
      // Update localStorage
      if (profileResponse.data?.user) {
        localStorage.setItem('user', JSON.stringify(profileResponse.data.user));
        
        // Update auth slice with new user data
        thunkAPI.dispatch(updateUserData({ avatar_url: imageUrl }));
      }
      
      return {
        avatar_url: imageUrl,
        user: profileResponse.data?.user
      };
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || 'Failed to upload profile picture'
      );
    }
  }
);

// Change password
export const changePassword = createAsyncThunk(
  'profile/changePassword',
  async (passwordData, thunkAPI) => {
    try {
      const response = await authAPI.changePassword(passwordData);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || 'Failed to change password'
      );
    }
  }
);

// Create expert profile
export const createExpertProfile = createAsyncThunk(
  'profile/createExpertProfile',
  async (expertData, thunkAPI) => {
    try {
      // Upload certification file if provided
      let certificationUrl = null;
      if (expertData.certification_file) {
        const uploadResponse = await uploadAPI.uploadFile(expertData.certification_file);
        certificationUrl = uploadResponse.data.url || uploadResponse.data.file_url;
      }
      
      // Prepare expert profile data
      const profileData = {
        ...expertData,
        certification_url: certificationUrl
      };
      delete profileData.certification_file;
      
      const response = await expertsAPI.createExpertProfile(profileData);
      
      // Update user role in localStorage
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      const updatedUser = {
        ...currentUser,
        role: 'expert',
        expert_profile: response.data
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || 'Failed to create expert profile'
      );
    }
  }
);

// Update expert profile
export const updateExpertProfile = createAsyncThunk(
  'profile/updateExpertProfile',
  async ({ expertId, expertData }, thunkAPI) => {
    try {
      // Upload new certification file if provided
      let certificationUrl = expertData.certification_url;
      if (expertData.certification_file) {
        const uploadResponse = await uploadAPI.uploadFile(expertData.certification_file);
        certificationUrl = uploadResponse.data.url || uploadResponse.data.file_url;
      }
      
      // Prepare expert profile data
      const profileData = {
        ...expertData,
        certification_url: certificationUrl
      };
      delete profileData.certification_file;
      
      const response = await expertsAPI.updateExpertProfile(expertId, profileData);
      
      // Update localStorage
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      const updatedUser = {
        ...currentUser,
        expert_profile: response.data
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || 'Failed to update expert profile'
      );
    }
  }
);

// Get profile settings
export const getProfileSettings = createAsyncThunk(
  'profile/getProfileSettings',
  async (_, thunkAPI) => {
    try {
      // This would be a separate API endpoint in a real app
      // For now, return default settings
      return {
        notifications: {
          email_notifications: true,
          push_notifications: true,
          community_updates: true,
          consultation_reminders: true,
          marketing_emails: false
        },
        privacy: {
          profile_visibility: 'public',
          show_email: false,
          show_location: true,
          show_farming_details: true,
          show_phone: false
        },
        preferences: {
          language: 'English',
          timezone: 'UTC',
          currency: 'USD',
          theme: 'light'
        }
      };
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || 'Failed to get settings'
      );
    }
  }
);

// Update profile settings
export const updateProfileSettings = createAsyncThunk(
  'profile/updateProfileSettings',
  async (settings, thunkAPI) => {
    try {
      // This would be a separate API endpoint in a real app
      // For now, just return the settings
      return settings;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || 'Failed to update settings'
      );
    }
  }
);

// Get activity stats
export const getActivityStats = createAsyncThunk(
  'profile/getActivityStats',
  async (_, thunkAPI) => {
    try {
      const response = await authAPI.getActivityStats();
      return response.data.success ? response.data.data : response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.error?.message || error.response?.data?.message || 'Failed to get activity stats'
      );
    }
  }
);

// Get recent activity
export const getRecentActivity = createAsyncThunk(
  'profile/getRecentActivity',
  async (_, thunkAPI) => {
    try {
      // This would be a separate API endpoint in a real app
      // For now, return mock data
      return [
        {
          id: '1',
          type: 'post',
          title: 'Created a new post',
          description: 'Best practices for organic tomato farming',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          link: '/posts/1'
        },
        {
          id: '2',
          type: 'community_join',
          title: 'Joined a community',
          description: 'Organic Farming Community',
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          link: '/communities/1'
        },
        {
          id: '3',
          type: 'consultation',
          title: 'Consultation completed',
          description: 'Soil health assessment with Dr. Smith',
          timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || 'Failed to get recent activity'
      );
    }
  }
);

const initialState = {
  // Profile data
  profile: null,
  expertProfile: null,
  settings: null,
  activityStats: null,
  recentActivity: [],
  
  // UI state
  activeTab: 'overview',
  editMode: false,
  hasUnsavedChanges: false,
  
  // Loading states
  isLoading: false,
  isUpdating: false,
  isUploadingImage: false,
  isCreatingExpert: false,
  isChangingPassword: false,
  isLoadingSettings: false,
  isLoadingStats: false,
  isLoadingActivity: false,
  
  // Error states
  isError: false,
  message: '',
  validationErrors: {},
  
  // Modal states
  showExpertModal: false,
  showPasswordModal: false,
  showDeleteModal: false,
  
  // Form states
  profileForm: {},
  expertForm: {},
  passwordForm: {}
};

export const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    // UI actions
    setActiveTab: (state, action) => {
      state.activeTab = action.payload;
    },
    setEditMode: (state, action) => {
      state.editMode = action.payload;
      if (!action.payload) {
        state.hasUnsavedChanges = false;
        state.profileForm = {};
      }
    },
    setHasUnsavedChanges: (state, action) => {
      state.hasUnsavedChanges = action.payload;
    },
    
    // Modal actions
    setShowExpertModal: (state, action) => {
      state.showExpertModal = action.payload;
      if (!action.payload) {
        state.expertForm = {};
      }
    },

    setShowPasswordModal: (state, action) => {
      state.showPasswordModal = action.payload;
      if (!action.payload) {
        state.passwordForm = {};
      }
    },
    setShowDeleteModal: (state, action) => {
      state.showDeleteModal = action.payload;
    },
    
    // Form actions
    updateProfileForm: (state, action) => {
      state.profileForm = { ...state.profileForm, ...action.payload };
      state.hasUnsavedChanges = true;
    },
    updateExpertForm: (state, action) => {
      state.expertForm = { ...state.expertForm, ...action.payload };
    },
    updatePasswordForm: (state, action) => {
      state.passwordForm = { ...state.passwordForm, ...action.payload };
    },
    

    
    // Error handling
    clearErrors: (state) => {
      state.isError = false;
      state.message = '';
      state.validationErrors = {};
    },
    setValidationErrors: (state, action) => {
      state.validationErrors = action.payload;
    },
    
    // Reset actions
    resetProfileState: (state) => {
      return { ...initialState, profile: state.profile };
    }
  },
  extraReducers: (builder) => {
    builder
      // Get extended profile
      .addCase(getExtendedProfile.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
      })
      .addCase(getExtendedProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.profile = ensureCompleteProfile(action.payload);
        state.expertProfile = action.payload.expert_profile;
      })
      .addCase(getExtendedProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Update user profile
      .addCase(updateUserProfile.pending, (state) => {
        state.isUpdating = true;
        state.isError = false;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.isUpdating = false;
        state.profile = action.payload.user || action.payload;
        state.editMode = false;
        state.hasUnsavedChanges = false;
        state.profileForm = {};
        state.message = 'Profile updated successfully';
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.isUpdating = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Upload profile picture
      .addCase(uploadProfilePicture.pending, (state) => {
        state.isUploadingImage = true;
        state.isError = false;
      })
      .addCase(uploadProfilePicture.fulfilled, (state, action) => {
        state.isUploadingImage = false;
        if (action.payload.user) {
          state.profile = action.payload.user;
        } else if (state.profile) {
          state.profile.avatar_url = action.payload.avatar_url;
        }
        state.message = 'Profile picture updated successfully';
      })
      .addCase(uploadProfilePicture.rejected, (state, action) => {
        state.isUploadingImage = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Change password
      .addCase(changePassword.pending, (state) => {
        state.isChangingPassword = true;
        state.isError = false;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.isChangingPassword = false;
        state.showPasswordModal = false;
        state.passwordForm = {};
        state.message = 'Password changed successfully';
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.isChangingPassword = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Create expert profile
      .addCase(createExpertProfile.pending, (state) => {
        state.isCreatingExpert = true;
        state.isError = false;
      })
      .addCase(createExpertProfile.fulfilled, (state, action) => {
        state.isCreatingExpert = false;
        state.expertProfile = action.payload;
        if (state.profile) {
          state.profile.role = 'expert';
          state.profile.expert_profile = action.payload;
        }
        state.showExpertModal = false;
        state.expertForm = {};
        state.message = 'Expert profile created successfully';
      })
      .addCase(createExpertProfile.rejected, (state, action) => {
        state.isCreatingExpert = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Update expert profile
      .addCase(updateExpertProfile.pending, (state) => {
        state.isUpdating = true;
        state.isError = false;
      })
      .addCase(updateExpertProfile.fulfilled, (state, action) => {
        state.isUpdating = false;
        state.expertProfile = action.payload;
        if (state.profile) {
          state.profile.expert_profile = action.payload;
        }
        state.message = 'Expert profile updated successfully';
      })
      .addCase(updateExpertProfile.rejected, (state, action) => {
        state.isUpdating = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Get profile settings
      .addCase(getProfileSettings.pending, (state) => {
        state.isLoadingSettings = true;
      })
      .addCase(getProfileSettings.fulfilled, (state, action) => {
        state.isLoadingSettings = false;
        state.settings = action.payload;
      })
      .addCase(getProfileSettings.rejected, (state, action) => {
        state.isLoadingSettings = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Update profile settings
      .addCase(updateProfileSettings.pending, (state) => {
        state.isUpdating = true;
      })
      .addCase(updateProfileSettings.fulfilled, (state, action) => {
        state.isUpdating = false;
        state.settings = action.payload;
        state.message = 'Settings updated successfully';
      })
      .addCase(updateProfileSettings.rejected, (state, action) => {
        state.isUpdating = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Get activity stats
      .addCase(getActivityStats.pending, (state) => {
        state.isLoadingStats = true;
      })
      .addCase(getActivityStats.fulfilled, (state, action) => {
        state.isLoadingStats = false;
        state.activityStats = action.payload;
      })
      .addCase(getActivityStats.rejected, (state, action) => {
        state.isLoadingStats = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Get recent activity
      .addCase(getRecentActivity.pending, (state) => {
        state.isLoadingActivity = true;
      })
      .addCase(getRecentActivity.fulfilled, (state, action) => {
        state.isLoadingActivity = false;
        state.recentActivity = action.payload;
      })
      .addCase(getRecentActivity.rejected, (state, action) => {
        state.isLoadingActivity = false;
        state.isError = true;
        state.message = action.payload;
      });
  }
});

export const {
  setActiveTab,
  setEditMode,
  setHasUnsavedChanges,
  setShowExpertModal,
  setShowPasswordModal,
  setShowDeleteModal,
  updateProfileForm,
  updateExpertForm,
  updatePasswordForm,
  clearErrors,
  setValidationErrors,
  resetProfileState
} = profileSlice.actions;

export default profileSlice.reducer;