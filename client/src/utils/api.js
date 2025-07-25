import axios from 'axios';
import { API_ENDPOINTS } from './constants';

// Create axios instance. Always use the production API URL since we don't have a local backend
const API_URL = 'https://agriculture-app-1-u2a6.onrender.com/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle token expiration
    if (error.response && error.response.status === 401) {
      // Check if the error is due to token expiration
      if (error.response.data.message === 'Token has expired') {
        // Clear local storage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Redirect to login page
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  register: (userData) => api.post(API_ENDPOINTS.AUTH.REGISTER, userData),
  login: (credentials) => api.post(API_ENDPOINTS.AUTH.LOGIN, credentials),
  getProfile: () => api.get(API_ENDPOINTS.AUTH.PROFILE),
  updateProfile: (profileData) => api.put(API_ENDPOINTS.AUTH.PROFILE, profileData),
  changePassword: (passwordData) => api.post(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, passwordData),
  getActivityStats: () => api.get(API_ENDPOINTS.AUTH.ACTIVITY_STATS)
};

// Posts API calls
export const postsAPI = {
  getPosts: (params) => {
    // Create a new params object to avoid mutating the original state
    const processedParams = { ...params };

    // Convert array values to comma-separated strings for the backend
    if (Array.isArray(processedParams.crop) && processedParams.crop.length > 0) {
      processedParams.crop = processedParams.crop.join(',');
    } else if (Array.isArray(processedParams.crop)) {
      delete processedParams.crop; // Don't send empty array
    }

    if (Array.isArray(processedParams.location) && processedParams.location.length > 0) {
      processedParams.location = processedParams.location.join(',');
    } else if (Array.isArray(processedParams.location)) {
      delete processedParams.location; // Don't send empty array
    }

    // Assuming API_ENDPOINTS.POSTS.BASE is '/posts'
    return api.get(API_ENDPOINTS.POSTS.BASE, { params: processedParams });
  },
  getPost: (postId) => api.get(`${API_ENDPOINTS.POSTS.BASE}/${postId}`),
  createPost: (postData) => {
    console.log('API createPost called with:', postData);
    const formData = new FormData();
    Object.keys(postData).forEach(key => {
      if (key === 'featured_image' && postData[key]) {
        formData.append(key, postData[key]);
        console.log(`Added file: ${key}`, postData[key]);
      } else if (Array.isArray(postData[key])) {
        // Backend expects arrays as JSON strings
        const jsonValue = JSON.stringify(postData[key]);
        formData.append(key, jsonValue);
        console.log(`Added array as JSON: ${key} = ${jsonValue}`);
      } else {
        formData.append(key, postData[key]);
        console.log(`Added field: ${key} = ${postData[key]}`);
      }
    });
    
    console.log('Making API request to:', API_ENDPOINTS.POSTS.BASE);
    console.log('Full API URL:', `${API_URL}${API_ENDPOINTS.POSTS.BASE}`);
    console.log('Environment check - import.meta.env.PROD:', import.meta.env.PROD);
    console.log('Current API_URL:', API_URL);
    
    return api.post(API_ENDPOINTS.POSTS.BASE, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  updatePost: (postId, postData) => {
    // Handle both regular data and FormData for file uploads
    if (postData.featured_image || typeof postData.related_crops === 'object') {
      const formData = new FormData();
      Object.keys(postData).forEach(key => {
        if (key === 'featured_image' && postData[key]) {
          formData.append(key, postData[key]);
        } else if (Array.isArray(postData[key])) {
          formData.append(key, JSON.stringify(postData[key]));
        } else {
          formData.append(key, postData[key]);
        }
      });
      return api.put(`${API_ENDPOINTS.POSTS.BASE}/${postId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    }
    return api.put(`${API_ENDPOINTS.POSTS.BASE}/${postId}`, postData);
  },
  deletePost: (postId) => api.delete(`${API_ENDPOINTS.POSTS.BASE}/${postId}`),
  addComment: (postId, commentData) => api.post(API_ENDPOINTS.POSTS.COMMENTS(postId), commentData),
  getComments: (postId) => api.get(API_ENDPOINTS.POSTS.COMMENTS(postId)),
  toggleLike: (postId) => api.post(API_ENDPOINTS.POSTS.LIKE(postId))
};

// Communities API calls
export const communitiesAPI = {
  getCommunities: (params) => api.get(API_ENDPOINTS.COMMUNITIES.BASE, { params }),
  getCommunity: (communityId) => api.get(`${API_ENDPOINTS.COMMUNITIES.BASE}/${communityId}`),
  createCommunity: (communityData) => api.post(API_ENDPOINTS.COMMUNITIES.BASE, communityData),
  updateCommunity: (communityId, communityData) => api.put(`${API_ENDPOINTS.COMMUNITIES.BASE}/${communityId}`, communityData),
  joinCommunity: (communityId) => api.post(API_ENDPOINTS.COMMUNITIES.JOIN(communityId)),
  getCommunityPosts: (communityId, params) => api.get(API_ENDPOINTS.COMMUNITIES.POSTS(communityId), { params }),
  createCommunityPost: (communityId, postData) => api.post(API_ENDPOINTS.COMMUNITIES.POSTS(communityId), postData),
  likeCommunityPost: (communityId, postId) => api.post(API_ENDPOINTS.COMMUNITIES.LIKE_POST(communityId, postId)),
  commentOnCommunityPost: (communityId, postId, commentData) => api.post(API_ENDPOINTS.COMMUNITIES.POST_COMMENTS(communityId, postId), commentData)
};

// Experts API calls
export const expertsAPI = {
  getExperts: (params) => api.get(API_ENDPOINTS.EXPERTS.BASE, { params }),
  getExpert: (expertId) => api.get(`${API_ENDPOINTS.EXPERTS.BASE}/${expertId}`),
  createExpertProfile: (expertData) => api.post(API_ENDPOINTS.EXPERTS.BASE, expertData),
  updateExpertProfile: (expertId, expertData) => api.put(`${API_ENDPOINTS.EXPERTS.BASE}/${expertId}`, expertData),
  bookConsultation: (consultationData) => api.post(API_ENDPOINTS.EXPERTS.CONSULTATIONS, consultationData),
  getConsultations: () => api.get(API_ENDPOINTS.EXPERTS.CONSULTATIONS)
};

// Articles API calls
export const articlesAPI = {
  getArticles: (params) => api.get(API_ENDPOINTS.ARTICLES.BASE, { params }),
  getArticle: (articleId) => api.get(`${API_ENDPOINTS.ARTICLES.BASE}/${articleId}`),
  createArticle: (articleData) => {
    const formData = new FormData();
    Object.keys(articleData).forEach(key => {
      if (key === 'featured_image' && articleData[key]) {
        formData.append(key, articleData[key]);
      } else if (Array.isArray(articleData[key])) {
        formData.append(key, JSON.stringify(articleData[key]));
      } else {
        formData.append(key, articleData[key]);
      }
    });
    return api.post(API_ENDPOINTS.ARTICLES.BASE, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  updateArticle: (articleId, articleData) => api.put(`${API_ENDPOINTS.ARTICLES.BASE}/${articleId}`, articleData),
  deleteArticle: (articleId) => api.delete(`${API_ENDPOINTS.ARTICLES.BASE}/${articleId}`)
};

// Crops API calls
export const cropsAPI = {
  getCrops: (params) => api.get(API_ENDPOINTS.CROPS.BASE, { params }),
  getCrop: (cropId) => api.get(`${API_ENDPOINTS.CROPS.BASE}/${cropId}`),
  createCrop: (cropData) => api.post(API_ENDPOINTS.CROPS.BASE, cropData),
  updateCrop: (cropId, cropData) => api.put(`${API_ENDPOINTS.CROPS.BASE}/${cropId}`, cropData),
  deleteCrop: (cropId) => api.delete(`${API_ENDPOINTS.CROPS.BASE}/${cropId}`)
};

// User Crops API calls
export const userCropsAPI = {
  getUserCrops: (params) => api.get(API_ENDPOINTS.CROPS.USER_CROPS, { params }),
  getUserCrop: (userCropId) => api.get(`${API_ENDPOINTS.CROPS.USER_CROPS}/${userCropId}`),
  createUserCrop: (cropData) => api.post(API_ENDPOINTS.CROPS.USER_CROPS, cropData),
  updateUserCrop: (userCropId, cropData) => api.put(`${API_ENDPOINTS.CROPS.USER_CROPS}/${userCropId}`, cropData),
  deleteUserCrop: (userCropId) => api.delete(`${API_ENDPOINTS.CROPS.USER_CROPS}/${userCropId}`)
};

// Locations API calls
export const locationsAPI = {
  getCountries: () => api.get(API_ENDPOINTS.LOCATIONS.COUNTRIES),
  getStates: (countryId) => api.get(API_ENDPOINTS.LOCATIONS.STATES(countryId)),
  getLocations: (params) => api.get(API_ENDPOINTS.LOCATIONS.BASE, { params }),
  createCountry: (countryData) => api.post(API_ENDPOINTS.LOCATIONS.COUNTRIES, countryData),
  createState: (stateData) => api.post(`${API_ENDPOINTS.LOCATIONS.BASE}/states`, stateData),
  createLocation: (locationData) => api.post(API_ENDPOINTS.LOCATIONS.BASE, locationData)
};

// Categories API calls
export const categoriesAPI = {
  getCategories: (params) => api.get(API_ENDPOINTS.CATEGORIES.BASE, { params }),
  getCategory: (categoryId) => api.get(`${API_ENDPOINTS.CATEGORIES.BASE}/${categoryId}`),
  createCategory: (categoryData) => api.post(API_ENDPOINTS.CATEGORIES.BASE, categoryData),
  updateCategory: (categoryId, categoryData) => api.put(`${API_ENDPOINTS.CATEGORIES.BASE}/${categoryId}`, categoryData),
  deleteCategory: (categoryId) => api.delete(`${API_ENDPOINTS.CATEGORIES.BASE}/${categoryId}`)
};

// Tags API calls
export const tagsAPI = {
  getTags: (params) => api.get(API_ENDPOINTS.TAGS.BASE, { params }),
  getTag: (tagId) => api.get(`${API_ENDPOINTS.TAGS.BASE}/${tagId}`),
  createTag: (tagData) => api.post(API_ENDPOINTS.TAGS.BASE, tagData),
  updateTag: (tagId, tagData) => api.put(`${API_ENDPOINTS.TAGS.BASE}/${tagId}`, tagData),
  deleteTag: (tagId) => api.delete(`${API_ENDPOINTS.TAGS.BASE}/${tagId}`)
};

// Reviews API calls
export const reviewsAPI = {
  getReviews: (params) => api.get(API_ENDPOINTS.REVIEWS.BASE, { params }),
  getReview: (reviewId) => api.get(`${API_ENDPOINTS.REVIEWS.BASE}/${reviewId}`),
  createReview: (reviewData) => api.post(API_ENDPOINTS.REVIEWS.BASE, reviewData),
  updateReview: (reviewId, reviewData) => api.put(`${API_ENDPOINTS.REVIEWS.BASE}/${reviewId}`, reviewData),
  deleteReview: (reviewId) => api.delete(`${API_ENDPOINTS.REVIEWS.BASE}/${reviewId}`)
};

// File upload API calls
export const uploadAPI = {
  uploadFile: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post(API_ENDPOINTS.UPLOAD.BASE, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }
};

export default api;