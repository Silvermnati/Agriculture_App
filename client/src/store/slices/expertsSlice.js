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
        state.experts = action.payload.experts;
        state.pagination = action.payload.pagination;
      })
      .addCase(getExperts.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload.message;
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
