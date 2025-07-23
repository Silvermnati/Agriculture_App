import React, { useState, useRef } from 'react';
import { Camera, User, Upload } from 'lucide-react';
import LoadingSpinner from '../common/LoadingSpinner/LoadingSpinner';
import './ProfilePicture.css';

const ProfilePicture = ({ 
  imageUrl, 
  userName, 
  size = 'medium', 
  editable = false, 
  onImageChange,
  isUploading = false,
  className = ''
}) => {
  const [imageError, setImageError] = useState(false);
  const fileInputRef = useRef(null);

  const sizeClasses = {
    small: 'profile-picture-small',
    medium: 'profile-picture-medium',
    large: 'profile-picture-large'
  };

  const generateInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const handleFileSelect = (event) => {
    const file = event.target.files?.[0];
    if (file && onImageChange) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size must be less than 5MB');
        return;
      }
      
      onImageChange(file);
    }
    
    // Reset input value to allow selecting the same file again
    if (event.target) {
      event.target.value = '';
    }
  };

  const handleClick = () => {
    if (editable && !isUploading) {
      fileInputRef.current?.click();
    }
  };

  const renderImage = () => {
    if (isUploading) {
      return (
        <div className="profile-picture-loading">
          <LoadingSpinner size="small" />
        </div>
      );
    }

    if (imageUrl && !imageError) {
      return (
        <img
          src={imageUrl}
          alt={`${userName}'s profile`}
          onError={handleImageError}
          className="profile-picture-image"
        />
      );
    }

    // Default avatar with initials
    return (
      <div className="profile-picture-default">
        <span className="profile-picture-initials">
          {generateInitials(userName)}
        </span>
      </div>
    );
  };

  const renderOverlay = () => {
    if (!editable || isUploading) return null;

    return (
      <div className="profile-picture-overlay">
        <div className="profile-picture-overlay-content">
          <Camera size={size === 'large' ? 24 : 16} />
          <span className="profile-picture-overlay-text">
            {imageUrl && !imageError ? 'Change' : 'Upload'}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className={`profile-picture ${sizeClasses[size]} ${className}`}>
      <div 
        className={`profile-picture-container ${editable ? 'profile-picture-editable' : ''}`}
        onClick={handleClick}
        role={editable ? 'button' : undefined}
        tabIndex={editable ? 0 : undefined}
        onKeyDown={(e) => {
          if (editable && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            handleClick();
          }
        }}
        aria-label={editable ? 'Change profile picture' : undefined}
      >
        {renderImage()}
        {renderOverlay()}
      </div>
      
      {editable && (
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="profile-picture-input"
          aria-hidden="true"
        />
      )}
    </div>
  );
};

export default ProfilePicture;