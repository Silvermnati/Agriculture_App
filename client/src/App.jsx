import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider, useSelector } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ExpertsPage from './pages/Experts/ExpertsPage';

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

import './App.css';

// Create a separate component for routes that needs access to Redux state
const AppRoutes = () => {
  // Get authentication state from Redux store
  const { isAuthenticated } = useSelector(state => state.auth);

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
