import axios from 'axios';
import { API_ENDPOINTS } from './constants';

// Create axios instance with base URL
const API_URL = 'http://localhost:5001/api';

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
  changePassword: (passwordData) => api.post(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, passwordData)
};

// Posts API calls
export const postsAPI = {
  getPosts: (params) => api.get(API_ENDPOINTS.POSTS.BASE, { params }),
  getPost: (postId) => api.get(`${API_ENDPOINTS.POSTS.BASE}/${postId}`),
  createPost: (postData) => api.post(API_ENDPOINTS.POSTS.BASE, postData),
  updatePost: (postId, postData) => api.put(`${API_ENDPOINTS.POSTS.BASE}/${postId}`, postData),
  deletePost: (postId) => api.delete(`${API_ENDPOINTS.POSTS.BASE}/${postId}`),
  addComment: (postId, commentData) => api.post(API_ENDPOINTS.POSTS.COMMENTS(postId), commentData),
  toggleLike: (postId) => api.post(API_ENDPOINTS.POSTS.LIKE(postId))
};

// Communities API calls
export const communitiesAPI = {
  getCommunities: (params) => api.get(API_ENDPOINTS.COMMUNITIES.BASE, { params }),
  getCommunity: (communityId) => api.get(`${API_ENDPOINTS.COMMUNITIES.BASE}/${communityId}`),
  createCommunity: (communityData) => api.post(API_ENDPOINTS.COMMUNITIES.BASE, communityData),
  joinCommunity: (communityId) => api.post(API_ENDPOINTS.COMMUNITIES.JOIN(communityId)),
  getCommunityPosts: (communityId, params) => api.get(API_ENDPOINTS.COMMUNITIES.POSTS(communityId), { params })
};

// Experts API calls
export const expertsAPI = {
  getExperts: (params) => api.get(API_ENDPOINTS.EXPERTS.BASE, { params }),
  getExpert: (expertId) => api.get(`${API_ENDPOINTS.EXPERTS.BASE}/${expertId}`),
  bookConsultation: (consultationData) => api.post(API_ENDPOINTS.EXPERTS.CONSULTATIONS, consultationData)
};

export default api;