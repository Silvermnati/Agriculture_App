import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
  return (
    <div className="home-page">
      <section className="hero-section">
        <div className="hero-content">
          <h1>Welcome to Agricultural Super App</h1>
          <p className="hero-subtitle">
            Connect with agricultural experts, share knowledge, and grow together
          </p>
          <div className="hero-buttons">
            <Link to="/register" className="btn btn-primary">
              Join the Community
            </Link>
            <Link to="/posts" className="btn btn-secondary">
              Explore Content
            </Link>
          </div>
        </div>
      </section>
      
      <section className="features-section">
        <h2 className="section-title">Why Join Our Agricultural Community?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🌱</div>
            <h3>Expert Knowledge</h3>
            <p>
              Access agricultural expertise and best practices from professionals
              around the world.
            </p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">👨‍🌾</div>
            <h3>Connect with Farmers</h3>
            <p>
              Build relationships with other farmers facing similar challenges
              and share solutions.
            </p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Track Progress</h3>
            <p>
              Monitor your farming activities, track crop growth, and analyze
              results over time.
            </p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">🌍</div>
            <h3>Location-Based Insights</h3>
            <p>
              Get recommendations and advice specific to your region and growing
              conditions.
            </p>
          </div>
        </div>
      </section>
      
      <section className="cta-section">
        <div className="cta-content">
          <h2>Ready to grow with us?</h2>
          <p>
            Join thousands of farmers and agricultural experts already using our
            platform to share knowledge and improve farming practices.
          </p>
          <Link to="/register" className="btn btn-primary btn-large">
            Get Started Now
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;