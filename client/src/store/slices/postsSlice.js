import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { postsAPI } from '../../utils/api';

// Async thunks for posts-related API calls
export const getPosts = createAsyncThunk(
  'posts/getPosts',
  async (params, thunkAPI) => {
    try {
      const response = await postsAPI.getPosts(params);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || 'Failed to fetch posts'
      );
    }
  }
);

export const getPost = createAsyncThunk(
  'posts/getPost',
  async (postId, thunkAPI) => {
    try {
      const response = await postsAPI.getPost(postId);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || 'Failed to fetch post'
      );
    }
  }
);

export const createPost = createAsyncThunk(
  'posts/createPost',
  async (postData, thunkAPI) => {
    try {
      const response = await postsAPI.createPost(postData);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || 'Failed to create post'
      );
    }
  }
);

export const updatePost = createAsyncThunk(
  'posts/updatePost',
  async ({ postId, postData }, thunkAPI) => {
    try {
      const response = await postsAPI.updatePost(postId, postData);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || 'Failed to update post'
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
        error.response?.data?.message || 'Failed to delete post'
      );
    }
  }
);

export const toggleLike = createAsyncThunk(
  'posts/toggleLike',
  async (postId, thunkAPI) => {
    try {
      const response = await postsAPI.toggleLike(postId);
      return { postId, ...response.data };
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || 'Failed to like post'
      );
    }
  }
);

export const addComment = createAsyncThunk(
  'posts/addComment',
  async ({ postId, commentData }, thunkAPI) => {
    try {
      const response = await postsAPI.addComment(postId, commentData);
      return { postId, comment: response.data };
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || 'Failed to add comment'
      );
    }
  }
);

export const getComments = createAsyncThunk(
  'posts/getComments',
  async (postId, thunkAPI) => {
    try {
      const response = await postsAPI.getComments(postId);
      return { postId, comments: response.data };
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || 'Failed to fetch comments'
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
        state.posts = action.payload.posts || action.payload;
        state.pagination = action.payload.pagination || {};
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
        state.posts.unshift(action.payload);
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
        const index = state.posts.findIndex(post => post.id === action.payload.id);
        if (index !== -1) {
          state.posts[index] = action.payload;
        }
        if (state.currentPost && state.currentPost.id === action.payload.id) {
          state.currentPost = action.payload;
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
        state.posts = state.posts.filter(post => post.id !== action.payload);
        if (state.currentPost && state.currentPost.id === action.payload) {
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
        const { postId } = action.payload;
        const postIndex = state.posts.findIndex(post => post.id === postId);
        if (postIndex !== -1) {
          const post = state.posts[postIndex];
          post.userHasLiked = !post.userHasLiked;
          post.likes += post.userHasLiked ? 1 : -1;
        }
        if (state.currentPost && state.currentPost.id === postId) {
          state.currentPost.userHasLiked = !state.currentPost.userHasLiked;
          state.currentPost.likes += state.currentPost.userHasLiked ? 1 : -1;
        }
      })
      // Add Comment
      .addCase(addComment.fulfilled, (state, action) => {
        const { postId, comment } = action.payload;
        if (state.postComments[postId]) {
          state.postComments[postId].push(comment);
        }
        // Update comment count in posts
        const postIndex = state.posts.findIndex(post => post.id === postId);
        if (postIndex !== -1) {
          state.posts[postIndex].comments += 1;
        }
        if (state.currentPost && state.currentPost.id === postId) {
          state.currentPost.comments += 1;
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
