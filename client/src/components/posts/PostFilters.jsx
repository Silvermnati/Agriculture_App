// components/Posts/PostFilters.jsx
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { cropsAPI, locationsAPI, categoriesAPI } from '../../utils/api';


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
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">Filter Posts</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label htmlFor="crop" className="block text-sm font-medium text-gray-700">Crop</label>
          <select id="crop" name="crop" onChange={handleSingleChange} value={filters.crop || ''} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm">
            <option value="">All Crops</option>
            {availableCrops.map(crop => (
              <option key={crop} value={crop}>{crop}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700">Location</label>
          <select id="location" name="location" onChange={handleSingleChange} value={filters.location || ''} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm">
            <option value="">All Locations</option>
            {availableLocations.map(location => (
              <option key={location} value={location}>{location}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="season" className="block text-sm font-medium text-gray-700">Season</label>
          <select id="season" name="season" onChange={handleSingleChange} value={filters.season || ''} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm">
            <option value="">All Seasons</option>
            <option value="Spring">Spring</option>
            <option value="Summer">Summer</option>
            <option value="Fall">Fall</option>
            <option value="Winter">Winter</option>
            <option value="Dry">Dry</option>
            <option value="Wet">Wet</option>
          </select>
        </div>
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
          <select id="category" name="category" onChange={handleSingleChange} value={filters.category || ''} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm">
            <option value="">All Categories</option>
            {availableCategories.map(cat => (
              <option key={cat.id} value={cat.name}>{cat.name}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

PostFilters.propTypes = {
    filters: PropTypes.object.isRequired,
    onFilterChange: PropTypes.func.isRequired,
};

export default PostFilters;