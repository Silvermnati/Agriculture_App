import { describe, it, expect, vi, beforeEach } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import profileReducer, { getActivityStats } from '../../store/slices/profileSlice';
import { authAPI } from '../../utils/api';

// Mock the API
vi.mock('../../utils/api', () => ({
  authAPI: {
    getActivityStats: vi.fn()
  }
}));

describe('Activity Stats Integration', () => {
  let store;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        profile: profileReducer
      }
    });
    vi.clearAllMocks();
  });

  it('should fetch activity stats successfully', async () => {
    const mockStats = {
      posts_created: 5,
      communities_joined: 3,
      comments_made: 10,
      likes_received: 25,
      consultations_given: 2,
      profile_views: 100
    };

    authAPI.getActivityStats.mockResolvedValue({
      data: {
        success: true,
        data: mockStats
      }
    });

    await store.dispatch(getActivityStats());

    const state = store.getState().profile;
    expect(state.activityStats).toEqual(mockStats);
    expect(state.isLoadingStats).toBe(false);
    expect(state.isError).toBe(false);
  });

  it('should handle API errors gracefully', async () => {
    const errorMessage = 'Failed to get activity stats';
    
    authAPI.getActivityStats.mockRejectedValue({
      response: {
        data: {
          message: errorMessage
        }
      }
    });

    await store.dispatch(getActivityStats());

    const state = store.getState().profile;
    expect(state.activityStats).toBeNull();
    expect(state.isLoadingStats).toBe(false);
    expect(state.isError).toBe(true);
    expect(state.message).toBe(errorMessage);
  });

  it('should set loading state correctly during API call', () => {
    authAPI.getActivityStats.mockImplementation(() => new Promise(() => {})); // Never resolves

    store.dispatch(getActivityStats());

    const state = store.getState().profile;
    expect(state.isLoadingStats).toBe(true);
  });

  it('should handle response without success flag', async () => {
    const mockStats = {
      posts_created: 3,
      communities_joined: 1,
      comments_made: 5,
      likes_received: 15,
      profile_views: 50
    };

    authAPI.getActivityStats.mockResolvedValue({
      data: mockStats // Direct data without success wrapper
    });

    await store.dispatch(getActivityStats());

    const state = store.getState().profile;
    expect(state.activityStats).toEqual(mockStats);
    expect(state.isLoadingStats).toBe(false);
  });
});