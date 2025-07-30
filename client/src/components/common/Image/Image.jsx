import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { getFallbackImage, getOptimizedImageUrl } from '../../../utils/imageHelpers';
import './Image.css';

const Image = ({ 
  src, 
  alt, 
  className = '', 
  fallbackSrc = null,
  fallbackType = 'post',
  placeholder = null,
  optimize = true,
  onLoad = () => {},
  onError = () => {},
  ...props 
}) => {
  // Optimize the source URL if requested
  const optimizedSrc = optimize && src ? getOptimizedImageUrl(src) : src;
  
  const [imageState, setImageState] = useState({
    loading: true,
    error: false,
    currentSrc: optimizedSrc
  });

  const handleImageLoad = () => {
    setImageState(prev => ({ ...prev, loading: false, error: false }));
    onLoad();
  };

  const handleImageError = () => {
    const nextFallback = fallbackSrc || getFallbackImage(fallbackType);
    
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
    <div className={`image-container ${className}`}>
      {imageState.loading && (
        <div className="image-loading">
          <div className="image-loading-spinner"></div>
        </div>
      )}
      
      {imageState.error && placeholder ? (
        <div className="image-placeholder">
          {placeholder}
        </div>
      ) : (
        <img
          src={imageState.currentSrc}
          alt={alt}
          className={`image ${imageState.loading ? 'image-loading-state' : ''}`}
          onLoad={handleImageLoad}
          onError={handleImageError}
          {...props}
        />
      )}
    </div>
  );
};

Image.propTypes = {
  src: PropTypes.string,
  alt: PropTypes.string.isRequired,
  className: PropTypes.string,
  fallbackSrc: PropTypes.string,
  fallbackType: PropTypes.string,
  placeholder: PropTypes.node,
  optimize: PropTypes.bool,
  onLoad: PropTypes.func,
  onError: PropTypes.func
};

export default Image;