import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider, useSelector } from 'react-redux';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ExpertsPage from './pages/Experts/ExpertsPage';
import NotificationSettings from './pages/Notifications/NotificationSettings';
import NotificationHistory from './pages/Notifications/NotificationHistory';
import AdminLogin from './pages/Admin/AdminLogin';
import AdminDashboard from './pages/Admin/AdminDashboard';

import store from './store';
import Layout from './components/Layout/Layout';
import Login from './pages/Login/Login';
import Register from './pages/Register/Register';
import Home from './pages/Home/Home';
import CommunitiesPage from './pages/Communities/CommunitiesPage';
import CommunityDetailPage from './pages/Communities/CommunityDetailPage';
import CreatePostPage from './pages/posts/CreatePostPage';
import PostDetailPage from './pages/posts/PostDetailPage';
import PostsPage from './pages/posts/PostsPage';
import ProfilePage from './pages/Profile/ProfilePage';
// import websocketService from './services/websocketService'; // Temporarily disabled

import './App.css';

// Create a separate component for routes that needs access to Redux state
const AppRoutes = () => {
  // Get authentication state from Redux store
  const { isAuthenticated, user } = useSelector(state => state.auth);

  useEffect(() => {
    if (isAuthenticated && user) {
      // Temporarily disable WebSocket to focus on core functionality
      console.log('User authenticated, WebSocket disabled for debugging');
      
      // TODO: Re-enable WebSocket once backend supports it
      // const token = localStorage.getItem('token');
      // if (token) {
      //   try {
      //     websocketService.connect(token);
      //     // ... WebSocket setup code
      //   } catch (error) {
      //     console.log('WebSocket connection failed, continuing without real-time features:', error);
      //   }
      // }
    }
  }, [isAuthenticated, user]);

  return (
    <Layout>
      <Routes>
        {/* Redirect to login if not authenticated, otherwise show home page */}
        <Route path="/" element={isAuthenticated ? <Home /> : <Navigate to="/login" />} />
        <Route path="/login" element={isAuthenticated ? <Navigate to="/" /> : <Login />} />
        <Route path="/register" element={isAuthenticated ? <Navigate to="/" /> : <Register />} />
        
        {/* Communities routes */}
        <Route path="/communities" element={isAuthenticated ? <CommunitiesPage /> : <Navigate to="/login" />} />
        <Route path="/communities/:communityId" element={isAuthenticated ? <CommunityDetailPage /> : <Navigate to="/login" />} />

        <Route path="/experts" element={isAuthenticated ? <ExpertsPage /> : <Navigate to="/login" />} />

        {/* Posts routes */}
        <Route path="/posts" element={isAuthenticated ? <PostsPage /> : <Navigate to="/login" />} />
        <Route path="/posts/:postId" element={isAuthenticated ? <PostDetailPage /> : <Navigate to="/login" />} />
        <Route path="/create-post" element={isAuthenticated ? <CreatePostPage /> : <Navigate to="/login" />} />
        
        {/* Profile and Settings routes */}
        <Route path="/profile" element={isAuthenticated ? <ProfilePage /> : <Navigate to="/login" />} />
        <Route path="/profile/:userId" element={isAuthenticated ? <ProfilePage /> : <Navigate to="/login" />} />
        <Route path="/notifications" element={isAuthenticated ? <NotificationSettings /> : <Navigate to="/login" />} />
        <Route path="/notifications/history" element={isAuthenticated ? <NotificationHistory /> : <Navigate to="/login" />} />
        
        {/* Admin routes */}
        <Route path="/admin" element={<Navigate to="/admin/login" />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
      </Routes>
    </Layout>
  );
};

function App() {
  return (
    <Provider store={store}>
      <Router>
        <AppRoutes />
        <ToastContainer position="top-right" autoClose={3000} />
      </Router>
    </Provider>
  );
}

export default App;
