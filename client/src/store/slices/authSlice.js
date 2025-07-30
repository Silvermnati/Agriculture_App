import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authAPI } from '../../utils/api';
import { transformBackendUserToProfile, ensureCompleteProfile } from '../../utils/userDataAdapter';

// Get user from localStorage
const userJSON = localStorage.getItem('user');
const rawUser = userJSON && userJSON !== 'undefined' ? JSON.parse(userJSON) : null;
const user = rawUser ? ensureCompleteProfile(rawUser) : null;
const token = localStorage.getItem('token');

// Register user
export const register = createAsyncThunk(
  'auth/register',
  async (userData, thunkAPI) => {
    try {
      const response = await authAPI.register(userData);
      
      if (response.data && response.data.success) {
        // Transform backend user data to frontend profile structure
        const transformedUser = transformBackendUserToProfile(response.data.data.user);
        const completeProfile = ensureCompleteProfile(transformedUser);
        
        localStorage.setItem('user', JSON.stringify(completeProfile));
        localStorage.setItem('token', response.data.data.token);
        
        return {
          user: completeProfile,
          token: response.data.data.token
        };
      }
      
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.error?.message || error.response?.data?.message || 'Registration failed'
      );
    }
  }
);

// Login user
export const login = createAsyncThunk(
  'auth/login',
  async (userData, thunkAPI) => {
    try {
      const response = await authAPI.login(userData);
      
      if (response.data && response.data.success) {
        // Transform backend user data to frontend profile structure
        const transformedUser = transformBackendUserToProfile(response.data.data.user);
        const completeProfile = ensureCompleteProfile(transformedUser);
        
        localStorage.setItem('user', JSON.stringify(completeProfile));
        localStorage.setItem('token', response.data.data.token);
        
        return {
          user: completeProfile,
          token: response.data.data.token
        };
      }
      
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.error?.message || error.response?.data?.message || 'Login failed'
      );
    }
  }
);

// Get user profile
export const getProfile = createAsyncThunk(
  'auth/getProfile',
  async (_, thunkAPI) => {
    try {
      const response = await authAPI.getProfile();
      const userData = response.data.success ? response.data.data : response.data;
      const transformedUser = transformBackendUserToProfile(userData);
      return ensureCompleteProfile(transformedUser);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.error?.message || error.response?.data?.message || 'Failed to get profile'
      );
    }
  }
);

// Update user profile
export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (profileData, thunkAPI) => {
    try {
      const response = await authAPI.updateProfile(profileData);
      
      if (response.data && response.data.success) {
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

// Logout user
export const logout = createAsyncThunk('auth/logout', async () => {
  localStorage.removeItem('user');
  localStorage.removeItem('token');
});

const initialState = {
  user: user || null,
  token: token || null,
  isAuthenticated: !!token,
  isLoading: false,
  isSuccess: false,
  isError: false,
  message: '',
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = '';
    },
  },
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(register.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      })
      // Login
      .addCase(login.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      })
      // Get Profile
      .addCase(getProfile.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.user = action.payload;
      })
      .addCase(getProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Update Profile
      .addCase(updateProfile.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.user = action.payload.user;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      });
  },
});

export const { reset } = authSlice.actions;
export default authSlice.reducer;