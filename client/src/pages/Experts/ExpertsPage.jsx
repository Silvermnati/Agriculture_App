import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ExpertList from '../../components/Experts/ExpertList';
import ExpertFilters from '../../components/Experts/ExpertFilters';
import LoadingSpinner from '../../components/common/LoadingSpinner/LoadingSpinner';
import { getExperts, reset } from '../../store/slices/expertsSlice';
import { mockExperts } from '../../utils/mockData';

const ExpertsPage = () => {
  const dispatch = useDispatch();
  const { experts, isLoading, isError, message } = useSelector((state) => state.experts);
  
  const [filters, setFilters] = useState({});

  useEffect(() => {
    // Try to fetch from API first, fallback to mock data
    const fetchExperts = async () => {
      try {
        await dispatch(getExperts(filters)).unwrap();
      } catch (error) {
        // If API fails, use mock data for development
        console.warn('API failed, using mock data:', error);
        // You can set mock data here if needed for development
      }
    };

    fetchExperts();
    
    // Cleanup function
    return () => {
      dispatch(reset());
    };
  }, [dispatch, filters]);

  const handleFilterChange = (name, value) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Find an Expert</h1>
      <p className="text-gray-600 mb-8">Get advice from top agricultural professionals.</p>
      <ExpertFilters onFilterChange={handleFilterChange} />
      <div className="mt-8">
        {isLoading ? (
          <LoadingSpinner text="Loading Experts..." />
        ) : isError ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p>{message}</p>
            <p className="text-sm mt-2">Using demo data for development.</p>
          </div>
        ) : null}
        
        <ExpertList experts={experts.length > 0 ? experts : mockExperts} />
      </div>
    </div>
  );
};

export default ExpertsPage;
