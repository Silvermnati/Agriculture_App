import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { register, reset } from '../../store/slices/authSlice';
import { FARMING_TYPES, USER_ROLES } from '../../utils/constants';
import './Auth.css';

const RegisterForm = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    first_name: '',
    last_name: '',
    role: 'farmer',
    farm_size: '',
    farm_size_unit: 'hectares',
    farming_experience: '',
    farming_type: 'organic',
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [passwordMatch, setPasswordMatch] = useState(true);

  const dispatch = useDispatch();
  const { isLoading, isError, isSuccess, message } = useSelector((state) => state.auth);

  useEffect(() => {
    // Reset auth state when component unmounts
    return () => {
      dispatch(reset());
    };
  }, [dispatch]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    // Check password match
    if (name === 'confirmPassword' || name === 'password') {
      if (name === 'confirmPassword') {
        setPasswordMatch(formData.password === value);
      } else {
        setPasswordMatch(formData.confirmPassword === value);
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      setPasswordMatch(false);
      return;
    }
    
    // Remove confirmPassword before sending to API
    const { confirmPassword, ...registerData } = formData;
    dispatch(register(registerData));
  };

  return (
    <div className="auth-form-container">
      <h2>Join Agricultural Super App</h2>
      <p className="auth-subtitle">Connect with agricultural experts and share knowledge</p>
      
      {isError && <div className="auth-error">{message}</div>}
      {isSuccess && <div className="auth-success">Registration successful!</div>}
      
      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="first_name">First Name</label>
            <input
              type="text"
              id="first_name"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              placeholder="Enter your first name"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="last_name">Last Name</label>
            <input
              type="text"
              id="last_name"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              placeholder="Enter your last name"
              required
            />
          </div>
        </div>
        
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
        
        <div className="form-row">
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
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <div className="password-input">
              <input
                type={showPassword ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
                required
              />
            </div>
          </div>
        </div>
        
        {!passwordMatch && (
          <div className="auth-error">Passwords do not match</div>
        )}
        
        <div className="form-group">
          <button 
            type="button" 
            className="toggle-password-btn"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? 'Hide Password' : 'Show Password'}
          </button>
        </div>
        
        <div className="form-group">
          <label htmlFor="role">I am a:</label>
          <select
            id="role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            required
          >
            <option value="farmer">Farmer</option>
            <option value="expert">Agricultural Expert</option>
            <option value="supplier">Supplier</option>
            <option value="researcher">Researcher</option>
            <option value="student">Student</option>
          </select>
        </div>
        
        {formData.role === 'farmer' && (
          <>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="farm_size">Farm Size</label>
                <input
                  type="number"
                  id="farm_size"
                  name="farm_size"
                  value={formData.farm_size}
                  onChange={handleChange}
                  placeholder="Enter farm size"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="farm_size_unit">Unit</label>
                <select
                  id="farm_size_unit"
                  name="farm_size_unit"
                  value={formData.farm_size_unit}
                  onChange={handleChange}
                >
                  <option value="hectares">Hectares</option>
                  <option value="acres">Acres</option>
                </select>
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="farming_experience">Years of Experience</label>
                <input
                  type="number"
                  id="farming_experience"
                  name="farming_experience"
                  value={formData.farming_experience}
                  onChange={handleChange}
                  placeholder="Years of farming experience"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="farming_type">Farming Type</label>
                <select
                  id="farming_type"
                  name="farming_type"
                  value={formData.farming_type}
                  onChange={handleChange}
                >
                  {FARMING_TYPES.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </>
        )}
        
        <button 
          type="submit" 
          className="auth-button"
          disabled={isLoading || !passwordMatch}
        >
          {isLoading ? 'Registering...' : 'Register'}
        </button>
      </form>
      
      <div className="auth-links">
        <p>Already have an account? <a href="#login">Login</a></p>
      </div>
    </div>
  );
};

export default RegisterForm;