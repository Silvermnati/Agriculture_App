import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Search, Filter, Plus } from 'lucide-react';
import CommunityList from '../../components/communities/CommunityList';
import CommunityForm from '../../components/communities/CommunityForm';
import LoadingSpinner from '../../components/common/LoadingSpinner/LoadingSpinner';
import { getCommunities, joinCommunity, reset } from '../../store/slices/communitiesSlice';
import { mockCommunities } from '../../utils/mockData';

const CommunitiesPage = () => {
  const dispatch = useDispatch();
  const { communities, isLoading, isError, message } = useSelector((state) => state.communities);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedCrop, setSelectedCrop] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  // Community types for filter
  const communityTypes = [
    { value: '', label: 'All Types' },
    { value: 'Regional', label: 'Regional' },
    { value: 'Crop-Specific', label: 'Crop-Specific' },
    { value: 'Urban', label: 'Urban' },
    { value: 'Professional', label: 'Professional' }
  ];
  
  // Common crops for filter
  const commonCrops = [
    { value: '', label: 'All Crops' },
    { value: 'Corn', label: 'Corn' },
    { value: 'Coffee', label: 'Coffee' },
    { value: 'Rice', label: 'Rice' },
    { value: 'Vegetables', label: 'Vegetables' }
  ];

  useEffect(() => {
    // Try to fetch from API first, fallback to mock data
    const fetchCommunities = async () => {
      try {
        await dispatch(getCommunities()).unwrap();
      } catch (error) {
        // If API fails, use mock data for development
        console.warn('API failed, using mock data:', error);
        // You can set mock data here if needed for development
      }
    };

    fetchCommunities();
    
    // Cleanup function
    return () => {
      dispatch(reset());
    };
  }, [dispatch]);

  const handleJoinCommunity = async (communityId) => {
    try {
      await dispatch(joinCommunity(communityId)).unwrap();
    } catch (error) {
      console.error('Failed to join/leave community:', error);
      // You might want to show a toast notification here
    }
  };

  const handleCreateCommunity = () => {
    setShowCreateForm(true);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Communities</h1>
          <p className="text-gray-600 mt-1">
            Connect with farmers and experts in your area or by crop interest
          </p>
        </div>
        <button 
          onClick={handleCreateCommunity}
          className="mt-4 md:mt-0 flex items-center bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Create Community
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search communities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
          <div className="flex gap-4">
            <div className="w-48">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                {communityTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="w-48">
              <select
                value={selectedCrop}
                onChange={(e) => setSelectedCrop(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                {commonCrops.map((crop) => (
                  <option key={crop.value} value={crop.value}>
                    {crop.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {isError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {message}
        </div>
      )}

      {isLoading ? (
        <LoadingSpinner text="Loading communities..." />
      ) : (
        <CommunityList
          communities={communities.length > 0 ? communities : mockCommunities}
          onJoin={handleJoinCommunity}
          searchTerm={searchTerm}
          selectedType={selectedType}
          selectedCrop={selectedCrop}
        />
      )}

      {/* Create Community Form Modal */}
      <CommunityForm
        isOpen={showCreateForm}
        onClose={() => setShowCreateForm(false)}
      />
    </div>
  );
};

export default CommunitiesPage;