import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser, clearError } from '../store/authSlice';
import './Auth.css';

const LoginForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error, isAuthenticated, user } = useSelector(state => state.auth);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });
  
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    if (isAuthenticated && user) {
      // Role-based redirect
      const redirectPath = getRoleBasedRedirect(user.role);
      navigate(redirectPath);
    }
  }, [isAuthenticated, user, navigate]);

  const getRoleBasedRedirect = (role) => {
    switch (role) {
      case 'farmer':
        return '/dashboard/farmer';
      case 'expert':
        return '/dashboard/expert';
      case 'supplier':
        return '/dashboard/supplier';
      case 'researcher':
        return '/dashboard/researcher';
      case 'student':
        return '/dashboard/student';
      default:
        return '/dashboard';
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear field error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    dispatch(clearError());
    
    try {
      await dispatch(loginUser({
        email: formData.email,
        password: formData.password,
      })).unwrap();
      
      // Handle remember me
      if (formData.rememberMe) {
        localStorage.setItem('rememberMe', 'true');
      }
    } catch (error) {
      // Error is handled by Redux
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Welcome Back</h2>
          <p>Sign in to your agricultural account</p>
        </div>
        
        <form onSubmit={handleSubmit} className="auth-form">
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
          
          {successMessage && (
            <div className="success-message">
              {successMessage}
            </div>
          )}
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="first_name">First Name</label>
              <input
                type="text"
                id="first_name"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                className={formErrors.first_name ? 'error' : ''}
                placeholder="Enter your first name"
                required
              />
              {formErrors.first_name && (
                <span className="field-error">{formErrors.first_name}</span>
              )}
            </div>
            
            <div className="form-group">
              <label htmlFor="last_name">Last Name</label>
              <input
                type="text"
                id="last_name"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                className={formErrors.last_name ? 'error' : ''}
                placeholder="Enter your last name"
                required
              />
              {formErrors.last_name && (
                <span className="field-error">{formErrors.last_name}</span>
              )}
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={formErrors.email ? 'error' : ''}
              placeholder="Enter your email"
              required
            />
            {formErrors.email && (
              <span className="field-error">{formErrors.email}</span>
            )}
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="phone">Phone Number</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter phone number"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="country">Country</label>
              <select
                id="country"
                name="country"
                value={formData.country}
                onChange={handleChange}
              >
                <option value="">Select country</option>
                <option value="US">United States</option>
                <option value="CA">Canada</option>
                <option value="UK">United Kingdom</option>
                <option value="AU">Australia</option>
                <option value="IN">India</option>
                <option value="BR">Brazil</option>
                <option value="KE">Kenya</option>
                <option value="NG">Nigeria</option>
              </select>
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="state">State/Province</label>
              <input
                type="text"
                id="state"
                name="state"
                value={formData.state}
                onChange={handleChange}
                placeholder="Enter state/province"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="city">City</label>
              <input
                type="text"
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="Enter city"
              />
            </div>
          </div>
          
          {/* Role-specific fields */}
          {user.role === 'farmer' && (
            <>
              <div className="form-group">
                <label htmlFor="farm_size">Farm Size</label>
                <select
                  id="farm_size"
                  name="farm_size"
                  value={formData.farm_size}
                  onChange={handleChange}
                >
                  <option value="">Select farm size</option>
                  <option value="small">Small (&lt; 5 acres)</option>
                  <option value="medium">Medium (5-50 acres)</option>
                  <option value="large">Large (50-500 acres)</option>
                  <option value="commercial">Commercial (&gt; 500 acres)</option>
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="farming_experience">Farming Experience</label>
                <select
                  id="farming_experience"
                  name="farming_experience"
                  value={formData.farming_experience}
                  onChange={handleChange}
                >
                  <option value="">Select experience level</option>
                  <option value="beginner">Beginner (&lt; 2 years)</option>
                  <option value="intermediate">Intermediate (2-10 years)</option>
                  <option value="experienced">Experienced (10+ years)</option>
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="farming_type">Farming Type</label>
                <select
                  id="farming_type"
                  name="farming_type"
                  value={formData.farming_type}
                  onChange={handleChange}
                >
                  <option value="">Select farming type</option>
                  <option value="Crop Production">Crop Production</option>
                  <option value="Livestock">Livestock</option>
                  <option value="Dairy">Dairy</option>
                  <option value="Poultry">Poultry</option>
                  <option value="Organic Farming">Organic Farming</option>
                  <option value="Hydroponics">Hydroponics</option>
                  <option value="Greenhouse">Greenhouse</option>
                  <option value="Mixed Farming">Mixed Farming</option>
                </select>
              </div>
            </>
          )}
          
          {user.role === 'expert' && (
            <>
              <div className="form-group">
                <label>Specializations</label>
                <div className="checkbox-grid">
                  {['Soil Science', 'Crop Protection', 'Animal Husbandry', 'Irrigation', 'Pest Management', 'Organic Farming', 'Agricultural Technology', 'Nutrition', 'Veterinary Services', 'Farm Management'].map(spec => (
                    <label key={spec} className="checkbox-label">
                      <input
                        type="checkbox"
                        name="specializations"
                        value={spec}
                        checked={formData.specializations.includes(spec)}
                        onChange={handleChange}
                      />
                      <span className="checkmark"></span>
                      {spec}
                    </label>
                  ))}
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="years_experience">Years of Experience</label>
                <select
                  id="years_experience"
                  name="years_experience"
                  value={formData.years_experience}
                  onChange={handleChange}
                >
                  <option value="">Select experience</option>
                  <option value="1-3">1-3 years</option>
                  <option value="4-7">4-7 years</option>
                  <option value="8-15">8-15 years</option>
                  <option value="15+">15+ years</option>
                </select>
              </div>
            </>
          )}
          
          <button
            type="submit"
            className="auth-button"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="loading-spinner"></span>
            ) : (
              'Update Profile'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfileForm;
