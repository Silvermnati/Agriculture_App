import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Edit, Settings, Camera, MapPin, Calendar, Mail, Phone } from 'lucide-react';
import { setEditMode, setActiveTab, uploadProfilePicture } from '../../store/slices/profileSlice';
import ProfilePicture from './ProfilePicture';
import ProfileCompletionIndicator from './ProfileCompletionIndicator';
import Button from '../common/Button/Button';


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
    <div className="bg-white p-6 rounded-lg shadow-md">
      {/* Profile Completion Indicator */}
      <ProfileCompletionIndicator 
        user={user} 
        onEditClick={() => dispatch(setActiveTab('edit'))}
      />
      
      <div className="flex flex-col items-center text-center mt-4">
        <div className="relative w-32 h-32 mb-4">
          <ProfilePicture
            imageUrl={user?.avatar_url}
            userName={`${user?.first_name || ''} ${user?.last_name || ''}`.trim() || user?.email}
            size="large"
            editable={true}
            onImageChange={handleImageUpload}
            isUploading={isUploadingImage}
          />
          <button 
            className="absolute bottom-0 right-0 bg-green-600 text-white rounded-full p-2 shadow-md hover:bg-green-700 transition-colors"
            onClick={() => document.getElementById('profile-image-input')?.click()}
            disabled={isUploadingImage}
            aria-label="Change profile picture"
          >
            <Camera size={20} />
          </button>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-800">
          {`${user?.first_name || ''} ${user?.last_name || ''}`.trim() || 'User'}
        </h1>
        
        <div className="flex items-center justify-center space-x-2 mt-2">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${user?.role === 'farmer' ? 'bg-green-100 text-green-800' : user?.role === 'expert' ? 'bg-blue-110 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
            {getRoleDisplayName(user?.role)}
          </span>
          {user?.expert_profile?.is_verified && (
            <span className="px-3 py-1 bg-green-500 text-white rounded-full text-xs font-medium">
              Verified
            </span>
          )}
        </div>
        
        {user?.bio && (
          <p className="text-gray-600 mt-4 max-w-xl mx-auto">{user.bio}</p>
        )}
        
        <div className="flex flex-wrap justify-center gap-4 mt-4 text-gray-600 text-sm">
          {user?.location && (
            <div className="flex items-center space-x-1">
              <MapPin size={16} />
              <span>{getLocationString(user.location)}</span>
            </div>
          )}
          
          {user?.email && (
            <div className="flex items-center space-x-1">
              <Mail size={16} />
              <span>{user.email}</span>
            </div>
          )}
          
          {user?.phone && (
            <div className="flex items-center space-x-1">
              <Phone size={16} />
              <span>{user.phone}</span>
            </div>
          )}
          
          {user?.created_at && (
            <div className="flex items-center space-x-1">
              <Calendar size={16} />
              <span>Joined {formatDate(user.created_at)}</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Expert Profile Stats */}
      {user?.role === 'expert' && user?.expert_profile && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-200">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-800">{user.expert_profile.rating || 0}</p>
            <p className="text-sm text-gray-600">Rating</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-800">{user.expert_profile.review_count || 0}</p>
            <p className="text-sm text-gray-600">Reviews</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-800">{user.expert_profile.consultation_count || 0}</p>
            <p className="text-sm text-gray-600">Consultations</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-800">{user.expert_profile.years_experience || 0}</p>
            <p className="text-sm text-gray-600">Years Experience</p>
          </div>
        </div>
      )}
      
      {/* Farming Profile Stats */}
      {user?.role === 'farmer' && (user?.farm_size || user?.farming_experience) && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200">
          {user.farm_size && (
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-800">
                {user.farm_size} {user.farm_size_unit || 'hectares'}
              </p>
              <p className="text-sm text-gray-600">Farm Size</p>
            </div>
          )}
          {user.farming_experience && (
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-800">{user.farming_experience}</p>
              <p className="text-sm text-gray-600">Years Experience</p>
            </div>
          )}
          {user.farming_type && (
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-800">{user.farming_type}</p>
              <p className="text-sm text-gray-600">Farming Type</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProfileHeader;