import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ExpertList from '../../components/Experts/ExpertList';
import ExpertFilters from '../../components/Experts/ExpertFilters';
import LoadingSpinner from '../../components/common/LoadingSpinner/LoadingSpinner';
import { getExperts, reset } from '../../store/slices/expertsSlice';

const ExpertsPage = () => {
  const dispatch = useDispatch();
  const { experts, isLoading, isError, message } = useSelector((state) => state.experts);
  
  const [filters, setFilters] = useState({});

  useEffect(() => {
    dispatch(getExperts(filters));
    
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
            <button 
              onClick={() => dispatch(getExperts(filters))}
              className="mt-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        ) : experts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg mb-4">No experts found</div>
            <p className="text-gray-400">Try adjusting your filters or check back later.</p>
          </div>
        ) : (
          <ExpertList experts={experts} />
        )}
      </div>
    </div>
  );
};

export default ExpertsPage;
