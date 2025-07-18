import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authAPI } from '../../utils/api';

// Get user from localStorage
const user = JSON.parse(localStorage.getItem('user'));
const token = localStorage.getItem('token');

// Register user
export const register = createAsyncThunk(
  'auth/register',
  async (userData, thunkAPI) => {
    try {
      const response = await authAPI.register(userData);
      
      if (response.data) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
        localStorage.setItem('token', response.data.token);
      }
      
      return response.data;
    } catch (error) {
      // Enhanced error handling with more specific messages
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        const serverMessage = error.response.data?.message || 'Server error';
        
        // Handle specific error codes
        if (error.response.status === 409) {
          return thunkAPI.rejectWithValue('Email already exists. Please use a different email address.');
        } else if (error.response.status === 400) {
          return thunkAPI.rejectWithValue(`Validation error: ${serverMessage}`);
        } else if (error.response.status === 500) {
          return thunkAPI.rejectWithValue('Server error. Please try again later.');
        }
        
        return thunkAPI.rejectWithValue(serverMessage);
      } else if (error.request) {
        // The request was made but no response was received
        return thunkAPI.rejectWithValue('No response from server. Please check your internet connection.');
      } else {
        // Something happened in setting up the request that triggered an Error
        return thunkAPI.rejectWithValue('Error setting up request. Please try again.');
      }
    }
  }
);

// Login user
export const login = createAsyncThunk(
  'auth/login',
  async (userData, thunkAPI) => {
    try {
      const response = await authAPI.login(userData);
      
      if (response.data) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
        localStorage.setItem('token', response.data.token);
      }
      
      return response.data;
    } catch (error) {
      // Enhanced error handling
      if (error.response) {
        const serverMessage = error.response.data?.message || 'Server error';
        
        if (error.response.status === 404) {
          return thunkAPI.rejectWithValue('User not found. Please check your email address.');
        } else if (error.response.status === 401) {
          return thunkAPI.rejectWithValue('Invalid credentials. Please check your email and password.');
        } else if (error.response.status === 500) {
          return thunkAPI.rejectWithValue('Server error. Please try again later.');
        }
        
        return thunkAPI.rejectWithValue(serverMessage);
      } else if (error.request) {
        return thunkAPI.rejectWithValue('No response from server. Please check your internet connection.');
      } else {
        return thunkAPI.rejectWithValue('Error setting up request. Please try again.');
      }
    }
  }
);

// Get user profile
export const getProfile = createAsyncThunk(
  'auth/getProfile',
  async (_, thunkAPI) => {
    try {
      const response = await authAPI.getProfile();
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Update user profile
export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (profileData, thunkAPI) => {
    try {
      const response = await authAPI.updateProfile(profileData);
      
      if (response.data) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
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