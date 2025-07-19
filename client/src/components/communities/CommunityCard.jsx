import React, { useState } from "react";
import { Users, MapPin, Leaf, Lock, ArrowRight } from "lucide-react";

const CommunityCard = ({ community, onJoin, isJoined = false }) => {
  const [joined, setJoined] = useState(isJoined);

  const handleJoin = () => {
    setJoined(!joined);
    if (onJoin) onJoin(community.id, !joined);
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
      <div className="relative">
        <img
          src={community.image_url}
          alt={community.name}
          className="w-full h-48 object-cover"
        />
        {community.recent_activity && (
          <div className="absolute top-3 right-3">
            <div className="bg-green-500 w-3 h-3 rounded-full animate-pulse"></div>
          </div>
        )}
        {community.is_private && (
          <div className="absolute top-3 left-3">
            <Lock className="w-5 h-5 text-white bg-gray-800 bg-opacity-60 rounded p-1" />
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
            {community.name}
          </h3>
          <span
            className={`px-2 py-1 text-xs rounded-full ${
              community.community_type === "Regional"
                ? "bg-blue-100 text-blue-800"
                : community.community_type === "Crop-Specific"
                ? "bg-green-100 text-green-800"
                : community.community_type === "Urban"
                ? "bg-purple-100 text-purple-800"
                : "bg-yellow-100 text-yellow-800"
            }`}
          >
            {community.community_type}
          </span>
        </div>

        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {community.description}
        </p>

        <div className="space-y-2 mb-4">
          {community.location.city && (
            <div className="flex items-center text-sm text-gray-500">
              <MapPin className="w-4 h-4 mr-1" />
              <span>
                {community.location.city}, {community.location.country}
              </span>
            </div>
          )}

          <div className="flex items-center text-sm text-gray-500">
            <Users className="w-4 h-4 mr-1" />
            <span>{community.member_count.toLocaleString()} members</span>
          </div>

          <div className="flex items-center text-sm text-gray-500">
            <Leaf className="w-4 h-4 mr-1" />
            <span>{community.focus_crops.join(", ")}</span>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <button
            onClick={handleJoin}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              joined
                ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                : "bg-green-600 text-white hover:bg-green-700"
            }`}
          >
            {joined ? "Leave" : "Join"} Community
          </button>

          <button className="text-green-600 hover:text-green-700 text-sm font-medium">
            View Details <ArrowRight className="w-4 h-4 inline ml-1" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CommunityCard;
