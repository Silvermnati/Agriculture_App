import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { expertsAPI } from '../../utils/api';

// Async thunks for expert-related API calls
export const getExperts = createAsyncThunk(
  'experts/getExperts',
  async (params, thunkAPI) => {
    try {
      const response = await expertsAPI.getExperts(params);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data);
    }
  }
);

export const getExpert = createAsyncThunk(
  'experts/getExpert',
  async (expertId, thunkAPI) => {
    try {
      const response = await expertsAPI.getExpert(expertId);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data);
    }
  }
);

export const bookConsultation = createAsyncThunk(
  'experts/bookConsultation',
  async (consultationData, thunkAPI) => {
    try {
      const response = await expertsAPI.bookConsultation(consultationData);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data);
    }
  }
);

const initialState = {
  experts: [],
  expert: null,
  pagination: {},
  isLoading: false,
  isError: false,
  message: '',
};

export const expertsSlice = createSlice({
  name: 'experts',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isError = false;
      state.message = '';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getExperts.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getExperts.fulfilled, (state, action) => {
        state.isLoading = false;
        // Ensure we always get an array for experts
        const experts = action.payload.experts || action.payload.data || action.payload;
        state.experts = Array.isArray(experts) ? experts : [];
        state.pagination = action.payload.pagination || {};
      })
      .addCase(getExperts.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        // Provide user-friendly error messages
        const errorMessage = action.payload?.message || action.payload?.error?.message || 'Failed to load experts';
        
        // Handle specific server errors
        if (errorMessage.includes('availability') || errorMessage.includes('filter')) {
          state.message = 'There was an issue with the availability filter. Please try selecting a different filter or refresh the page.';
        } else if (errorMessage.includes('500') || errorMessage.includes('Internal Server Error')) {
          state.message = 'Server is temporarily unavailable. Please try again in a few moments.';
        } else {
          state.message = errorMessage;
        }
      })
      .addCase(getExpert.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getExpert.fulfilled, (state, action) => {
        state.isLoading = false;
        state.expert = action.payload;
      })
      .addCase(getExpert.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload.message;
      })
      .addCase(bookConsultation.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(bookConsultation.fulfilled, (state, action) => {
        state.isLoading = false;
        // Handle success (e.g., show a success message)
      })
      .addCase(bookConsultation.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload.message;
      });
  },
});

export const { reset } = expertsSlice.actions;
export default expertsSlice.reducer;
