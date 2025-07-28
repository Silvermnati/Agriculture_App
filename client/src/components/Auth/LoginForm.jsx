import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { login, reset } from '../../store/slices/authSlice';
import '../../pages/Register/Register.css';

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
      

    </div>
  );
};

export default LoginForm;