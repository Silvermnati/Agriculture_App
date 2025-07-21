import React, { useState, useEffect } from 'react';
import ExpertList from '../../components/Experts/ExpertList';
import ExpertFilters from '../../components/Experts/ExpertFilters';
import LoadingSpinner from '../../components/common/LoadingSpinner/LoadingSpinner';
import { mockExperts } from '../../utils/mockData';

const ExpertsPage = () => {
  const [experts, setExperts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [message, setMessage] = useState('');
  const [filters, setFilters] = useState({});

  useEffect(() => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      try {
        // Apply filters to mock data
        const filteredExperts = mockExperts.filter(expert => {
          const { specialization, location, rating, availability } = filters;
          if (specialization && !expert.specializations.some(s => s.toLowerCase().includes(specialization.toLowerCase()))) {
            return false;
          }
          if (location && !expert.service_areas.some(a => a.toLowerCase().includes(location.toLowerCase()))) {
            return false;
          }
          if (rating && expert.rating < parseFloat(rating)) {
            return false;
          }
          if (availability && expert.availability_status.toLowerCase() !== availability.toLowerCase()) {
            return false;
          }
          return true;
        });
        setExperts(filteredExperts);
        setIsLoading(false);
      } catch (error) {
        setIsError(true);
        setMessage('Failed to load experts data.');
        setIsLoading(false);
      }
    }, 500);
  }, [filters]);

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
