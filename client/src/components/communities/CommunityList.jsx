import React from "react";
import CommunityCard from "./CommunityCard";

const CommunityList = ({
  communities,
  onJoin,
  searchTerm,
  selectedType,
  selectedCrop,
}) => {
  const filteredCommunities = communities.filter((community) => {
    const matchesSearch =
      community.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      community.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType =
      !selectedType || community.community_type === selectedType;
    const matchesCrop =
      !selectedCrop ||
      community.focus_crops.some((crop) =>
        crop.toLowerCase().includes(selectedCrop.toLowerCase())
      );

    return matchesSearch && matchesType && matchesCrop;
  });

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

export default CommunityList;
