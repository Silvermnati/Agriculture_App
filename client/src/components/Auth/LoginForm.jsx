import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { login, reset } from '../../store/slices/authSlice';
import './Auth.css';

const LoginForm = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isLoading, isError, isSuccess, message } = useSelector((state) => state.auth);

  useEffect(() => {
    // Redirect to home page if login is successful
    if (isSuccess) {
      const timer = setTimeout(() => {
        navigate('/');
      }, 1500); // Redirect after 1.5 seconds to show success message
      
      return () => clearTimeout(timer);
    }
    
    // Reset auth state when component unmounts
    return () => {
      dispatch(reset());
    };
  }, [isSuccess, dispatch, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(login(formData));
  };

  // Quick login with demo accounts
  const handleQuickLogin = (email) => {
    // For demo purposes, we'll use the known password for test accounts
    const demoData = {
      email,
      password: 'securepassword' // This should match the password in the test database
    };
    dispatch(login(demoData));
  };

  return (
    <div className="auth-form-container">
      <h2>Login to Agricultural Super App</h2>
      <p className="auth-subtitle">Connect with agricultural experts and share knowledge</p>
      
      {isError && <div className="auth-error">{message}</div>}
      {isSuccess && <div className="auth-success">Login successful!</div>}
      
      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <div className="password-input">
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
            />
            <button 
              type="button" 
              className="toggle-password"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>
        
        <button 
          type="submit" 
          className="auth-button"
          disabled={isLoading}
        >
          {isLoading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      
      <div className="auth-links">
        <p>Don't have an account? <a href="/register">Register</a></p>
        <p><a href="/forgot-password">Forgot password?</a></p>
      </div>
      
      <div className="auth-demo">
        <p>Quick login with demo accounts:</p>
        <div className="demo-buttons">
          <button 
            onClick={() => handleQuickLogin('farmer@example.com')}
            className="demo-button farmer"
            disabled={isLoading}
          >
            Login as Farmer
          </button>
          <button 
            onClick={() => handleQuickLogin('expert@example.com')}
            className="demo-button expert"
            disabled={isLoading}
          >
            Login as Expert
          </button>
        </div>
        <div className="demo-buttons">
          <button 
            onClick={() => handleQuickLogin('supplier@example.com')}
            className="demo-button supplier"
            disabled={isLoading}
          >
            Login as Supplier
          </button>
          <button 
            onClick={() => handleQuickLogin('admin@example.com')}
            className="demo-button admin"
            disabled={isLoading}
          >
            Login as Admin
          </button>
        </div>
        <div className="demo-accounts">
          <p className="demo-note">
            <small>Available demo accounts:</small>
          </p>
          <ul className="demo-account-list">
            <li><strong>Farmer:</strong> farmer@example.com</li>
            <li><strong>Expert:</strong> expert@example.com</li>
            <li><strong>Supplier:</strong> supplier@example.com</li>
            <li><strong>Admin:</strong> admin@example.com</li>
          </ul>
          <p className="demo-note">
            <small>Note: Use password 'securepassword' for these demo accounts</small>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;