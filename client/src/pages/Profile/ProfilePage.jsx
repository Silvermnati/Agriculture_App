import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  getExtendedProfile, 
  getProfileSettings, 
  getActivityStats, 
  getRecentActivity,
  setActiveTab,
  clearErrors
} from '../../store/slices/profileSlice';
import useToast from '../../hooks/useToast';
import ProfileHeader from '../../components/Profile/ProfileHeader';
import ProfileTabs from '../../components/Profile/ProfileTabs';
import OverviewTab from '../../components/Profile/OverviewTab';
import EditProfileTab from '../../components/Profile/EditProfileTab';
import SettingsTab from '../../components/Profile/SettingsTab';
import SecurityTab from '../../components/Profile/SecurityTab';
import ExpertProfileTab from '../../components/Profile/ExpertProfileTab';
import ExpertApplicationModal from '../../components/Profile/ExpertApplicationModal';
import PasswordChangeModal from '../../components/Profile/PasswordChangeModal';
import LoadingSpinner from '../../components/common/LoadingSpinner/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage/ErrorMessage';
import { ToastContainer } from '../../components/common/Toast/Toast';
import './Profile.css';

const ProfilePage = () => {
  const dispatch = useDispatch();
  const toast = useToast();
  
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const {
    profile,
    activeTab,
    editMode,
    hasUnsavedChanges,
    isLoading,
    isError,
    message,
    showExpertModal,

    showPasswordModal,
    settings,
    activityStats,
    recentActivity,
    isLoadingStats,
    isLoadingActivity
  } = useSelector((state) => state.profile);

  useEffect(() => {
    if (isAuthenticated && user) {
      dispatch(getExtendedProfile());
      dispatch(getProfileSettings());
      dispatch(getActivityStats());
      dispatch(getRecentActivity());
    }
  }, [dispatch, isAuthenticated, user]);

  useEffect(() => {
    if (message) {
      if (isError) {
        toast.error(message);
      } else {
        toast.success(message);
      }
      dispatch(clearErrors());
    }
  }, [message, isError, toast, dispatch]);

  // Handle browser back/forward navigation
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const handleTabChange = (tab) => {
    if (hasUnsavedChanges) {
      const confirmLeave = window.confirm(
        'You have unsaved changes. Are you sure you want to leave this tab?'
      );
      if (!confirmLeave) return;
    }
    dispatch(setActiveTab(tab));
  };

  if (!isAuthenticated) {
    return (
      <div className="profile-page">
        <div className="profile-container">
          <ErrorMessage message="Please log in to view your profile." />
        </div>
      </div>
    );
  }

  if (isLoading && !profile) {
    return (
      <div className="profile-page">
        <div className="profile-container">
          <LoadingSpinner text="Loading Profile..." />
        </div>
      </div>
    );
  }

  const currentProfile = profile || user;

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <OverviewTab 
            user={currentProfile}
            stats={activityStats}
            recentActivity={recentActivity}
            isLoadingStats={isLoadingStats}
            isLoadingActivity={isLoadingActivity}
          />
        );
      case 'edit':
        return (
          <EditProfileTab 
            user={currentProfile}
          />
        );
      case 'settings':
        return (
          <SettingsTab 
            user={currentProfile}
            settings={settings}
          />
        );
      case 'security':
        return (
          <SecurityTab 
            user={currentProfile}
          />
        );
      case 'expert':
        return (
          <ExpertProfileTab 
            user={currentProfile}
          />
        );
      default:
        return (
          <OverviewTab 
            user={currentProfile}
            stats={activityStats}
            recentActivity={recentActivity}
            isLoadingStats={isLoadingStats}
            isLoadingActivity={isLoadingActivity}
          />
        );
    }
  };

  return (
    <div className="profile-page">
      <div className="profile-container">
        <ProfileHeader user={currentProfile} />
        
        <ProfileTabs 
          activeTab={activeTab}
          onTabChange={handleTabChange}
          userRole={currentProfile?.role}
          isExpert={currentProfile?.role === 'expert'}
          hasUnsavedChanges={hasUnsavedChanges}
        />
        
        <div className="profile-content">
          {renderActiveTab()}
        </div>
      </div>

      {/* Modals */}
      {showExpertModal && (
        <ExpertApplicationModal />
      )}
      

      
      {showPasswordModal && (
        <PasswordChangeModal />
      )}

      {/* Toast Notifications */}
      <ToastContainer 
        toasts={toast.toasts} 
        removeToast={toast.removeToast} 
      />
    </div>
  );
};

export default ProfilePage;