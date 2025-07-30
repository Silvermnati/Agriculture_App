import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import postsReducer from './slices/postsSlice';
import expertsReducer from './slices/expertsSlice';
import communitiesReducer from './slices/communitiesSlice';
import profileReducer from './slices/profileSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    posts: postsReducer,
    experts: expertsReducer,
    communities: communitiesReducer,
    profile: profileReducer,
  },
});

export default store;