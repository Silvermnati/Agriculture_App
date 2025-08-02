import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { getFallbackImage, getOptimizedImageUrl, getFullImageUrl } from '../../../utils/imageHelpers';


const CustomImage = ({ 
  src, 
  alt = 'Image', 
  className = '', 
  width,
  height,
  fallbackSrc = null,
  fallbackType = 'post',
  placeholder = null,
  optimize = true,
  onLoad = () => {},
  onError = () => {},
  ...props 
}) => {
  // Convert relative URLs to full URLs first, then optimize if requested
  const fullSrc = getFullImageUrl(src);
  const optimizedSrc = optimize && fullSrc ? getOptimizedImageUrl(fullSrc, { width, height }) : fullSrc;
  
  // If there's no source URL, immediately use fallback
  const initialSrc = optimizedSrc || (fallbackSrc ? getFullImageUrl(fallbackSrc) : getFallbackImage(fallbackType));
  
  const [imageState, setImageState] = useState({
    loading: !!optimizedSrc, // Only show loading if we have a source to load
    error: false,
    currentSrc: initialSrc
  });

  const handleImageLoad = () => {
    setImageState(prev => ({ ...prev, loading: false, error: false }));
    onLoad();
  };

  const handleImageError = () => {
    const nextFallback = fallbackSrc ? getFullImageUrl(fallbackSrc) : getFallbackImage(fallbackType);
    
    if (imageState.currentSrc !== nextFallback) {
      // Try fallback image
      setImageState(prev => ({ 
        ...prev, 
        currentSrc: nextFallback,
        loading: true,
        error: false 
      }));
    } else {
      // Fallback also failed, show error state
      setImageState(prev => ({ ...prev, loading: false, error: true }));
    }
    onError();
  };

  if (imageState.error && !placeholder) {
    return (
      <div className={`image-error ${className}`} {...props}>
        <div className="image-error-content">
          <span className="image-error-icon">🖼️</span>
          <span className="image-error-text">Image not available</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative w-full h-full block bg-gray-100 overflow-hidden ${className}`}>
      {imageState.loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-10">
          <div className="w-8 h-8 border-4 border-t-green-500 border-gray-200 rounded-full animate-spin"></div>
        </div>
      )}
      
      {imageState.error && placeholder ? (
        <div className="w-full h-full flex items-center justify-center">
          {placeholder}
        </div>
      ) : (
        <img
          src={imageState.currentSrc}
          alt={alt}
          className={`w-full h-full object-cover object-center block ${imageState.loading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
          onLoad={handleImageLoad}
          onError={handleImageError}
          {...props}
        />
      )}
    </div>
  );
};

CustomImage.propTypes = {
  src: PropTypes.string,
  alt: PropTypes.string,
  className: PropTypes.string,
  fallbackSrc: PropTypes.string,
  fallbackType: PropTypes.string,
  placeholder: PropTypes.node,
  optimize: PropTypes.bool,
  onLoad: PropTypes.func,
  onError: PropTypes.func
};

export default CustomImage;