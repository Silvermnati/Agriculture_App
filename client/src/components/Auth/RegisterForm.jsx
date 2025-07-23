import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { register, reset } from '../../store/slices/authSlice';
import { FARMING_TYPES, USER_ROLES, FARM_SIZE_UNITS } from '../../utils/constants';
import { getValidationError } from '../../utils/helpers';
import './Auth.css';

const RegisterForm = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    first_name: '',
    last_name: '',
    gender: 'male',
    role: 'farmer',
    farm_size: '',
    farm_size_unit: 'hectares',
    farming_experience: '',
    farming_type: 'organic',
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [passwordMatch, setPasswordMatch] = useState(true);
  const [validationErrors, setValidationErrors] = useState({});

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isLoading, isError, isSuccess, message } = useSelector((state) => state.auth);

  useEffect(() => {
    // Redirect to home page if registration is successful
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
    
    // Check password match
    if (name === 'confirmPassword' || name === 'password') {
      if (name === 'confirmPassword') {
        setPasswordMatch(formData.password === value);
      } else {
        setPasswordMatch(formData.confirmPassword === value);
      }
    }
    
    // Validate field
    const error = getValidationError(name, value);
    if (error) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: error
      }));
    } else {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
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
    
    // Ensure farm_size is a number if provided
    if (registerData.farm_size) {
      registerData.farm_size = parseFloat(registerData.farm_size);
    }
    
    // Ensure farming_experience is a number if provided
    if (registerData.farming_experience) {
      registerData.farming_experience = parseInt(registerData.farming_experience, 10);
    }
    
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
          <label htmlFor="gender">Gender</label>
          <select
            id="gender"
            name="gender"
            value={formData.gender}
            onChange={handleChange}
          >
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
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
            className={validationErrors.email ? 'input-error' : ''}
            required
          />
          {validationErrors.email && (
            <div className="field-error">{validationErrors.email}</div>
          )}
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
        <p>Already have an account? <a href="/login">Login</a></p>
      </div>
    </div>
  );
};

export default RegisterForm;