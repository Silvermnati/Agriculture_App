import React from "react";
import { Users, MapPin, Lock, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const CommunityCard = ({ community, onJoin }) => {
  // Format member count to be more readable
  const formatMemberCount = (count) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count;
  };

  // Format date to be more readable
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 7) {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `${weeks} week${weeks !== 1 ? 's' : ''} ago`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `${months} month${months !== 1 ? 's' : ''} ago`;
    } else {
      const years = Math.floor(diffDays / 365);
      return `${years} year${years !== 1 ? 's' : ''} ago`;
    }
  };

  const handleJoin = (e) => {
    e.preventDefault();
    if (onJoin) {
      onJoin(community.id);
    } else {
      console.log(`Join community ${community.id}`);
      alert(`Joined community: ${community.name}`);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <Link to={`/communities/${community.id}`} className="block">
        <div className="relative h-40">
          <img
            src={community.image_url || "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200"}
            alt={community.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
            <div className="p-4 text-white">
              <h3 className="text-xl font-bold">{community.name}</h3>
              {community.location && community.location.city && (
                <div className="flex items-center mt-1 text-sm">
                  <MapPin className="w-4 h-4 mr-1" />
                  <span>{community.location.city}, {community.location.country}</span>
                </div>
              )}
            </div>
          </div>
          {community.is_private && (
            <div className="absolute top-2 right-2 bg-black/50 text-white px-2 py-1 rounded-full text-xs flex items-center">
              <Lock className="w-3 h-3 mr-1" />
              Private
            </div>
          )}
          {community.recent_activity && (
            <div className="absolute top-2 left-2 bg-green-600 text-white px-2 py-1 rounded-full text-xs">
              Active
            </div>
          )}
        </div>
      </Link>

      <div className="p-4">
        <div className="mb-3">
          <p className="text-gray-600 text-sm line-clamp-2">
            {community.description}
          </p>
        </div>

        <div className="flex flex-wrap gap-1 mb-3">
          {community.focus_crops && community.focus_crops.slice(0, 3).map((crop) => (
            <span
              key={crop}
              className="px-2 py-0.5 bg-green-100 text-green-800 rounded-full text-xs"
            >
              {crop}
            </span>
          ))}
          {community.focus_crops && community.focus_crops.length > 3 && (
            <span className="px-2 py-0.5 bg-gray-100 text-gray-800 rounded-full text-xs">
              +{community.focus_crops.length - 3} more
            </span>
          )}
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center text-gray-500 text-sm">
            <Users className="w-4 h-4 mr-1" />
            <span>{formatMemberCount(community.member_count)} members</span>
            <span className="mx-2">•</span>
            <span>Created {formatDate(community.created_at)}</span>
          </div>

          <button
            onClick={handleJoin}
            className={`text-sm px-3 py-1 rounded ${
              community.is_member
                ? "bg-gray-100 text-gray-600"
                : "bg-green-600 text-white hover:bg-green-700"
            }`}
          >
            {community.is_member ? "Joined" : "Join"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CommunityCard;