import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { logout } from '../store/slices/authSlice';
import NotificationBell from './Notifications/NotificationBell';
import './Navigation.css';

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const dispatch = useDispatch();
  
  // Get authentication state from Redux
  const { user, isAuthenticated } = useSelector(state => state.auth);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const navigate = useNavigate();
  
  const handleAuthClick = () => {
    if (isAuthenticated) {
      dispatch(logout());
    } else {
      // Navigate to login page
      navigate('/login');
    }
  };

  return (
    <nav className="navigation">
      <div className="nav-container">
        <div className="nav-logo">
          <Link to="/" className="logo-link">
            <h2>🌾 AgriApp</h2>
          </Link>
        </div>
        
        {/* Mobile hamburger menu */}
        <div className="nav-hamburger" onClick={toggleMenu}>
          <span></span>
          <span></span>
          <span></span>
        </div>

        <ul className={`nav-menu ${isMenuOpen ? 'nav-menu-active' : ''}`}>
          <li className="nav-item">
            <Link to="/" className="nav-link">Home</Link>
          </li>
          <li className="nav-item">
            <Link to="/posts" className="nav-link">Posts</Link>
          </li>
          <li className="nav-item">
            <Link to="/experts" className="nav-link">Experts</Link>
          </li>
          <li className="nav-item">
            <Link to="/communities" className="nav-link">Communities</Link>
          </li>
          
          {isAuthenticated && (
            <>
              <li className="nav-item">
                <Link to="/profile" className="nav-link">Profile</Link>
              </li>
              <li className="nav-item">
                <NotificationBell />
              </li>
              {user?.role === 'admin' && (
                <li className="nav-item">
                  <Link to="/admin" className="nav-link">Admin</Link>
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