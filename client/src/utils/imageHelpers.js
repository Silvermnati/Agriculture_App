/**
 * Image utility functions for handling image URLs and fallbacks
 */

// Default fallback images from Unsplash (agricultural themed)
export const DEFAULT_IMAGES = {
  post: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=400&h=300&fit=crop&crop=center',
  postLarge: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=800&h=600&fit=crop&crop=center',
  avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
  profile: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face',
  community: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400&h=300&fit=crop&crop=center',
  expert: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face',
  farm: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=400&h=300&fit=crop&crop=center',
  crops: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop&crop=center'
};

/**
 * Get appropriate fallback image based on context
 * @param {string} type - Type of image (post, avatar, profile, etc.)
 * @param {string} size - Size variant (small, medium, large)
 * @returns {string} - Fallback image URL
 */
export const getFallbackImage = (type = 'post', size = 'medium') => {
  const baseImage = DEFAULT_IMAGES[type] || DEFAULT_IMAGES.post;
  
  // Adjust size parameters in the URL
  if (size === 'small') {
    return baseImage.replace(/w=\d+&h=\d+/, 'w=200&h=150');
  } else if (size === 'large') {
    return baseImage.replace(/w=\d+&h=\d+/, 'w=800&h=600');
  }
  
  return baseImage;
};

/**
 * Check if an image URL is valid and accessible
 * @param {string} url - Image URL to check
 * @returns {Promise<boolean>} - Promise that resolves to true if image is accessible
 */
export const isImageAccessible = (url) => {
  return new Promise((resolve) => {
    if (!url) {
      resolve(false);
      return;
    }
    
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
    
    // Timeout after 5 seconds
    setTimeout(() => resolve(false), 5000);
  });
};

/**
 * Get optimized image URL with proper dimensions
 * @param {string} url - Original image URL
 * @param {Object} options - Optimization options
 * @returns {string} - Optimized image URL
 */
export const getOptimizedImageUrl = (url, options = {}) => {
  const { width = 400, height = 300, quality = 80, format = 'auto' } = options;
  
  if (!url) return null;
  
  // If it's already an optimized URL (contains w= and h=), return as is
  if (url.includes('w=') && url.includes('h=')) {
    return url;
  }
  
  // If it's an Unsplash URL, add optimization parameters
  if (url.includes('unsplash.com')) {
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}w=${width}&h=${height}&fit=crop&crop=center&q=${quality}&fm=${format}`;
  }
  
  // For other URLs, return as is (could be extended to support other CDNs)
  return url;
};

/**
 * Generate placeholder image with text
 * @param {Object} options - Placeholder options
 * @returns {string} - Data URL for placeholder image
 */
export const generatePlaceholder = (options = {}) => {
  const { 
    width = 400, 
    height = 300, 
    text = 'Loading...', 
    backgroundColor = '#f3f4f6',
    textColor = '#6b7280'
  } = options;
  
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  
  const ctx = canvas.getContext('2d');
  
  // Fill background
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, width, height);
  
  // Add text
  ctx.fillStyle = textColor;
  ctx.font = `${Math.min(width, height) / 10}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, width / 2, height / 2);
  
  return canvas.toDataURL();
};

/**
 * Extract dominant color from image (simplified version)
 * @param {string} imageUrl - Image URL
 * @returns {Promise<string>} - Promise that resolves to hex color
 */
export const extractDominantColor = (imageUrl) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        canvas.width = img.width;
        canvas.height = img.height;
        
        ctx.drawImage(img, 0, 0);
        
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        let r = 0, g = 0, b = 0;
        const pixelCount = data.length / 4;
        
        for (let i = 0; i < data.length; i += 4) {
          r += data[i];
          g += data[i + 1];
          b += data[i + 2];
        }
        
        r = Math.floor(r / pixelCount);
        g = Math.floor(g / pixelCount);
        b = Math.floor(b / pixelCount);
        
        const hex = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
        resolve(hex);
      } catch (error) {
        resolve('#f3f4f6'); // Default gray
      }
    };
    
    img.onerror = () => resolve('#f3f4f6');
    img.src = imageUrl;
  });
};

/**
 * Preload images for better performance
 * @param {Array<string>} urls - Array of image URLs to preload
 * @returns {Promise<Array>} - Promise that resolves when all images are loaded
 */
export const preloadImages = (urls) => {
  const promises = urls.map(url => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve({ url, success: true });
      img.onerror = () => resolve({ url, success: false });
      img.src = url;
    });
  });
  
  return Promise.all(promises);
};

/**
 * Get responsive image sources for different screen sizes
 * @param {string} baseUrl - Base image URL
 * @returns {Object} - Object with different size variants
 */
export const getResponsiveImageSources = (baseUrl) => {
  if (!baseUrl) return {};
  
  return {
    small: getOptimizedImageUrl(baseUrl, { width: 300, height: 200 }),
    medium: getOptimizedImageUrl(baseUrl, { width: 600, height: 400 }),
    large: getOptimizedImageUrl(baseUrl, { width: 1200, height: 800 }),
    thumbnail: getOptimizedImageUrl(baseUrl, { width: 150, height: 150 })
  };
};