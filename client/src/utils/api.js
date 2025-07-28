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
      config.headers.Authorization = `Bearer ${token}`;
      console.log('API: Adding token to request:', token.substring(0, 20) + '...');
    } else {
      console.warn('API: No token found in localStorage');
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
    console.error('API Error:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      const errorCode = error.response?.data?.error?.code;
      const errorMessage = error.response?.data?.error?.message || error.response?.data?.message;
      
      if (errorCode === 'TOKEN_EXPIRED' || errorCode === 'INVALID_TOKEN' || errorMessage === 'Token has expired') {
        console.warn('Token expired or invalid, clearing auth data');
        
        // Clear auth data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Show user-friendly message
        alert('Your session has expired. Please log in again.');
        
        // Redirect to login
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  register: (userData) => {
    console.log('API: Registering user with data:', userData);
    return api.post(API_ENDPOINTS.AUTH.REGISTER, userData)
      .then(response => {
        console.log('API: Registration response:', response);
        return response;
      })
      .catch(error => {
        console.error('API: Registration error:', error);
        console.error('API: Error response:', error.response?.data);
        console.error('API: Error details:', JSON.stringify(error.response?.data, null, 2));
        throw error;
      });
  },
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
  addComment: (postId, commentData) => {
    console.log('API: Adding comment to post:', postId, 'with data:', commentData);
    console.log('API: Token in localStorage:', localStorage.getItem('token') ? 'Present' : 'Missing');
    return api.post(API_ENDPOINTS.POSTS.COMMENTS(postId), commentData);
  },
  getComments: (postId) => api.get(API_ENDPOINTS.POSTS.COMMENTS(postId)),
  toggleLike: (postId) => api.post(API_ENDPOINTS.POSTS.LIKE(postId)),
  deleteComment: (commentId) => api.delete(API_ENDPOINTS.COMMENTS.DELETE(commentId))
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

// Payments API calls
export const paymentsAPI = {
  initiatePayment: (paymentData) => api.post(API_ENDPOINTS.PAYMENTS.INITIATE, paymentData),
  getPaymentStatus: (paymentId) => api.get(API_ENDPOINTS.PAYMENTS.STATUS(paymentId)),
  getPaymentHistory: (params) => api.get(API_ENDPOINTS.PAYMENTS.HISTORY, { params }),
  requestRefund: (paymentId, refundData) => api.post(API_ENDPOINTS.PAYMENTS.REFUND(paymentId), refundData)
};

// Notifications API calls
export const notificationsAPI = {
  getNotifications: (params) => api.get(API_ENDPOINTS.NOTIFICATIONS.BASE, { params }),
  markAsRead: (notificationIds) => api.post(API_ENDPOINTS.NOTIFICATIONS.MARK_READ, { notification_ids: notificationIds }),
  getPreferences: () => api.get(API_ENDPOINTS.NOTIFICATIONS.PREFERENCES),
  updatePreferences: (preferences) => api.put(API_ENDPOINTS.NOTIFICATIONS.PREFERENCES, preferences),
  getHistory: (params) => api.get(API_ENDPOINTS.NOTIFICATIONS.HISTORY, { params })
};

// Follow API calls
export const followAPI = {
  followUser: (userId) => api.post(API_ENDPOINTS.FOLLOW.FOLLOW_USER(userId)),
  unfollowUser: (userId) => api.delete(API_ENDPOINTS.FOLLOW.FOLLOW_USER(userId)),
  getFollowers: (userId, params) => api.get(API_ENDPOINTS.FOLLOW.FOLLOWERS(userId), { params }),
  getFollowing: (userId, params) => api.get(API_ENDPOINTS.FOLLOW.FOLLOWING(userId), { params })
};

// Comments API calls
export const commentsAPI = {
  editComment: (commentId, commentData) => api.put(API_ENDPOINTS.COMMENTS.EDIT(commentId), commentData),
  deleteComment: (commentId) => api.delete(API_ENDPOINTS.COMMENTS.DELETE(commentId)),
  getEditHistory: (commentId) => api.get(API_ENDPOINTS.COMMENTS.EDIT_HISTORY(commentId))
};

// Admin API calls
export const adminAPI = {
  // Users management
  getAllUsers: (params) => api.get('/admin/users', { params }),
  getUserById: (userId) => api.get(`/admin/users/${userId}`),
  updateUserStatus: (userId) => api.patch(`/admin/users/${userId}/status`),
  deleteUser: (userId) => api.delete(`/admin/users/${userId}`),
  
  // Analytics and stats
  getStats: () => api.get('/admin/stats'),
  getRecentActivity: (params) => api.get('/admin/activity', { params }),
  
  // Posts management (using existing posts API with admin privileges)
  getAllPosts: (params) => api.get('/posts', { params }),
  updatePostStatus: (postId, status) => api.patch(`/posts/${postId}/status`, { status }),
  
  // Communities management (using existing communities API)
  getAllCommunities: (params) => api.get('/communities', { params }),
  
  // System management
  getSystemHealth: () => api.get('/health')
};

export default api;