import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getExperts } from '../../store/slices/expertsSlice';
import ExpertList from '../../components/Experts/ExpertList';
import ExpertFilters from '../../components/Experts/ExpertFilters';
import LoadingSpinner from '../../components/common/LoadingSpinner/LoadingSpinner';

const ExpertsPage = () => {
  const dispatch = useDispatch();
  const { experts, isLoading, isError, message } = useSelector((state) => state.experts);
  const [filters, setFilters] = useState({});

  useEffect(() => {
    dispatch(getExperts(filters));
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
          <div className="text-center text-red-500">{message}</div>
        ) : (
          <ExpertList experts={experts} />
        )}
      </div>
    </div>
  );
};

export default ExpertsPage;
