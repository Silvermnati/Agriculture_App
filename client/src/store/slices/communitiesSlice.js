import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { communitiesAPI } from '../../utils/api';

// Async thunks for community-related API calls
export const getCommunities = createAsyncThunk(
  'communities/getCommunities',
  async (params, thunkAPI) => {
    try {
      const response = await communitiesAPI.getCommunities(params);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || 'Failed to fetch communities'
      );
    }
  }
);

export const getCommunity = createAsyncThunk(
  'communities/getCommunity',
  async (communityId, thunkAPI) => {
    try {
      const response = await communitiesAPI.getCommunity(communityId);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || 'Failed to fetch community'
      );
    }
  }
);

export const createCommunity = createAsyncThunk(
  'communities/createCommunity',
  async (communityData, thunkAPI) => {
    try {
      const response = await communitiesAPI.createCommunity(communityData);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || 'Failed to create community'
      );
    }
  }
);

export const joinCommunity = createAsyncThunk(
  'communities/joinCommunity',
  async (communityId, thunkAPI) => {
    try {
      const response = await communitiesAPI.joinCommunity(communityId);
      return { communityId, ...response.data };
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || 'Failed to join community'
      );
    }
  }
);

export const getCommunityPosts = createAsyncThunk(
  'communities/getCommunityPosts',
  async ({ communityId, params }, thunkAPI) => {
    try {
      const response = await communitiesAPI.getCommunityPosts(communityId, params);
      return { communityId, posts: response.data };
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || 'Failed to fetch community posts'
      );
    }
  }
);

export const createCommunityPost = createAsyncThunk(
  'communities/createCommunityPost',
  async ({ communityId, postData }, thunkAPI) => {
    try {
      const response = await communitiesAPI.createCommunityPost(communityId, postData);
      return { communityId, post: response.data };
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || 'Failed to create post'
      );
    }
  }
);

export const likeCommunityPost = createAsyncThunk(
  'communities/likeCommunityPost',
  async ({ communityId, postId }, thunkAPI) => {
    try {
      const response = await communitiesAPI.likeCommunityPost(communityId, postId);
      return { communityId, postId, ...response.data };
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || 'Failed to like post'
      );
    }
  }
);

export const commentOnCommunityPost = createAsyncThunk(
  'communities/commentOnCommunityPost',
  async ({ communityId, postId, commentData }, thunkAPI) => {
    try {
      const response = await communitiesAPI.commentOnCommunityPost(communityId, postId, commentData);
      return { communityId, postId, comment: response.data };
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || 'Failed to add comment'
      );
    }
  }
);

const initialState = {
  communities: [],
  currentCommunity: null,
  communityPosts: {},
  pagination: {},
  isLoading: false,
  isError: false,
  message: '',
};

export const communitiesSlice = createSlice({
  name: 'communities',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isError = false;
      state.message = '';
    },
    clearCurrentCommunity: (state) => {
      state.currentCommunity = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get Communities
      .addCase(getCommunities.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getCommunities.fulfilled, (state, action) => {
        state.isLoading = false;
        // Ensure we always get an array for communities
        const communities = action.payload.communities || action.payload.data || action.payload;
        state.communities = Array.isArray(communities) ? communities : [];
        state.pagination = action.payload.pagination || {};
      })
      .addCase(getCommunities.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Get Community
      .addCase(getCommunity.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getCommunity.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentCommunity = action.payload;
      })
      .addCase(getCommunity.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Create Community
      .addCase(createCommunity.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createCommunity.fulfilled, (state, action) => {
        state.isLoading = false;
        state.communities.unshift(action.payload);
      })
      .addCase(createCommunity.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Join Community
      .addCase(joinCommunity.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(joinCommunity.fulfilled, (state, action) => {
        state.isLoading = false;
        // Update community membership status
        const communityIndex = state.communities.findIndex(
          c => c.id === action.payload.communityId
        );
        if (communityIndex !== -1) {
          state.communities[communityIndex].is_member = !state.communities[communityIndex].is_member;
          // Update member count
          if (state.communities[communityIndex].is_member) {
            state.communities[communityIndex].member_count += 1;
          } else {
            state.communities[communityIndex].member_count -= 1;
          }
        }
        // Update current community if it's the same
        if (state.currentCommunity && state.currentCommunity.id === action.payload.communityId) {
          state.currentCommunity.is_member = !state.currentCommunity.is_member;
          if (state.currentCommunity.is_member) {
            state.currentCommunity.member_count += 1;
          } else {
            state.currentCommunity.member_count -= 1;
          }
        }
      })
      .addCase(joinCommunity.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Get Community Posts
      .addCase(getCommunityPosts.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getCommunityPosts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.communityPosts[action.payload.communityId] = action.payload.posts;
      })
      .addCase(getCommunityPosts.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Create Community Post
      .addCase(createCommunityPost.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createCommunityPost.fulfilled, (state, action) => {
        state.isLoading = false;
        const { communityId, post } = action.payload;
        if (state.communityPosts[communityId]) {
          state.communityPosts[communityId].unshift(post);
        }
      })
      .addCase(createCommunityPost.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Like Community Post
      .addCase(likeCommunityPost.fulfilled, (state, action) => {
        const { communityId, postId } = action.payload;
        if (state.communityPosts[communityId]) {
          const postIndex = state.communityPosts[communityId].findIndex(p => p.id === postId);
          if (postIndex !== -1) {
            const post = state.communityPosts[communityId][postIndex];
            post.userHasLiked = !post.userHasLiked;
            post.likes += post.userHasLiked ? 1 : -1;
          }
        }
      })
      // Comment on Community Post
      .addCase(commentOnCommunityPost.fulfilled, (state, action) => {
        const { communityId, postId, comment } = action.payload;
        if (state.communityPosts[communityId]) {
          const postIndex = state.communityPosts[communityId].findIndex(p => p.id === postId);
          if (postIndex !== -1) {
            state.communityPosts[communityId][postIndex].comments += 1;
          }
        }
      });
  },
});

export const { reset, clearCurrentCommunity } = communitiesSlice.actions;
export default communitiesSlice.reducer;