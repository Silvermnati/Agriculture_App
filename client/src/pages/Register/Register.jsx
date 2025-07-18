import React from 'react';
import RegisterForm from '../../components/Auth/RegisterForm';
import './Register.css';

const Register = () => {
  return (
    <div className="register-page">
      <div className="register-content">
        <div className="register-info">
          <h1>Join Our Agricultural Community</h1>
          <p>Create an account to connect with agricultural experts, share knowledge, and grow together.</p>
          <div className="register-benefits">
            <div className="benefit">
              <span className="benefit-icon">🌾</span>
              <div className="benefit-content">
                <h3>Expert Knowledge</h3>
                <p>Access agricultural expertise and best practices from professionals.</p>
              </div>
            </div>
            <div className="benefit">
              <span className="benefit-icon">👥</span>
              <div className="benefit-content">
                <h3>Community Support</h3>
                <p>Connect with other farmers facing similar challenges.</p>
              </div>
            </div>
            <div className="benefit">
              <span className="benefit-icon">📱</span>
              <div className="benefit-content">
                <h3>Mobile Access</h3>
                <p>Access agricultural information anytime, anywhere.</p>
              </div>
            </div>
          </div>
        </div>
        <div className="register-form-wrapper">
          <RegisterForm />
        </div>
      </div>
    </div>
  );
};

export default Register;