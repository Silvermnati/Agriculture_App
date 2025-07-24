import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Save, X, Plus, Trash2 } from 'lucide-react';
import { 
  updateUserProfile, 
  updateProfileForm, 
  setHasUnsavedChanges,
  setEditMode 
} from '../../store/slices/profileSlice';
import { USER_ROLES, FARMING_TYPES, FARM_SIZE_UNITS, VALIDATION } from '../../utils/constants';
import Button from '../common/Button/Button';
import Input from '../common/Input/Input';
import LoadingSpinner from '../common/LoadingSpinner/LoadingSpinner';
import './EditProfileTab.css';

const EditProfileTab = ({ user }) => {
  const dispatch = useDispatch();
  const { 
    profileForm, 
    isUpdating, 
    hasUnsavedChanges, 
    validationErrors 
  } = useSelector((state) => state.profile);

  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    bio: user?.bio || '',
    gender: user?.gender || '',
    phone: user?.phone || '',
    date_of_birth: user?.date_of_birth ? user.date_of_birth.split('T')[0] : '',
    location: {
      city: user?.location?.city || '',
      country: user?.location?.country || ''
    },
    farm_size: user?.farm_size || '',
    farm_size_unit: user?.farm_size_unit || 'hectares',
    farming_experience: user?.farming_experience || '',
    farming_type: user?.farming_type || '',
    crops_grown: user?.crops_grown || [],
    social_links: {
      website: user?.social_links?.website || '',
      linkedin: user?.social_links?.linkedin || '',
      twitter: user?.social_links?.twitter || '',
      facebook: user?.social_links?.facebook || ''
    }
  });

  const [errors, setErrors] = useState({});
  const [newCrop, setNewCrop] = useState('');

  useEffect(() => {
    // Initialize form with user data
    if (user) {
      const initialData = {
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        bio: user.bio || '',
        gender: user.gender || '',
        phone: user.phone || '',
        date_of_birth: user.date_of_birth ? user.date_of_birth.split('T')[0] : '',
        location: {
          city: user.location?.city || '',
          country: user.location?.country || ''
        },
        farm_size: user.farm_size || '',
        farm_size_unit: user.farm_size_unit || 'hectares',
        farming_experience: user.farming_experience || '',
        farming_type: user.farming_type || '',
        crops_grown: user.crops_grown || [],
        social_links: {
          website: user.social_links?.website || '',
          linkedin: user.social_links?.linkedin || '',
          twitter: user.social_links?.twitter || '',
          facebook: user.social_links?.facebook || ''
        }
      };
      setFormData(initialData);
    }
  }, [user]);

  const validateForm = () => {
    const newErrors = {};

    // Name validation
    if (!formData.first_name.trim()) {
      newErrors.first_name = 'First name is required';
    } else if (formData.first_name.length < VALIDATION.NAME.MIN_LENGTH) {
      newErrors.first_name = VALIDATION.NAME.MESSAGE;
    }

    if (!formData.last_name.trim()) {
      newErrors.last_name = 'Last name is required';
    } else if (formData.last_name.length < VALIDATION.NAME.MIN_LENGTH) {
      newErrors.last_name = VALIDATION.NAME.MESSAGE;
    }

    // Phone validation (optional)
    if (formData.phone && !/^\+?[\d\s\-\(\)]+$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    // Farm size validation (for farmers)
    if (user?.role === 'farmer' && formData.farm_size) {
      const farmSize = parseFloat(formData.farm_size);
      if (isNaN(farmSize) || farmSize < VALIDATION.FARM_SIZE.MIN || farmSize > VALIDATION.FARM_SIZE.MAX) {
        newErrors.farm_size = VALIDATION.FARM_SIZE.MESSAGE;
      }
    }

    // Farming experience validation (for farmers)
    if (user?.role === 'farmer' && formData.farming_experience) {
      const experience = parseInt(formData.farming_experience);
      if (isNaN(experience) || experience < VALIDATION.FARMING_EXPERIENCE.MIN || experience > VALIDATION.FARMING_EXPERIENCE.MAX) {
        newErrors.farming_experience = VALIDATION.FARMING_EXPERIENCE.MESSAGE;
      }
    }

    // Bio validation (optional)
    if (formData.bio && formData.bio.length > VALIDATION.DESCRIPTION.MAX_LENGTH) {
      newErrors.bio = `Bio must be less than ${VALIDATION.DESCRIPTION.MAX_LENGTH} characters`;
    }

    // URL validation for social links
    const urlPattern = /^https?:\/\/.+/;
    Object.keys(formData.social_links).forEach(platform => {
      const url = formData.social_links[platform];
      if (url && !urlPattern.test(url)) {
        newErrors[`social_links.${platform}`] = 'Please enter a valid URL (starting with http:// or https://)';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }

    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }

    // Mark as having unsaved changes
    if (!hasUnsavedChanges) {
      dispatch(setHasUnsavedChanges(true));
    }
  };

  const handleAddCrop = () => {
    if (newCrop.trim() && !formData.crops_grown.includes(newCrop.trim())) {
      setFormData(prev => ({
        ...prev,
        crops_grown: [...prev.crops_grown, newCrop.trim()]
      }));
      setNewCrop('');
      dispatch(setHasUnsavedChanges(true));
    }
  };

  const handleRemoveCrop = (cropToRemove) => {
    setFormData(prev => ({
      ...prev,
      crops_grown: prev.crops_grown.filter(crop => crop !== cropToRemove)
    }));
    dispatch(setHasUnsavedChanges(true));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Prepare data for submission
    const submitData = { ...formData };
    
    // Clean up empty values
    Object.keys(submitData).forEach(key => {
      if (typeof submitData[key] === 'string' && !submitData[key].trim()) {
        delete submitData[key];
      }
    });

    // Clean up location
    if (!submitData.location.city && !submitData.location.country) {
      delete submitData.location;
    }

    // Clean up social links
    const cleanSocialLinks = {};
    Object.keys(submitData.social_links).forEach(platform => {
      if (submitData.social_links[platform].trim()) {
        cleanSocialLinks[platform] = submitData.social_links[platform];
      }
    });
    
    if (Object.keys(cleanSocialLinks).length > 0) {
      submitData.social_links = cleanSocialLinks;
    } else {
      delete submitData.social_links;
    }

    try {
      await dispatch(updateUserProfile(submitData)).unwrap();
      dispatch(setEditMode(false));
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  const handleCancel = () => {
    if (hasUnsavedChanges) {
      const confirmCancel = window.confirm(
        'You have unsaved changes. Are you sure you want to cancel?'
      );
      if (!confirmCancel) return;
    }
    
    dispatch(setEditMode(false));
    dispatch(setHasUnsavedChanges(false));
  };

  if (isUpdating) {
    return (
      <div className="edit-profile-tab">
        <LoadingSpinner text="Updating profile..." />
      </div>
    );
  }

  return (
    <div className="edit-profile-tab">
      <form onSubmit={handleSubmit} className="edit-profile-form">
        {/* Basic Information */}
        <div className="form-section">
          <h3 className="form-section-title">Basic Information</h3>
          <div className="form-grid">
            <Input
              id="first_name"
              name="first_name"
              label="First Name"
              value={formData.first_name}
              onChange={(e) => handleInputChange('first_name', e.target.value)}
              error={errors.first_name}
              required
            />
            
            <Input
              id="last_name"
              name="last_name"
              label="Last Name"
              value={formData.last_name}
              onChange={(e) => handleInputChange('last_name', e.target.value)}
              error={errors.last_name}
              required
            />
            
            <div className="form-field">
              <label className="form-label">Gender</label>
              <select
                value={formData.gender}
                onChange={(e) => handleInputChange('gender', e.target.value)}
                className="form-select"
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            
            <Input
              id="phone"
              name="phone"
              label="Phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              error={errors.phone}
              placeholder="+1 234 567 8900"
            />
            
            <Input
              id="date_of_birth"
              name="date_of_birth"
              label="Date of Birth"
              type="date"
              value={formData.date_of_birth}
              onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
              error={errors.date_of_birth}
            />
          </div>
        </div>

        {/* Location */}
        <div className="form-section">
          <h3 className="form-section-title">Location</h3>
          <div className="form-grid">
            <Input
              id="city"
              name="city"
              label="City"
              value={formData.location.city}
              onChange={(e) => handleInputChange('location.city', e.target.value)}
              error={errors['location.city']}
            />
            
            <Input
              id="country"
              name="country"
              label="Country"
              value={formData.location.country}
              onChange={(e) => handleInputChange('location.country', e.target.value)}
              error={errors['location.country']}
            />
          </div>
        </div>

        {/* Bio */}
        <div className="form-section">
          <h3 className="form-section-title">About</h3>
          <div className="form-field">
            <label className="form-label">Bio</label>
            <textarea
              value={formData.bio}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              className={`form-textarea ${errors.bio ? 'form-textarea-error' : ''}`}
              rows={4}
              placeholder="Tell us about yourself..."
              maxLength={VALIDATION.DESCRIPTION.MAX_LENGTH}
            />
            {errors.bio && <span className="form-error">{errors.bio}</span>}
            <div className="form-help">
              {formData.bio.length}/{VALIDATION.DESCRIPTION.MAX_LENGTH} characters
            </div>
          </div>
        </div>

        {/* Role-specific sections */}
        {user?.role === 'farmer' && (
          <div className="form-section">
            <h3 className="form-section-title">Farming Information</h3>
            <div className="form-grid">
              <div className="form-field">
                <label className="form-label">Farm Size</label>
                <div className="input-group">
                  <input
                    type="number"
                    value={formData.farm_size}
                    onChange={(e) => handleInputChange('farm_size', e.target.value)}
                    className={`form-input ${errors.farm_size ? 'form-input-error' : ''}`}
                    placeholder="0"
                    min="0"
                    step="0.01"
                  />
                  <select
                    value={formData.farm_size_unit}
                    onChange={(e) => handleInputChange('farm_size_unit', e.target.value)}
                    className="form-select"
                  >
                    {FARM_SIZE_UNITS.map(unit => (
                      <option key={unit.value} value={unit.value}>
                        {unit.label}
                      </option>
                    ))}
                  </select>
                </div>
                {errors.farm_size && <span className="form-error">{errors.farm_size}</span>}
              </div>
              
              <Input
                id="farming_experience"
                name="farming_experience"
                label="Farming Experience (years)"
                type="number"
                value={formData.farming_experience}
                onChange={(e) => handleInputChange('farming_experience', e.target.value)}
                error={errors.farming_experience}
                min="0"
                max="100"
              />
              
              <div className="form-field">
                <label className="form-label">Farming Type</label>
                <select
                  value={formData.farming_type}
                  onChange={(e) => handleInputChange('farming_type', e.target.value)}
                  className="form-select"
                >
                  <option value="">Select Farming Type</option>
                  {FARMING_TYPES.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            {/* Crops Grown */}
            <div className="form-field">
              <label className="form-label">Crops Grown</label>
              <div className="crops-input">
                <div className="input-group">
                  <input
                    type="text"
                    value={newCrop}
                    onChange={(e) => setNewCrop(e.target.value)}
                    className="form-input"
                    placeholder="Add a crop..."
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddCrop();
                      }
                    }}
                  />
                  <Button
                    type="button"
                    onClick={handleAddCrop}
                    variant="outline"
                    size="small"
                    icon={<Plus size={16} />}
                  >
                    Add
                  </Button>
                </div>
                
                {formData.crops_grown.length > 0 && (
                  <div className="crops-list">
                    {formData.crops_grown.map((crop, index) => (
                      <div key={index} className="crop-tag">
                        <span>{crop}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveCrop(crop)}
                          className="crop-remove"
                          aria-label={`Remove ${crop}`}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Social Links */}
        <div className="form-section">
          <h3 className="form-section-title">Social Links</h3>
          <div className="form-grid">
            <Input
              id="website"
              name="website"
              label="Website"
              type="url"
              value={formData.social_links.website}
              onChange={(e) => handleInputChange('social_links.website', e.target.value)}
              error={errors['social_links.website']}
              placeholder="https://yourwebsite.com"
            />
            
            <Input
              id="linkedin"
              name="linkedin"
              label="LinkedIn"
              type="url"
              value={formData.social_links.linkedin}
              onChange={(e) => handleInputChange('social_links.linkedin', e.target.value)}
              error={errors['social_links.linkedin']}
              placeholder="https://linkedin.com/in/yourprofile"
            />
            
            <Input
              id="twitter"
              name="twitter"
              label="Twitter"
              type="url"
              value={formData.social_links.twitter}
              onChange={(e) => handleInputChange('social_links.twitter', e.target.value)}
              error={errors['social_links.twitter']}
              placeholder="https://twitter.com/yourusername"
            />
            
            <Input
              id="facebook"
              name="facebook"
              label="Facebook"
              type="url"
              value={formData.social_links.facebook}
              onChange={(e) => handleInputChange('social_links.facebook', e.target.value)}
              error={errors['social_links.facebook']}
              placeholder="https://facebook.com/yourprofile"
            />
          </div>
        </div>

        {/* Form Actions */}
        <div className="form-actions">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            icon={<X size={16} />}
          >
            Cancel
          </Button>
          
          <Button
            type="submit"
            variant="primary"
            disabled={isUpdating || Object.keys(errors).length > 0}
            icon={<Save size={16} />}
          >
            {isUpdating ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditProfileTab;