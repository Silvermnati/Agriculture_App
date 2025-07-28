import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { NavLink, useNavigate } from 'react-router-dom';
import { logout } from '../store/slices/authSlice';
import NotificationBell from './Notifications/NotificationBell';
import './Navigation.css';

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { user, isAuthenticated } = useSelector(state => state.auth);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const handleLogout = () => {
    dispatch(logout());
    setIsMenuOpen(false);
    navigate('/');
  };

  const handleLogin = () => {
    setIsMenuOpen(false);
    navigate('/login');
  };

  // Close menu on navigation
  useEffect(() => {
    if (isMenuOpen) {
      const unlisten = navigate((location, action) => {
        setIsMenuOpen(false);
      });
      return unlisten;
    }
  }, [isMenuOpen, navigate]);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const renderNavLinks = () => (
    <>
      <li className="nav-item">
        <NavLink to="/" className="nav-link" end>Home</NavLink>
      </li>
      <li className="nav-item">
        <NavLink to="/posts" className="nav-link">Blog</NavLink>
      </li>
      <li className="nav-item">
        <NavLink to="/experts" className="nav-link">Experts</NavLink>
      </li>
      <li className="nav-item">
        <NavLink to="/communities" className="nav-link">Communities</NavLink>
      </li>
      {user?.role === 'admin' && (
        <li className="nav-item">
          <NavLink to="/admin" className="nav-link">Admin</NavLink>
        </li>
      )}
    </>
  );

  return (
    <header className={`navigation ${isScrolled ? 'navigation--scrolled' : ''}`}>
      <div className="nav-container">
        <div className="nav-logo">
          <NavLink to="/">
            <span>🌾</span>
            AgriConnect
          </NavLink>
        </div>

        {/* Desktop Menu & Auth */}
        <nav className="nav-menu-desktop">
          <ul className="nav-menu">
            {renderNavLinks()}
          </ul>
        </nav>

        <div className="nav-auth-desktop">
          {isAuthenticated ? (
            <div className="nav-user-info">
              <NotificationBell />
              <NavLink to="/profile" className="profile-link">
                <img src={user?.avatar_url || '/default-avatar.png'} alt="Profile" className="avatar" />
                <span>{user?.first_name}</span>
              </NavLink>
              <button onClick={handleLogout} className="nav-button logout">Logout</button>
            </div>
          ) : (
            <button onClick={handleLogin} className="nav-button login">Login</button>
          )}
        </div>

        {/* Mobile Hamburger */}
        <button className={`nav-hamburger ${isMenuOpen ? 'open' : ''}`} onClick={toggleMenu} aria-label="Menu">
          <span />
          <span />
          <span />
        </button>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <nav className="nav-menu-mobile">
            <ul className="nav-menu">
              {renderNavLinks()}
            </ul>
            <div className="nav-auth">
              {isAuthenticated ? (
                <div className="nav-user-info">
                  <NavLink to="/profile" className="profile-link">
                    <img src={user?.avatar_url || '/default-avatar.png'} alt="Profile" className="avatar" />
                    <span>{user?.first_name}</span>
                  </NavLink>
                  <NotificationBell />
                  <button onClick={handleLogout} className="nav-button logout">Logout</button>
                </div>
              ) : (
                <button onClick={handleLogin} className="nav-button login">Login</button>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Navigation;
