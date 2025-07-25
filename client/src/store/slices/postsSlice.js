import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { postsAPI } from '../../utils/api';

// Async thunks for posts-related API calls
export const getPosts = createAsyncThunk(
  'posts/getPosts',
  async (params, thunkAPI) => {
    try {
      const response = await postsAPI.getPosts(params);
      return response.data.success ? response.data.data : response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.error?.message || error.response?.data?.message || 'Failed to fetch posts'
      );
    }
  }
);

export const getPost = createAsyncThunk(
  'posts/getPost',
  async (postId, thunkAPI) => {
    try {
      const response = await postsAPI.getPost(postId);
      return response.data.success ? response.data.data : response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.error?.message || error.response?.data?.message || 'Failed to fetch post'
      );
    }
  }
);

export const createPost = createAsyncThunk(
  'posts/createPost',
  async (postData, thunkAPI) => {
    try {
      console.log('Redux createPost thunk called with:', postData);
      const response = await postsAPI.createPost(postData);
      console.log('Redux createPost response:', response);
      return response.data.success ? response.data.data : response.data;
    } catch (error) {
      console.error('Redux createPost error:', error);
      console.error('Error response:', error.response);
      return thunkAPI.rejectWithValue(
        error.response?.data?.error?.message || error.response?.data?.message || error.message || 'Failed to create post'
      );
    }
  }
);

export const updatePost = createAsyncThunk(
  'posts/updatePost',
  async ({ postId, postData }, thunkAPI) => {
    try {
      const response = await postsAPI.updatePost(postId, postData);
      return response.data.success ? response.data.data : response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.error?.message || error.response?.data?.message || 'Failed to update post'
      );
    }
  }
);

export const deletePost = createAsyncThunk(
  'posts/deletePost',
  async (postId, thunkAPI) => {
    try {
      await postsAPI.deletePost(postId);
      return postId;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.error?.message || error.response?.data?.message || 'Failed to delete post'
      );
    }
  }
);

export const toggleLike = createAsyncThunk(
  'posts/toggleLike',
  async (postId, thunkAPI) => {
    try {
      const response = await postsAPI.toggleLike(postId);
      const data = response.data.success ? response.data.data : response.data;
      return { postId, ...data };
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.error?.message || error.response?.data?.message || 'Failed to like post'
      );
    }
  }
);

export const addComment = createAsyncThunk(
  'posts/addComment',
  async ({ postId, commentData }, thunkAPI) => {
    try {
      const response = await postsAPI.addComment(postId, commentData);
      const data = response.data.success ? response.data.data : response.data;
      return { postId, comment: data };
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.error?.message || error.response?.data?.message || 'Failed to add comment'
      );
    }
  }
);

export const getComments = createAsyncThunk(
  'posts/getComments',
  async (postId, thunkAPI) => {
    try {
      const response = await postsAPI.getComments(postId);
      const data = response.data.success ? response.data.data : response.data;
      return { postId, comments: data };
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.error?.message || error.response?.data?.message || 'Failed to fetch comments'
      );
    }
  }
);

const initialState = {
  posts: [],
  currentPost: null,
  postComments: {},
  pagination: {},
  isLoading: false,
  isSuccess: false,
  isError: false,
  message: '',
};

const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = '';
    },
    clearCurrentPost: (state) => {
      state.currentPost = null;
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
        // Handle both array response and object with data property
        if (Array.isArray(action.payload)) {
          state.posts = action.payload;
          state.pagination = {};
        } else {
          state.posts = action.payload.data || action.payload.posts || [];
          state.pagination = action.payload.pagination || {};
        }
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
        state.currentPost = action.payload;
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
        // Handle the post data from the response
        const postData = action.payload.post || action.payload;
        state.posts.unshift(postData);
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
        const postData = action.payload.post || action.payload;
        const index = state.posts.findIndex(post => post.id === postData.id || post.post_id === postData.post_id);
        if (index !== -1) {
          state.posts[index] = postData;
        }
        if (state.currentPost && (state.currentPost.id === postData.id || state.currentPost.post_id === postData.post_id)) {
          state.currentPost = postData;
        }
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
        state.posts = state.posts.filter(post => post.id !== action.payload && post.post_id !== action.payload);
        if (state.currentPost && (state.currentPost.id === action.payload || state.currentPost.post_id === action.payload)) {
          state.currentPost = null;
        }
      })
      .addCase(deletePost.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Toggle Like
      .addCase(toggleLike.fulfilled, (state, action) => {
        const { postId, liked } = action.payload;
        const postIndex = state.posts.findIndex(post => post.id === postId || post.post_id === postId);
        if (postIndex !== -1) {
          const post = state.posts[postIndex];
          post.userHasLiked = liked;
          post.like_count = (post.like_count || 0) + (liked ? 1 : -1);
        }
        if (state.currentPost && (state.currentPost.id === postId || state.currentPost.post_id === postId)) {
          state.currentPost.userHasLiked = liked;
          state.currentPost.like_count = (state.currentPost.like_count || 0) + (liked ? 1 : -1);
        }
      })
      // Add Comment
      .addCase(addComment.fulfilled, (state, action) => {
        const { postId, comment } = action.payload;
        if (state.postComments[postId]) {
          state.postComments[postId].push(comment);
        }
        // Update comment count in posts
        const postIndex = state.posts.findIndex(post => post.id === postId || post.post_id === postId);
        if (postIndex !== -1) {
          state.posts[postIndex].comment_count = (state.posts[postIndex].comment_count || 0) + 1;
        }
        if (state.currentPost && (state.currentPost.id === postId || state.currentPost.post_id === postId)) {
          state.currentPost.comment_count = (state.currentPost.comment_count || 0) + 1;
        }
      })
      // Get Comments
      .addCase(getComments.fulfilled, (state, action) => {
        const { postId, comments } = action.payload;
        state.postComments[postId] = comments;
      });
  },
});

export const { reset, clearCurrentPost } = postsSlice.actions;
export default postsSlice.reducer;
