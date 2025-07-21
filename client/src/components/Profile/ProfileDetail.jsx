import React from 'react';
import PropTypes from 'prop-types';
import './ProfileDetail.css';

const ProfileDetail = ({ user }) => {
  return (
    <div className="profile-detail-container">
      <div className="profile-header">
        <img src={user.avatar} alt={user.name} className="profile-avatar" />
        <div className="profile-header-info">
          <h1 className="profile-name">{user.name}</h1>
          <p className="profile-role">{user.role}</p>
        </div>
      </div>
      <div className="profile-content">
        <div className="profile-info-card">
          <h2 className="card-title">Contact Information</h2>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Location:</strong> {user.location}</p>
        </div>
        {user.role === 'farmer' && (
          <div className="profile-info-card">
            <h2 className="card-title">Farm Information</h2>
            <p><strong>Farm Size:</strong> {user.farmSize}</p>
            <p><strong>Farming Experience:</strong> {user.farmingExperience}</p>
            <p><strong>Farming Type:</strong> {user.farmingType}</p>
          </div>
        )}
        {user.role === 'expert' && (
          <div className="profile-info-card">
            <h2 className="card-title">Expert Information</h2>
            <p><strong>Specializations:</strong> {user.specializations.join(', ')}</p>
            <p><strong>Years of Experience:</strong> {user.yearsExperience}</p>
          </div>
        )}
      </div>
    </div>
  );
};

ProfileDetail.propTypes = {
  user: PropTypes.object.isRequired,
};

export default ProfileDetail;
