import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { mockUsers } from '../../utils/mockData';

// Get user from localStorage
const userJSON = localStorage.getItem('user');
const user = userJSON && userJSON !== 'undefined' ? JSON.parse(userJSON) : null;
const token = localStorage.getItem('token');

// Mock authentication functions
const mockAuth = {
  login: (credentials) => {
    return new Promise((resolve, reject) => {
      // Simulate API delay
      setTimeout(() => {
        // Find user with matching email
        const user = mockUsers.find(u => u.email === credentials.email);
        
        if (!user) {
          reject({ message: 'User not found. Please check your email address.' });
          return;
        }
        
        // In a real app, we would check the password hash
        // For mock data, we'll accept any password for demo users
        if (credentials.email === 'farmer@example.com' || 
            credentials.email === 'expert@example.com' ||
            credentials.password === 'password') {
          
          // Generate a mock token
          const token = `mock-token-${Date.now()}`;
          
          resolve({
            user,
            token
          });
        } else {
          reject({ message: 'Invalid credentials. Please check your email and password.' });
        }
      }, 800); // Simulate network delay
    });
  },
  
  register: (userData) => {
    return new Promise((resolve, reject) => {
      // Simulate API delay
      setTimeout(() => {
        // Check if email already exists
        const existingUser = mockUsers.find(u => u.email === userData.email);
        
        if (existingUser) {
          reject({ message: 'Email already exists. Please use a different email address.' });
          return;
        }
        
        // Create new user
        const newUser = {
          id: `user${Date.now()}`,
          name: `${userData.firstName} ${userData.lastName}`,
          email: userData.email,
          role: userData.role || 'farmer',
          avatar: `https://randomuser.me/api/portraits/${userData.gender === 'female' ? 'women' : 'men'}/${Math.floor(Math.random() * 100)}.jpg`,
          ...userData
        };
        
        // Generate a mock token
        const token = `mock-token-${Date.now()}`;
        
        resolve({
          user: newUser,
          token
        });
      }, 1000); // Simulate network delay
    });
  },
  
  getProfile: () => {
    return new Promise((resolve, reject) => {
      // Simulate API delay
      setTimeout(() => {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        
        if (storedUser) {
          resolve(storedUser);
        } else {
          reject({ message: 'User not found. Please login again.' });
        }
      }, 500); // Simulate network delay
    });
  },
  
  updateProfile: (profileData) => {
    return new Promise((resolve, reject) => {
      // Simulate API delay
      setTimeout(() => {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        
        if (!storedUser) {
          reject({ message: 'User not found. Please login again.' });
          return;
        }
        
        // Update user data
        const updatedUser = {
          ...storedUser,
          ...profileData
        };
        
        resolve({
          user: updatedUser
        });
      }, 800); // Simulate network delay
    });
  }
};

// Register user
export const register = createAsyncThunk(
  'auth/register',
  async (userData, thunkAPI) => {
    try {
      const response = await mockAuth.register(userData);
      
      if (response) {
        localStorage.setItem('user', JSON.stringify(response.user));
        localStorage.setItem('token', response.token);
      }
      
      return response;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message || 'Registration failed');
    }
  }
);

// Login user
export const login = createAsyncThunk(
  'auth/login',
  async (userData, thunkAPI) => {
    try {
      const response = await mockAuth.login(userData);
      
      if (response) {
        localStorage.setItem('user', JSON.stringify(response.user));
        localStorage.setItem('token', response.token);
      }
      
      return response;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message || 'Login failed');
    }
  }
);

// Get user profile
export const getProfile = createAsyncThunk(
  'auth/getProfile',
  async (_, thunkAPI) => {
    try {
      const response = await mockAuth.getProfile();
      return response;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message || 'Failed to get profile');
    }
  }
);

// Update user profile
export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (profileData, thunkAPI) => {
    try {
      const response = await mockAuth.updateProfile(profileData);
      
      if (response) {
        localStorage.setItem('user', JSON.stringify(response.user));
      }
      
      return response;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message || 'Failed to update profile');
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