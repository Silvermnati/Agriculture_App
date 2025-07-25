import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Edit, Settings, Camera, MapPin, Calendar, Mail, Phone } from 'lucide-react';
import { setEditMode, setActiveTab, uploadProfilePicture } from '../../store/slices/profileSlice';
import ProfilePicture from './ProfilePicture';
import ProfileCompletionIndicator from './ProfileCompletionIndicator';
import Button from '../common/Button/Button';
import './ProfileHeader.css';

const ProfileHeader = ({ user }) => {
  const dispatch = useDispatch();
  const { editMode, isUploadingImage } = useSelector((state) => state.profile);

  const handleEditToggle = () => {
    dispatch(setEditMode(!editMode));
  };

  const handleImageUpload = (file) => {
    dispatch(uploadProfilePicture(file));
  };

  const formatDate = (dateString) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getLocationString = (location) => {
    if (!location) return null;
    const parts = [];
    if (location.city) parts.push(location.city);
    if (location.country) parts.push(location.country);
    return parts.join(', ');
  };

  const getRoleDisplayName = (role) => {
    const roleMap = {
      farmer: 'Farmer',
      expert: 'Agricultural Expert',
      supplier: 'Supplier',
      researcher: 'Researcher',
      student: 'Student'
    };
    return roleMap[role] || role;
  };

  return (
    <div className="profile-header">
      <div className="profile-header-background">
        <div className="profile-header-overlay"></div>
      </div>
      
      <div className="profile-header-content">
        {/* Profile Completion Indicator */}
        <ProfileCompletionIndicator 
          user={user} 
          onEditClick={() => dispatch(setActiveTab('edit'))}
        />
        
        <div className="profile-header-main">
          <div className="profile-picture-section">
            <ProfilePicture
              imageUrl={user?.avatar_url}
              userName={`${user?.first_name || ''} ${user?.last_name || ''}`.trim() || user?.email}
              size="large"
              editable={true}
              onImageChange={handleImageUpload}
              isUploading={isUploadingImage}
            />
            
            <button 
              className="profile-picture-edit-btn"
              onClick={() => document.getElementById('profile-image-input')?.click()}
              disabled={isUploadingImage}
              aria-label="Change profile picture"
            >
              <Camera size={16} />
            </button>
          </div>
          
          <div className="profile-header-info">
            <div className="profile-name-section">
              <h1 className="profile-name">
                {`${user?.first_name || ''} ${user?.last_name || ''}`.trim() || 'User'}
              </h1>
              
              <div className="profile-role">
                <span className={`role-badge role-${user?.role}`}>
                  {getRoleDisplayName(user?.role)}
                </span>
                {user?.expert_profile?.is_verified && (
                  <span className="verified-badge" title="Verified Expert">
                    ✓
                  </span>
                )}
              </div>
            </div>
            
            <div className="profile-meta">
              {user?.location && (
                <div className="profile-meta-item">
                  <MapPin size={16} />
                  <span>{getLocationString(user.location)}</span>
                </div>
              )}
              
              {user?.email && (
                <div className="profile-meta-item">
                  <Mail size={16} />
                  <span>{user.email}</span>
                </div>
              )}
              
              {user?.phone && (
                <div className="profile-meta-item">
                  <Phone size={16} />
                  <span>{user.phone}</span>
                </div>
              )}
              
              {user?.created_at && (
                <div className="profile-meta-item">
                  <Calendar size={16} />
                  <span>Joined {formatDate(user.created_at)}</span>
                </div>
              )}
            </div>
            
            {user?.bio && (
              <div className="profile-bio">
                <p>{user.bio}</p>
              </div>
            )}
          </div>
        </div>
        
        <div className="profile-header-actions">
          <Button
            variant={editMode ? 'secondary' : 'primary'}
            onClick={handleEditToggle}
            icon={<Edit size={16} />}
            className="edit-profile-btn"
          >
            {editMode ? 'Cancel Edit' : 'Edit Profile'}
          </Button>
          
          <Button
            variant="outline"
            onClick={() => dispatch(setActiveTab('settings'))}
            icon={<Settings size={16} />}
            className="settings-btn"
          >
            Settings
          </Button>
        </div>
      </div>
      
      {/* Expert Profile Stats */}
      {user?.role === 'expert' && user?.expert_profile && (
        <div className="expert-stats-bar">
          <div className="expert-stat">
            <span className="stat-value">{user.expert_profile.rating || 0}</span>
            <span className="stat-label">Rating</span>
          </div>
          <div className="expert-stat">
            <span className="stat-value">{user.expert_profile.review_count || 0}</span>
            <span className="stat-label">Reviews</span>
          </div>
          <div className="expert-stat">
            <span className="stat-value">{user.expert_profile.consultation_count || 0}</span>
            <span className="stat-label">Consultations</span>
          </div>
          <div className="expert-stat">
            <span className="stat-value">{user.expert_profile.years_experience || 0}</span>
            <span className="stat-label">Years Experience</span>
          </div>
        </div>
      )}
      
      {/* Farming Profile Stats */}
      {user?.role === 'farmer' && (user?.farm_size || user?.farming_experience) && (
        <div className="farmer-stats-bar">
          {user.farm_size && (
            <div className="farmer-stat">
              <span className="stat-value">
                {user.farm_size} {user.farm_size_unit || 'hectares'}
              </span>
              <span className="stat-label">Farm Size</span>
            </div>
          )}
          {user.farming_experience && (
            <div className="farmer-stat">
              <span className="stat-value">{user.farming_experience}</span>
              <span className="stat-label">Years Experience</span>
            </div>
          )}
          {user.farming_type && (
            <div className="farmer-stat">
              <span className="stat-value">{user.farming_type}</span>
              <span className="stat-label">Farming Type</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProfileHeader;