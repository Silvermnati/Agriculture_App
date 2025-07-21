// components/Posts/PostFilters.jsx
import React from 'react';
import PropTypes from 'prop-types';
import './posts.css';

// Mock data - in a real app, this would come from an API
const availableCrops = ['Corn', 'Wheat', 'Soybeans', 'Tomatoes'];
const availableLocations = ['Nairobi', 'Rift Valley', 'Coastal Region'];
const availableCategories = [{id: 1, name: 'Pest Control'}, {id: 2, name: 'Soil Health'}];

const PostFilters = ({ filters, onFilterChange }) => {
  const handleSingleChange = (e) => {
    const { name, value } = e.target;
    onFilterChange({ ...filters, [name]: value });
  };

  const handleMultiChange = (e) => {
    const { name, value, checked } = e.target;
    // Ensure we are working with an array
    const currentValues = Array.isArray(filters[name]) ? filters[name] : [];
    const newValues = checked
      ? [...currentValues, value]
      : currentValues.filter((item) => item !== value);
    onFilterChange({ ...filters, [name]: newValues });
  };

  return (
    <div className="post-filters">
      <div className="filter-group">
        <strong>Crops</strong>
        {availableCrops.map(crop => (
          <label key={crop}>
            <input type="checkbox" name="crop" value={crop} checked={filters.crop?.includes(crop) || false} onChange={handleMultiChange} />
            {crop}
          </label>
        ))}
      </div>

      <div className="filter-group">
        <strong>Locations</strong>
        {availableLocations.map(location => (
          <label key={location}>
            <input type="checkbox" name="location" value={location} checked={filters.location?.includes(location) || false} onChange={handleMultiChange} />
            {location}
          </label>
        ))}
      </div>

      <div className="filter-group">
        <strong>Season</strong>
        <select name="season" onChange={handleSingleChange} value={filters.season || ''}>
          <option value="">All Seasons</option>
          <option value="Spring">Spring</option>
          <option value="Summer">Summer</option>
          <option value="Fall">Fall</option>
          <option value="Winter">Winter</option>
          <option value="Dry">Dry</option>
          <option value="Wet">Wet</option>
        </select>
      </div>

      <div className="filter-group">
        <strong>Category</strong>
        <select name="category" onChange={handleSingleChange} value={filters.category || ''}>
          <option value="">All Categories</option>
          {availableCategories.map(cat => (
            <option key={cat.id} value={cat.name}>{cat.name}</option>
          ))}
        </select>
      </div>
    </div>
  );
};

PostFilters.propTypes = {
    filters: PropTypes.object.isRequired,
    onFilterChange: PropTypes.func.isRequired,
};

export default PostFilters;