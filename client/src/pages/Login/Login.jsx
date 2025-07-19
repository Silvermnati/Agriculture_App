import React from 'react';
import LoginForm from '../../components/Auth/LoginForm';
import './Login.css';

const Login = () => {
  return (
    <div className="login-page">
      <div className="login-content">
        <div className="login-info">
          <h1>Welcome to Agricultural Super App</h1>
          <p>Connect with agricultural experts, share knowledge, and grow together.</p>
          <div className="login-features">
            <div className="feature">
              <span className="feature-icon">🌱</span>
              <span className="feature-text">Access expert agricultural knowledge</span>
            </div>
            <div className="feature">
              <span className="feature-icon">👨‍🌾</span>
              <span className="feature-text">Connect with other farmers</span>
            </div>
            <div className="feature">
              <span className="feature-icon">📊</span>
              <span className="feature-text">Share farming experiences</span>
            </div>
            <div className="feature">
              <span className="feature-icon">🌍</span>
              <span className="feature-text">Join agricultural communities</span>
            </div>
          </div>
        </div>
        <div className="login-form-wrapper">
          <LoginForm />
        </div>
      </div>
    </div>
  );
};

export default Login;