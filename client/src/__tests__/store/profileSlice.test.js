import { configureStore } from '@reduxjs/toolkit';
import profileReducer, {
  setActiveTab,
  setEditMode,
  setHasUnsavedChanges,
  updateProfileForm,
  clearErrors,
  resetProfileState
} from '../../store/slices/profileSlice';

import { vi } from 'vitest';

// Mock API
vi.mock('../../utils/api', () => ({
  authAPI: {
    getProfile: vi.fn(),
    updateProfile: vi.fn(),
    changePassword: vi.fn()
  },
  expertsAPI: {
    createExpertProfile: vi.fn(),
    updateExpertProfile: vi.fn()
  },
  uploadAPI: {
    uploadFile: vi.fn()
  }
}));

describe('profileSlice', () => {
  let store;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        profile: profileReducer
      }
    });
  });

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const state = store.getState().profile;
      
      expect(state.profile).toBeNull();
      expect(state.activeTab).toBe('overview');
      expect(state.editMode).toBe(false);
      expect(state.hasUnsavedChanges).toBe(false);
      expect(state.isLoading).toBe(false);
      expect(state.isError).toBe(false);
      expect(state.showExpertModal).toBe(false);
    });
  });

  describe('synchronous actions', () => {
    it('should handle setActiveTab', () => {
      store.dispatch(setActiveTab('edit'));
      const state = store.getState().profile;
      
      expect(state.activeTab).toBe('edit');
    });

    it('should handle setEditMode', () => {
      store.dispatch(setEditMode(true));
      let state = store.getState().profile;
      expect(state.editMode).toBe(true);

      store.dispatch(setEditMode(false));
      state = store.getState().profile;
      expect(state.editMode).toBe(false);
      expect(state.hasUnsavedChanges).toBe(false);
    });

    it('should handle setHasUnsavedChanges', () => {
      store.dispatch(setHasUnsavedChanges(true));
      const state = store.getState().profile;
      
      expect(state.hasUnsavedChanges).toBe(true);
    });

    it('should handle updateProfileForm', () => {
      const formData = { first_name: 'John', last_name: 'Doe' };
      store.dispatch(updateProfileForm(formData));
      const state = store.getState().profile;
      
      expect(state.profileForm).toEqual(formData);
      expect(state.hasUnsavedChanges).toBe(true);
    });

    it('should handle clearErrors', () => {
      // First set some error state
      store.dispatch({ 
        type: 'profile/updateUserProfile/rejected', 
        payload: 'Test error' 
      });
      
      let state = store.getState().profile;
      expect(state.isError).toBe(true);
      expect(state.message).toBe('Test error');

      // Clear errors
      store.dispatch(clearErrors());
      state = store.getState().profile;
      
      expect(state.isError).toBe(false);
      expect(state.message).toBe('');
      expect(state.validationErrors).toEqual({});
    });

    it('should handle resetProfileState', () => {
      // Set some state
      store.dispatch(setActiveTab('edit'));
      store.dispatch(setEditMode(true));
      store.dispatch(setHasUnsavedChanges(true));
      
      // Reset state
      store.dispatch(resetProfileState());
      const state = store.getState().profile;
      
      expect(state.activeTab).toBe('overview');
      expect(state.editMode).toBe(false);
      expect(state.hasUnsavedChanges).toBe(false);
    });
  });

  describe('form state management', () => {
    it('should update profile form incrementally', () => {
      store.dispatch(updateProfileForm({ first_name: 'John' }));
      store.dispatch(updateProfileForm({ last_name: 'Doe' }));
      
      const state = store.getState().profile;
      expect(state.profileForm).toEqual({
        first_name: 'John',
        last_name: 'Doe'
      });
    });

    it('should mark as having unsaved changes when form is updated', () => {
      expect(store.getState().profile.hasUnsavedChanges).toBe(false);
      
      store.dispatch(updateProfileForm({ first_name: 'John' }));
      
      expect(store.getState().profile.hasUnsavedChanges).toBe(true);
    });
  });

  describe('modal state management', () => {
    it('should handle expert modal state', () => {
      store.dispatch({ type: 'profile/setShowExpertModal', payload: true });
      expect(store.getState().profile.showExpertModal).toBe(true);
      
      store.dispatch({ type: 'profile/setShowExpertModal', payload: false });
      expect(store.getState().profile.showExpertModal).toBe(false);
    });

    it('should handle image crop modal state', () => {
      store.dispatch({ type: 'profile/setShowImageCropModal', payload: true });
      expect(store.getState().profile.showImageCropModal).toBe(true);
      
      store.dispatch({ type: 'profile/setShowImageCropModal', payload: false });
      expect(store.getState().profile.showImageCropModal).toBe(false);
    });

    it('should handle password modal state', () => {
      store.dispatch({ type: 'profile/setShowPasswordModal', payload: true });
      expect(store.getState().profile.showPasswordModal).toBe(true);
      
      store.dispatch({ type: 'profile/setShowPasswordModal', payload: false });
      expect(store.getState().profile.showPasswordModal).toBe(false);
    });
  });

  describe('validation errors', () => {
    it('should handle validation errors', () => {
      const errors = {
        first_name: 'First name is required',
        email: 'Invalid email format'
      };
      
      store.dispatch({ type: 'profile/setValidationErrors', payload: errors });
      const state = store.getState().profile;
      
      expect(state.validationErrors).toEqual(errors);
    });
  });
});