// components/Posts/PostFilters.jsx
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { cropsAPI, locationsAPI, categoriesAPI } from '../../utils/api';
import './posts.css';

const PostFilters = ({ filters, onFilterChange }) => {
  const [availableCrops, setAvailableCrops] = useState([]);
  const [availableLocations, setAvailableLocations] = useState([]);
  const [availableCategories, setAvailableCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFilterData = async () => {
      try {
        setLoading(true);
        
        // Try to fetch crops, locations, and categories
        const results = await Promise.allSettled([
          cropsAPI.getCrops().catch(err => {
            console.warn('Crops API failed:', err);
            return { data: [] };
          }),
          locationsAPI.getLocations().catch(err => {
            console.warn('Locations API failed:', err);
            return { data: [] };
          }),
          categoriesAPI.getCategories().catch(err => {
            console.warn('Categories API failed:', err);
            return { data: [] };
          })
        ]);

        // Extract data from responses, handling different response structures
        const cropsResponse = results[0].status === 'fulfilled' ? results[0].value : { data: [] };
        const locationsResponse = results[1].status === 'fulfilled' ? results[1].value : { data: [] };
        const categoriesResponse = results[2].status === 'fulfilled' ? results[2].value : { data: [] };

        const crops = cropsResponse.data?.crops || cropsResponse.data || [];
        const locations = locationsResponse.data?.locations || locationsResponse.data || [];
        const categories = categoriesResponse.data?.categories || categoriesResponse.data || [];

        console.log('API Responses:', { crops, locations, categories });

        // Ensure we have arrays and handle different data formats
        const cropsArray = Array.isArray(crops) ? crops : [];
        const locationsArray = Array.isArray(locations) ? locations : [];
        const categoriesArray = Array.isArray(categories) ? categories : [];

        // Process crops data
        const processedCrops = cropsArray.length > 0 
          ? cropsArray.map(crop => typeof crop === 'string' ? crop : (crop.name || crop))
          : ['Corn', 'Wheat', 'Rice', 'Tomatoes', 'Coffee', 'Tea', 'Beans', 'Maize'];

        // Process locations data  
        const processedLocations = locationsArray.length > 0
          ? locationsArray.map(location => typeof location === 'string' ? location : (location.name || location))
          : ['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 'Nyeri'];

        // Process categories data
        const processedCategories = categoriesArray.length > 0
          ? categoriesArray
          : [
              {id: 1, name: 'General'},
              {id: 2, name: 'Tips & Advice'},
              {id: 3, name: 'Pest Control'},
              {id: 4, name: 'Soil Health'},
              {id: 5, name: 'Irrigation'},
              {id: 6, name: 'Harvesting'}
            ];

        setAvailableCrops(processedCrops);
        setAvailableLocations(processedLocations);
        setAvailableCategories(processedCategories);

        console.log('Processed filter data:', {
          crops: processedCrops,
          locations: processedLocations,
          categories: processedCategories
        });

      } catch (error) {
        console.error('Failed to fetch filter data:', error);
        // Fallback to comprehensive default options
        setAvailableCrops(['Corn', 'Wheat', 'Rice', 'Tomatoes', 'Coffee', 'Tea', 'Beans', 'Maize']);
        setAvailableLocations(['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 'Nyeri']);
        setAvailableCategories([
          {id: 1, name: 'General'},
          {id: 2, name: 'Tips & Advice'},
          {id: 3, name: 'Pest Control'},
          {id: 4, name: 'Soil Health'},
          {id: 5, name: 'Irrigation'},
          {id: 6, name: 'Harvesting'}
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchFilterData();
  }, []);

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

  if (loading) {
    return (
      <div className="post-filters">
        <div className="text-center py-4">
          <div className="text-gray-500">Loading filters...</div>
        </div>
      </div>
    );
  }

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
          <option key="all-seasons" value="">All Seasons</option>
          <option key="spring" value="Spring">Spring</option>
          <option key="summer" value="Summer">Summer</option>
          <option key="fall" value="Fall">Fall</option>
          <option key="winter" value="Winter">Winter</option>
          <option key="dry" value="Dry">Dry</option>
          <option key="wet" value="Wet">Wet</option>
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