import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Get all posts with pagination and filters
export const getPosts = createAsyncThunk(
  'posts/getPosts',
  async (params, thunkAPI) => {
    try {
      // Build query string from params
      const queryParams = new URLSearchParams();
      
      if (params) {
        Object.keys(params).forEach(key => {
          if (params[key] !== undefined && params[key] !== null) {
            queryParams.append(key, params[key]);
          }
        });
      }
      
      const response = await axios.get(`${API_URL}/posts?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get single post
export const getPost = createAsyncThunk(
  'posts/getPost',
  async (postId, thunkAPI) => {
    try {
      const response = await axios.get(`${API_URL}/posts/${postId}`);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Create new post
export const createPost = createAsyncThunk(
  'posts/createPost',
  async (postData, thunkAPI) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.post(`${API_URL}/posts`, postData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Update post
export const updatePost = createAsyncThunk(
  'posts/updatePost',
  async ({ postId, postData }, thunkAPI) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.put(`${API_URL}/posts/${postId}`, postData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Delete post
export const deletePost = createAsyncThunk(
  'posts/deletePost',
  async (postId, thunkAPI) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.delete(`${API_URL}/posts/${postId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      return { postId, message: response.data.message };
    } catch (error) {
      const message = error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Add comment to post
export const addComment = createAsyncThunk(
  'posts/addComment',
  async ({ postId, commentData }, thunkAPI) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.post(`${API_URL}/posts/${postId}/comments`, commentData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Toggle like on post
export const toggleLike = createAsyncThunk(
  'posts/toggleLike',
  async (postId, thunkAPI) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.post(`${API_URL}/posts/${postId}/like`, {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      return { postId, message: response.data.message };
    } catch (error) {
      const message = error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

const initialState = {
  posts: [],
  post: null,
  pagination: {
    page: 1,
    per_page: 10,
    total_pages: 0,
    total_items: 0
  },
  isLoading: false,
  isSuccess: false,
  isError: false,
  message: '',
};

export const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = '';
    },
    clearPost: (state) => {
      state.post = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get Posts
      .addCase(getPosts.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getPosts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.posts = action.payload.posts;
        state.pagination = action.payload.pagination;
      })
      .addCase(getPosts.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Get Post
      .addCase(getPost.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getPost.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.post = action.payload;
      })
      .addCase(getPost.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Create Post
      .addCase(createPost.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createPost.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.posts.unshift(action.payload.post);
      })
      .addCase(createPost.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Update Post
      .addCase(updatePost.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updatePost.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.post = action.payload.post;
        state.posts = state.posts.map(post => 
          post.post_id === action.payload.post.post_id ? action.payload.post : post
        );
      })
      .addCase(updatePost.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Delete Post
      .addCase(deletePost.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deletePost.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.posts = state.posts.filter(post => post.post_id !== action.payload.postId);
        if (state.post && state.post.post_id === action.payload.postId) {
          state.post = null;
        }
      })
      .addCase(deletePost.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Add Comment
      .addCase(addComment.fulfilled, (state, action) => {
        if (state.post) {
          if (!state.post.comments) {
            state.post.comments = [];
          }
          state.post.comments.push(action.payload.comment);
        }
      })
      // Toggle Like
      .addCase(toggleLike.fulfilled, (state, action) => {
        const { postId, message } = action.payload;
        
        // Update like count in post detail
        if (state.post && state.post.post_id === postId) {
          if (message.includes('liked')) {
            state.post.like_count = (state.post.like_count || 0) + 1;
          } else {
            state.post.like_count = Math.max((state.post.like_count || 0) - 1, 0);
          }
        }
        
        // Update like count in posts list
        state.posts = state.posts.map(post => {
          if (post.post_id === postId) {
            if (message.includes('liked')) {
              post.like_count = (post.like_count || 0) + 1;
            } else {
              post.like_count = Math.max((post.like_count || 0) - 1, 0);
            }
          }
          return post;
        });
      });
  },
});

export const { reset, clearPost } = postsSlice.actions;
export default postsSlice.reducer;