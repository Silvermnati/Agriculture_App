import React from 'react';
import PropTypes from 'prop-types';
import { Camera } from 'lucide-react';
import Image from '../common/Image/Image';

const ProfilePicture = ({ 
  imageUrl, 
  userName, 
  size = 'medium', 
  editable = false, 
  onImageChange,
  isUploading = false,
  className = ''
}) => {

  const sizeClasses = {
    small: 'w-10 h-10 text-sm',
    medium: 'w-20 h-20 text-lg',
    large: 'w-32 h-32 text-2xl'
  };

  const borderClasses = {
    small: 'border-2',
    medium: 'border-3',
    large: 'border-4'
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

  const handleFileSelect = (event) => {
    const file = event.target.files?.[0];
    if (file && onImageChange) {
      onImageChange(file);
    }
  };

  const handleClick = () => {
    if (editable && !isUploading) {
      document.getElementById('profile-image-input')?.click();
    }
  };

  const initialsPlaceholder = (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-400 to-green-600 text-white rounded-full">
      <span className="font-semibold">{generateInitials(userName)}</span>
    </div>
  );

  return (
    <div className={`relative rounded-full overflow-hidden ${borderClasses[size]} border-white shadow-lg ${sizeClasses[size]} flex-shrink-0 ${className}`}>
      <div 
        className={`w-full h-full ${editable ? 'cursor-pointer' : ''}`}
        onClick={handleClick}
      >
        <Image
          src={imageUrl}
          alt={`${userName}'s profile`}
          className="w-full h-full rounded-full"
          fallbackType="avatar"
          placeholder={initialsPlaceholder}
        />
        {editable && !isUploading && (
          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300 rounded-full">
            <div className="text-white text-center">
              <Camera size={size === 'large' ? 24 : 16} />
              <span className="text-xs mt-1 block">Change</span>
            </div>
          </div>
        )}
      </div>
      {editable && (
        <input
          id="profile-image-input"
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      )}
    </div>
  );
};

ProfilePicture.propTypes = {
  imageUrl: PropTypes.string,
  userName: PropTypes.string,
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  editable: PropTypes.bool,
  onImageChange: PropTypes.func,
  isUploading: PropTypes.bool,
  className: PropTypes.string
};

export default ProfilePicture;