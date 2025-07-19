import React, { useState } from "react";
import { Crop, CloudRain, MapPin, Calendar } from "lucide-react";

const PostContent = ({ title, content, images, tags, crops, season, location }) => {
  const [expandedImage, setExpandedImage] = useState(null);

  // Function to determine tag icon based on tag content
  const getTagIcon = (tag) => {
    const lowerTag = tag.toLowerCase();
    if (lowerTag.includes('crop') || lowerTag.includes('corn') || lowerTag.includes('wheat') || 
        lowerTag.includes('rice') || lowerTag.includes('farm')) {
      return <Crop className="w-3 h-3 mr-1" />;
    } else if (lowerTag.includes('rain') || lowerTag.includes('season') || 
               lowerTag.includes('winter') || lowerTag.includes('summer') || 
               lowerTag.includes('spring') || lowerTag.includes('fall')) {
      return <CloudRain className="w-3 h-3 mr-1" />;
    } else if (lowerTag.includes('location') || lowerTag.includes('region') || 
               lowerTag.includes('area') || lowerTag.includes('zone')) {
      return <MapPin className="w-3 h-3 mr-1" />;
    } else {
      return null;
    }
  };

  // Function to handle image click for expanded view
  const handleImageClick = (image) => {
    setExpandedImage(image);
  };

  // Function to close expanded image
  const closeExpandedImage = () => {
    setExpandedImage(null);
  };

  // Function to format content with line breaks
  const formatContent = (text) => {
    return text.split('\n').map((line, i) => (
      <React.Fragment key={i}>
        {line}
        {i < text.split('\n').length - 1 && <br />}
      </React.Fragment>
    ));
  };

  return (
    <div className="mb-4">
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      )}
      
      <p className="text-gray-700 mb-3">{formatContent(content)}</p>

      {/* Agricultural context section */}
      {(crops || season || location) && (
        <div className="flex flex-wrap gap-2 mb-3 bg-green-50 p-2 rounded-md">
          {crops && crops.length > 0 && (
            <div className="flex items-center text-sm text-green-800">
              <Crop className="w-4 h-4 mr-1" />
              <span>Crops: {crops.join(', ')}</span>
            </div>
          )}
          
          {season && (
            <div className="flex items-center text-sm text-green-800">
              <Calendar className="w-4 h-4 mr-1" />
              <span>Season: {season}</span>
            </div>
          )}
          
          {location && (
            <div className="flex items-center text-sm text-green-800">
              <MapPin className="w-4 h-4 mr-1" />
              <span>Location: {location}</span>
            </div>
          )}
        </div>
      )}

      {/* Images section with responsive grid and click to expand */}
      {images && images.length > 0 && (
        <div className={`grid ${images.length === 1 ? 'grid-cols-1' : images.length === 2 ? 'grid-cols-2' : 'grid-cols-3'} gap-2 mb-3`}>
          {images.map((image, index) => (
            <div 
              key={index} 
              className="relative cursor-pointer overflow-hidden rounded-lg"
              onClick={() => handleImageClick(image)}
            >
              <img
                src={image}
                alt={`Post image ${index + 1}`}
                className="rounded-lg object-cover h-48 w-full transition-transform hover:scale-105"
                loading="lazy" // Add lazy loading for better performance
              />
              {images.length > 3 && index === 2 && images.length - 3 > 0 && (
                <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center rounded-lg">
                  <span className="text-white text-xl font-semibold">+{images.length - 3} more</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Tags section with icons */}
      {tags && tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm flex items-center"
            >
              {getTagIcon(tag)}
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Expanded image modal */}
      {expandedImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={closeExpandedImage}
        >
          <div className="relative max-w-4xl max-h-full">
            <img 
              src={expandedImage} 
              alt="Expanded view" 
              className="max-h-[90vh] max-w-full object-contain rounded-lg"
            />
            <button 
              className="absolute top-2 right-2 bg-black bg-opacity-50 text-white rounded-full p-1"
              onClick={closeExpandedImage}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostContent;