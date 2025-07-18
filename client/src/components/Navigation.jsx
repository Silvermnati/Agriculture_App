import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import './Navigation.css';

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const dispatch = useDispatch();
  
  // Get authentication state from Redux
  const { user, isAuthenticated } = useSelector(state => state.auth);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleAuthClick = () => {
    if (isAuthenticated) {
      dispatch(logout());
    } else {
      // Navigate to login page
      window.location.href = '/login';
    }
  };

  return (
    <nav className="navigation">
      <div className="nav-container">
        <div className="nav-logo">
          <a href="/" className="logo-link">
            <h2>🌾 AgriApp</h2>
          </a>
        </div>
        
        {/* Mobile hamburger menu */}
        <div className="nav-hamburger" onClick={toggleMenu}>
          <span></span>
          <span></span>
          <span></span>
        </div>

        <ul className={`nav-menu ${isMenuOpen ? 'nav-menu-active' : ''}`}>
          <li className="nav-item">
            <a href="/" className="nav-link">Home</a>
          </li>
          <li className="nav-item">
            <a href="/posts" className="nav-link">Posts</a>
          </li>
          <li className="nav-item">
            <a href="/experts" className="nav-link">Experts</a>
          </li>
          <li className="nav-item">
            <a href="/communities" className="nav-link">Communities</a>
          </li>
          
          {isAuthenticated && (
            <>
              <li className="nav-item">
                <a href="/profile" className="nav-link">Profile</a>
              </li>
              {user?.role === 'admin' && (
                <li className="nav-item">
                  <a href="/admin" className="nav-link">Admin</a>
                </li>
              )}
            </>
          )}
          
          <li className="nav-item">
            <button 
              className={`nav-auth-btn ${isAuthenticated ? 'logout' : 'login'}`}
              onClick={handleAuthClick}
            >
              {isAuthenticated ? 'Logout' : 'Login'}
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navigation;