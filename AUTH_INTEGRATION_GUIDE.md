# Authentication Integration Guide

This guide provides step-by-step instructions for integrating the login and register functionality with the real API and testing it.

## Step 1: Update the API Base URL

First, let's update the API base URL in `client/src/utils/api.js` to use the deployed backend URL in production:

```javascript
// client/src/utils/api.js
const API_URL = process.env.NODE_ENV === 'production' 
  ? 'https://agriculture-app-1-u2a6.onrender.com/api'
  : '/api';
```

## Step 2: Update the Auth Slice

Replace the mock authentication functions in `client/src/store/slices/authSlice.js` with real API calls:

```javascript
// client/src/store/slices/authSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authAPI } from '../../utils/api';

// Get user from localStorage
const userJSON = localStorage.getItem('user');
const user = userJSON && userJSON !== 'undefined' ? JSON.parse(userJSON) : null;
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
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || 'Registration failed'
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
      
      if (response.data) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
        localStorage.setItem('token', response.data.token);
      }
      
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || 'Login failed'
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
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || 'Failed to get profile'
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
      
      if (response.data) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || 'Failed to update profile'
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
```

## Step 3: Update the Login Form Component

The LoginForm component already uses the Redux actions, so we don't need to make many changes. However, we should update the demo login functionality to use real credentials:

```javascript
// client/src/components/Auth/LoginForm.jsx
// Update the handleQuickLogin function
const handleQuickLogin = (email) => {
  // For demo purposes, we'll use a predefined password
  const demoData = {
    email,
    password: 'securepassword' // This should match the password in your test database
  };
  dispatch(login(demoData));
};
```

## Step 4: Update the Register Form Component

The RegisterForm component also already uses the Redux actions, so we don't need to make many changes. However, we should ensure the form data structure matches what the backend expects:

```javascript
// client/src/components/Auth/RegisterForm.jsx
// In the handleSubmit function, ensure the data structure matches the backend expectations
const handleSubmit = (e) => {
  e.preventDefault();
  
  if (formData.password !== formData.confirmPassword) {
    setPasswordMatch(false);
    return;
  }
  
  // Remove confirmPassword before sending to API
  const { confirmPassword, ...registerData } = formData;
  
  // Ensure farm_size is a number if provided
  if (registerData.farm_size) {
    registerData.farm_size = parseFloat(registerData.farm_size);
  }
  
  // Ensure farming_experience is a number if provided
  if (registerData.farming_experience) {
    registerData.farming_experience = parseInt(registerData.farming_experience, 10);
  }
  
  dispatch(register(registerData));
};
```

## Step 5: Set Up Development Proxy

To test the integration in development, set up a proxy in your Vite configuration:

```javascript
// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://agriculture-app-1-u2a6.onrender.com',
        changeOrigin: true,
      },
    },
  },
});
```

## Step 6: Test the Integration

Now let's test the integration to ensure everything works correctly:

### Testing Login

1. Start your development server:
   ```bash
   cd client
   npm run dev
   ```

2. Navigate to the login page in your browser.

3. Try logging in with one of the test accounts:
   - Email: `farmer@example.com`
   - Password: `securepassword`

4. Check the browser's developer tools Network tab to see the API request and response.

5. Verify that you're redirected to the home page after successful login.

### Testing Registration

1. Navigate to the register page in your browser.

2. Fill out the registration form with test data:
   - Email: `testuser@example.com`
   - Password: `SecurePassword123`
   - First Name: `Test`
   - Last Name: `User`
   - Role: `farmer`
   - Other fields as appropriate

3. Submit the form and check the browser's developer tools Network tab to see the API request and response.

4. Verify that you're redirected to the home page after successful registration.

### Testing Error Handling

1. Try logging in with incorrect credentials:
   - Email: `farmer@example.com`
   - Password: `wrongpassword`

2. Verify that an error message is displayed.

3. Try registering with an email that already exists:
   - Email: `farmer@example.com`
   - Other fields as appropriate

4. Verify that an error message is displayed.

## Step 7: Troubleshooting Common Issues

### CORS Issues

If you encounter CORS issues, ensure that your backend has CORS properly configured to allow requests from your frontend domain.

### Authentication Token Issues

If you're having issues with authentication tokens:

1. Check that the token is being stored correctly in localStorage.
2. Verify that the token is being included in the Authorization header for API requests.
3. Check that the token format matches what the backend expects (e.g., `Bearer <token>`).

### API Response Format Issues

If the API response format doesn't match what your frontend expects:

1. Use console.log to inspect the API response structure.
2. Update your Redux thunks to handle the actual response format.

## Conclusion

By following these steps, you should have successfully integrated the login and register functionality with the real API. The key changes were:

1. Updating the API base URL to use the deployed backend URL in production.
2. Replacing the mock authentication functions with real API calls.
3. Ensuring the form data structure matches what the backend expects.
4. Setting up a development proxy for testing.

Remember to test thoroughly to ensure everything works as expected.