import React, { useState } from "react";
import PropTypes from "prop-types";
import { Star, UserPlus, MessageSquare } from "lucide-react";
import ConsultationBooking from "./ConsultationBooking";
import Image from '../common/Image/Image';

const ExpertCard = ({ expert, onFollow, onMessage, isFollowing }) => {
  const [showBookingModal, setShowBookingModal] = useState(false);
  const {
    id,
    name,
    title,
    avatar_url,
    specializations = [],
    rating,
    review_count,
    hourly_rate,
    currency,
    availability_status,
  } = expert;

  const handleFollow = () => {
    if (onFollow) onFollow(id);
  };

  const handleMessage = () => {
    if (onMessage) onMessage(id);
  };

  // Function to get the appropriate currency symbol
  const getCurrencySymbol = (currencyCode) => {
    // Default to KSh if no currency is specified (since this is an agriculture app likely focused on Kenya)
    if (!currencyCode || currencyCode === 'KES') {
      return 'KSh';
    }
    // Handle other common currencies
    switch (currencyCode.toUpperCase()) {
      case 'USD':
        return '$';
      case 'EUR':
        return '€';
      case 'GBP':
        return '£';
      case 'UGX':
        return 'UGX';
      case 'TZS':
        return 'TSh';
      default:
        return 'KSh'; // Default to Kenyan Shillings for this agriculture app
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center text-center hover:shadow-lg transition-shadow duration-300">
      {/* Expert Profile Image with proper circular styling */}
      <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg mb-4 flex-shrink-0">
        <Image
          src={avatar_url}
          alt={name || title || 'Expert profile picture'}
          className="w-full h-full object-cover"
          fallbackType="expert"
        />
      </div>
      
      <h3 className="text-xl font-bold text-gray-900 mb-1">{name}</h3>
      <p className="text-green-700 font-medium mb-3">{title}</p>
      
      {/* Rating */}
      <div className="flex items-center text-yellow-500 mb-3">
        <Star className="w-5 h-5 fill-current" />
        <span className="ml-1 font-bold">{rating || '4.5'}</span>
        <span className="text-gray-500 ml-2">({review_count || 0} reviews)</span>
      </div>
      
      {/* Specializations */}
      <div className="flex flex-wrap justify-center gap-2 mb-4">
        {specializations.slice(0, 3).map((spec, index) => (
          <span
            key={spec || index}
            className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium"
          >
            {spec}
          </span>
        ))}
      </div>
      
      {/* Pricing */}
      <div className="text-lg font-semibold text-gray-800 mb-4">
        {getCurrencySymbol(currency)} {hourly_rate || '50'}/hour
      </div>
      
      {/* Book Consultation Button */}
      <button 
        onClick={() => setShowBookingModal(true)}
        className={`w-full px-4 py-2 rounded-md font-medium mb-3 transition-colors duration-200 ${
          availability_status === 'unavailable'
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-green-600 text-white hover:bg-green-700'
        }`}
        disabled={availability_status === 'unavailable'}
      >
        {availability_status === 'unavailable' ? 'Unavailable' : 'Book Consultation'}
      </button>
      
      {/* Action Buttons */}
      <div className="flex w-full gap-2">
        <button
          onClick={handleFollow}
          className={`flex-1 flex items-center justify-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
            isFollowing
              ? "bg-gray-200 text-gray-800 hover:bg-gray-300"
              : "bg-blue-100 text-blue-800 hover:bg-blue-200"
          }`}
        >
          <UserPlus className="w-4 h-4 mr-2" />
          {isFollowing ? "Following" : "Follow"}
        </button>
        <button
          onClick={handleMessage}
          className="flex-1 flex items-center justify-center px-3 py-2 rounded-md text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors duration-200"
        >
          <MessageSquare className="w-4 h-4 mr-2" />
          Message
        </button>
      </div>

      {/* Consultation Booking Modal */}
      <ConsultationBooking
        expert={expert}
        isOpen={showBookingModal}
        onClose={() => setShowBookingModal(false)}
      />
    </div>
  );
};

ExpertCard.propTypes = {
  expert: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    name: PropTypes.string,
    title: PropTypes.string,
    avatar_url: PropTypes.string,
    specializations: PropTypes.array,
    rating: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    review_count: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    hourly_rate: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    currency: PropTypes.string,
    availability_status: PropTypes.string,
  }).isRequired,
  onFollow: PropTypes.func,
  onMessage: PropTypes.func,
  isFollowing: PropTypes.bool,
};

export default ExpertCard;