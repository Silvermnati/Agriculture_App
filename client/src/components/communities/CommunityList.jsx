import React from "react";
import PropTypes from 'prop-types';
import CommunityCard from "./CommunityCard";

const CommunityList = ({
  communities,
  onJoin,
  searchTerm = "",
  selectedType = "",
  selectedCrop = "",
}) => {
  const filteredCommunities = communities.filter((community) => {
    const matchesSearch =
      community.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      community.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType =
      !selectedType || community.community_type === selectedType;
    
    const matchesCrop =
      !selectedCrop ||
      (community.focus_crops && 
       community.focus_crops.some((crop) =>
         crop.toLowerCase().includes(selectedCrop.toLowerCase())
       ));

    return matchesSearch && matchesType && matchesCrop;
  });

  if (filteredCommunities.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">No communities found</h3>
        <p className="text-gray-600 mb-6">
          Try adjusting your search or filters to find what you're looking for.
        </p>
        <button 
          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
          onClick={() => {
            // In a real app, this would navigate to create community page
            console.log('Create new community');
            alert('Creating new community');
          }}
        >
          Create a new community
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredCommunities.map((community) => (
        <CommunityCard
          key={community.id}
          community={community}
          onJoin={onJoin}
        />
      ))}
    </div>
  );
};

CommunityList.propTypes = {
    communities: PropTypes.array.isRequired,
    onJoin: PropTypes.func.isRequired,
    searchTerm: PropTypes.string,
    selectedType: PropTypes.string,
    selectedCrop: PropTypes.string,
};

export default CommunityList;
