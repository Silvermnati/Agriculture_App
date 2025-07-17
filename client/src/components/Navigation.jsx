import React, { useState } from 'react';
import './Navigation.css';

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleAuthClick = () => {
    setIsLoggedIn(!isLoggedIn);
  };

  return (
    <nav className="navigation">
      <div className="nav-container">
        <div className="nav-logo">
          <h2>🌾 AgriApp</h2>
        </div>
        
        {/* Mobile hamburger menu */}
        <div className="nav-hamburger" onClick={toggleMenu}>
          <span></span>
          <span></span>
          <span></span>
        </div>

        <ul className={`nav-menu ${isMenuOpen ? 'nav-menu-active' : ''}`}>
          <li className="nav-item">
            <a href="#home" className="nav-link">Home</a>
          </li>
          <li className="nav-item">
            <a href="#posts" className="nav-link">Posts</a>
          </li>
          <li className="nav-item">
            <a href="#experts" className="nav-link">Experts</a>
          </li>
          <li className="nav-item">
            <a href="#communities" className="nav-link">Communities</a>
          </li>
          {isLoggedIn && (
            <li className="nav-item">
              <a href="#profile" className="nav-link">Profile</a>
            </li>
          )}
          <li className="nav-item">
            <button 
              className={`nav-auth-btn ${isLoggedIn ? 'logout' : 'login'}`}
              onClick={handleAuthClick}
            >
              {isLoggedIn ? 'Logout' : 'Login'}
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navigation;