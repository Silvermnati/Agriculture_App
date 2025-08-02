import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { X, Plus, MapPin, Lock, Globe } from 'lucide-react';
import { createCommunity } from '../../store/slices/communitiesSlice';
import Modal from '../common/Modal/Modal';
import Button from '../common/Button/Button';
import Input from '../common/Input/Input';
import FileUpload from '../common/FileUpload/FileUpload';

const CommunityForm = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, isError, message } = useSelector((state) => state.communities);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    community_type: 'Regional',
    focus_crops: [],
    location_city: '',
    location_country: '',
    is_private: false,
    image_url: ''
  });

  const [newCrop, setNewCrop] = useState('');
  const [errors, setErrors] = useState({});
  const [resetTrigger, setResetTrigger] = useState(0);

  const communityTypes = [
    { value: 'Regional', label: 'Regional', description: 'Location-based community' },
    { value: 'Crop-Specific', label: 'Crop-Specific', description: 'Focused on specific crops' },
    { value: 'Urban', label: 'Urban', description: 'Urban farming community' },
    { value: 'Professional', label: 'Professional', description: 'Professional network' }
  ];

  const commonCrops = [
    'Corn', 'Wheat', 'Rice', 'Soybeans', 'Coffee', 'Tea', 'Cotton', 'Sugarcane',
    'Tomatoes', 'Potatoes', 'Onions', 'Carrots', 'Lettuce', 'Spinach', 'Beans',
    'Peas', 'Peppers', 'Cucumbers', 'Squash', 'Pumpkins'
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleAddCrop = (crop) => {
    if (crop && !formData.focus_crops.includes(crop)) {
      setFormData(prev => ({
        ...prev,
        focus_crops: [...prev.focus_crops, crop]
      }));
    }
    setNewCrop('');
  };

  const handleRemoveCrop = (cropToRemove) => {
    setFormData(prev => ({
      ...prev,
      focus_crops: prev.focus_crops.filter(crop => crop !== cropToRemove)
    }));
  };

  const handleImageUpload = (imageUrl) => {
    setFormData(prev => ({
      ...prev,
      image_url: imageUrl
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Community name is required';
    } else if (formData.name.length < 3) {
      newErrors.name = 'Community name must be at least 3 characters';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    }

    if (formData.community_type === 'Regional') {
      if (!formData.location_city.trim()) {
        newErrors.location_city = 'City is required for regional communities';
      }
      if (!formData.location_country.trim()) {
        newErrors.location_country = 'Country is required for regional communities';
      }
    }

    if (formData.community_type === 'Crop-Specific' && formData.focus_crops.length === 0) {
      newErrors.focus_crops = 'At least one crop is required for crop-specific communities';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const result = await dispatch(createCommunity(formData)).unwrap();
      // Support both wrapped and flat responses
      const community = result.community || result;
      // Reset form
      setFormData({
        name: '',
        description: '',
        community_type: 'Regional',
        focus_crops: [],
        location_city: '',
        location_country: '',
        is_private: false,
        image_url: ''
      });
      setErrors({});
      setResetTrigger(prev => prev + 1); // Trigger FileUpload reset
      
      onClose();
      
      // Navigate to the new community
      if (community.id || community.community_id) {
        navigate(`/communities/${community.id || community.community_id}`);
      }
    } catch (error) {
      console.error('Failed to create community:', error);
    }
  };

  const handleReset = () => {
    setFormData({
      name: '',
      description: '',
      community_type: 'Regional',
      focus_crops: [],
      location_city: '',
      location_country: '',
      is_private: false,
      image_url: ''
    });
    setErrors({});
    setNewCrop('');
    setResetTrigger(prev => prev + 1); // Trigger FileUpload reset
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Community" size="lg">
      <div className="max-w-2xl mx-auto">
        {isError && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Community Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Community Image (Optional)
            </label>
            <FileUpload
              onUploadSuccess={handleImageUpload}
              acceptedTypes="image/*"
              maxSize={2 * 1024 * 1024} // 2MB
              className="mb-2"
              resetTrigger={resetTrigger}
            />
            {formData.image_url && (
              <div className="mt-2">
                <img
                  src={formData.image_url}
                  alt="Community preview"
                  className="w-full h-32 object-cover rounded-lg"
                />
              </div>
            )}
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Community Name *
              </label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., Organic Farmers Network"
                error={errors.name}
                required
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe what your community is about..."
                rows={4}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  errors.description ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description}</p>
              )}
            </div>

            <div>
              <label htmlFor="community_type" className="block text-sm font-medium text-gray-700 mb-1">
                Community Type *
              </label>
              <select
                id="community_type"
                name="community_type"
                value={formData.community_type}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              >
                {communityTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500">
                {communityTypes.find(t => t.value === formData.community_type)?.description}
              </p>
            </div>

            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="is_private"
                  checked={formData.is_private}
                  onChange={handleChange}
                  className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
                <span className="text-sm font-medium text-gray-700">Private Community</span>
              </label>
              <div className="flex items-center mt-1 text-xs text-gray-500">
                {formData.is_private ? (
                  <>
                    <Lock className="w-3 h-3 mr-1" />
                    Members need approval to join
                  </>
                ) : (
                  <>
                    <Globe className="w-3 h-3 mr-1" />
                    Anyone can join
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Location (for Regional communities) */}
          {formData.community_type === 'Regional' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="location_city" className="block text-sm font-medium text-gray-700 mb-1">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  City *
                </label>
                <Input
                  id="location_city"
                  name="location_city"
                  value={formData.location_city}
                  onChange={handleChange}
                  placeholder="e.g., Nairobi"
                  error={errors.location_city}
                  required
                />
              </div>

              <div>
                <label htmlFor="location_country" className="block text-sm font-medium text-gray-700 mb-1">
                  Country *
                </label>
                <Input
                  id="location_country"
                  name="location_country"
                  value={formData.location_country}
                  onChange={handleChange}
                  placeholder="e.g., Kenya"
                  error={errors.location_country}
                  required
                />
              </div>
            </div>
          )}

          {/* Focus Crops */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Focus Crops {formData.community_type === 'Crop-Specific' && '*'}
            </label>
            
            {/* Selected Crops */}
            {formData.focus_crops.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {formData.focus_crops.map((crop) => (
                  <span
                    key={crop}
                    className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                  >
                    {crop}
                    <button
                      type="button"
                      onClick={() => handleRemoveCrop(crop)}
                      className="ml-2 text-green-600 hover:text-green-800"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Add Crop Input */}
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newCrop}
                onChange={(e) => setNewCrop(e.target.value)}
                placeholder="Add a crop..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCrop(newCrop);
                  }
                }}
              />
              <Button
                type="button"
                onClick={() => handleAddCrop(newCrop)}
                variant="secondary"
                size="sm"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            {/* Common Crops */}
            <div>
              <p className="text-xs text-gray-500 mb-2">Quick add:</p>
              <div className="flex flex-wrap gap-1">
                {commonCrops.filter(crop => !formData.focus_crops.includes(crop)).slice(0, 10).map((crop) => (
                  <button
                    key={crop}
                    type="button"
                    onClick={() => handleAddCrop(crop)}
                    className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                  >
                    {crop}
                  </button>
                ))}
              </div>
            </div>

            {errors.focus_crops && (
              <p className="mt-1 text-sm text-red-600">{errors.focus_crops}</p>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex space-x-3 pt-4 border-t">
            <Button
              type="button"
              variant="secondary"
              onClick={handleReset}
              className="flex-1"
            >
              Reset
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? 'Creating...' : 'Create Community'}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default CommunityForm;