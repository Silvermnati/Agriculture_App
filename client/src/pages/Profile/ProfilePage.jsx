import React from 'react';
import { useSelector } from 'react-redux';
import ProfileDetail from '../../components/Profile/ProfileDetail';
import LoadingSpinner from '../../components/common/LoadingSpinner/LoadingSpinner';
import './Profile.css';

const ProfilePage = () => {
  const { user, isLoading, isError, message } = useSelector((state) => state.auth);

  return (
    <div className="profile-page">
      {isLoading ? (
        <LoadingSpinner text="Loading Profile..." />
      ) : isError ? (
        <div className="error-message">{message}</div>
      ) : user ? (
        <ProfileDetail user={user} />
      ) : (
        <div className="error-message">Please log in to view your profile.</div>
      )}
    </div>
  );
};

export default ProfilePage;