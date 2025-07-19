import React, { useState, useEffect } from 'react';
import { Search, Filter, Plus } from 'lucide-react';
import CommunityList from '../../components/communities/CommunityList';
import { mockCommunities } from '../../utils/mockData';

const CommunitiesPage = () => {
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedCrop, setSelectedCrop] = useState('');
  
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
    // Simulate API call with timeout
    setLoading(true);
    setTimeout(() => {
      setCommunities(mockCommunities);
      setLoading(false);
    }, 500);
  }, []);

  const handleJoinCommunity = (communityId) => {
    // Update local state
    setCommunities(communities.map(community => 
      community.id === communityId 
        ? { ...community, is_member: !community.is_member } 
        : community
    ));
    
    // In a real app, this would be an API call
    const community = communities.find(c => c.id === communityId);
    console.log(`${community.is_member ? 'Leave' : 'Join'} community ${communityId}`);
  };

  const handleCreateCommunity = () => {
    // In a real app, this would navigate to a create community page
    console.log('Create new community');
    alert('Creating new community');
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

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        </div>
      ) : (
        <CommunityList
          communities={communities}
          onJoin={handleJoinCommunity}
          searchTerm={searchTerm}
          selectedType={selectedType}
          selectedCrop={selectedCrop}
        />
      )}
    </div>
  );
};

export default CommunitiesPage;