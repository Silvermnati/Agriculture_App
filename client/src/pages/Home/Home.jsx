import React from 'react';
import { useSelector } from 'react-redux';
import './Home.css';

const Home = () => {
  const { user, isAuthenticated } = useSelector(state => state.auth);
  
  return (
    <div className="home-page">
      <div className="hero-section">
        <div className="hero-content">
          <h1>Welcome to Agricultural Super App</h1>
          <p>Connect with agricultural experts, share knowledge, and grow together.</p>
          
          {!isAuthenticated && (
            <div className="hero-buttons">
              <a href="/register" className="btn btn-primary">Get Started</a>
              <a href="/login" className="btn btn-secondary">Login</a>
            </div>
          )}
        </div>
      </div>
      
      {isAuthenticated && (
        <div className="welcome-section">
          <h2>Welcome back, {user.first_name}!</h2>
          <div className="user-info">
            <div className="user-role">
              <span className="role-badge">{user.role}</span>
              {user.role === 'farmer' && (
                <span className="farming-type">{user.farming_type} farming</span>
              )}
            </div>
          </div>
        </div>
      )}
      
      <div className="features-section">
        <h2>Agricultural Knowledge at Your Fingertips</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🌱</div>
            <h3>Expert Knowledge</h3>
            <p>Access agricultural expertise and best practices from professionals.</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">👥</div>
            <h3>Community Support</h3>
            <p>Connect with other farmers facing similar challenges.</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">📝</div>
            <h3>Agricultural Blog</h3>
            <p>Read and share articles about farming techniques and experiences.</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">💬</div>
            <h3>Direct Messaging</h3>
            <p>Chat directly with agricultural experts for personalized advice.</p>
          </div>
        </div>
      </div>
      
      <div className="cta-section">
        <h2>Ready to grow with us?</h2>
        <p>Join thousands of farmers and agricultural experts on our platform.</p>
        {!isAuthenticated && (
          <a href="/register" className="btn btn-primary">Join Now</a>
        )}
      </div>
    </div>
  );
};

export default Home;