import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser, clearError } from '../store/authSlice';
import './Auth.css' ;

const RegisterForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error } = useSelector(state => state.auth);
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: '',
    country: '',
    state: '',
    city: '',
    phone: '',
    // Agricultural fields
    farm_size: '',
    farming_experience: '',
    farming_type: '',
    specializations: [],
    years_experience: '',
  });
  
  const [formErrors, setFormErrors] = useState({});

  const roles = [
    { value: 'farmer', label: 'Farmer' },
    { value: 'expert', label: 'Agricultural Expert' },
    { value: 'supplier', label: 'Supplier' },
    { value: 'researcher', label: 'Researcher' },
    { value: 'student', label: 'Student' },
  ];

  const countries = [
    { value: 'US', label: 'United States' },
    { value: 'CA', label: 'Canada' },
    { value: 'UK', label: 'United Kingdom' },
    { value: 'AU', label: 'Australia' },
    { value: 'IN', label: 'India' },
    { value: 'BR', label: 'Brazil' },
    { value: 'KE', label: 'Kenya' },
    { value: 'NG', label: 'Nigeria' },
    // Add more countries as needed
  ];

  const farmingTypes = [
    'Crop Production',
    'Livestock',
    'Dairy',
    'Poultry',
    'Organic Farming',
    'Hydroponics',
    'Greenhouse',
    'Mixed Farming',
    'Subsistence',
    'Commercial',
  ];

  const expertSpecializations = [
    'Soil Science',
    'Crop Protection',
    'Animal Husbandry',
    'Irrigation',
    'Pest Management',
    'Organic Farming',
    'Agricultural Technology',
    'Nutrition',
    'Veterinary Services',
    'Farm Management',
  ];

  const validateForm = () => {
    const errors = {};
    
    // Basic validation
    if (!formData.first_name) errors.first_name = 'First name is required';
    if (!formData.last_name) errors.last_name = 'Last name is required';
    
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      errors.password = 'Password must contain uppercase, lowercase, and number';
    }
    
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    if (!formData.role) errors.role = 'Please select a role';
    if (!formData.country) errors.country = 'Country is required';
    
    // Agricultural field validation
    if (formData.role === 'farmer') {
      if (!formData.farm_size) errors.farm_size = 'Farm size is required';
      if (!formData.farming_experience) errors.farming_experience = 'Farming experience is required';
      if (!formData.farming_type) errors.farming_type = 'Farming type is required';
    }
    
    if (formData.role === 'expert') {
      if (formData.specializations.length === 0) {
        errors.specializations = 'At least one specialization is required';
      }
      if (!formData.years_experience) errors.years_experience = 'Years of experience is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === 'specializations') {
      const currentSpecializations = formData.specializations;
      if (checked) {
        setFormData(prev => ({
          ...prev,
          specializations: [...currentSpecializations, value]
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          specializations: currentSpecializations.filter(spec => spec !== value)
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
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
      await dispatch(registerUser(formData)).unwrap();
      navigate('/dashboard');
    } catch (error) {
      // Error is handled by Redux
    }
  };

  const renderAgriculturalFields = () => {
    if (formData.role === 'farmer') {
      return (
        <>
          <div className="form-group">
            <label htmlFor="farm_size">Farm Size</label>
            <select
              id="farm_size"
              name="farm_size"
              value={formData.farm_size}
              onChange={handleChange}
              className={formErrors.farm_size ? 'error' : ''}
              required
            >
              <option value="">Select farm size</option>
              <option value="small">Small (&lt; 5 acres)</option>
              <option value="medium">Medium (5-50 acres)</option>
              <option value="large">Large (50-500 acres)</option>
              <option value="commercial">Commercial (&gt; 500 acres)</option>
            </select>
            {formErrors.farm_size && (
              <span className="field-error">{formErrors.farm_size}</span>
            )}
          </div>
          
          <div className="form-group">
            <label htmlFor="farming_experience">Farming Experience</label>
            <select
              id="farming_experience"
              name="farming_experience"
              value={formData.farming_experience}
              onChange={handleChange}
              className={formErrors.farming_experience ? 'error' : ''}
              required
            >
              <option value="">Select experience level</option>
              <option value="beginner">Beginner (&lt; 2 years)</option>
              <option value="intermediate">Intermediate (2-10 years)</option>
              <option value="experienced">Experienced (10+ years)</option>
            </select>
            {formErrors.farming_experience && (
              <span className="field-error">{formErrors.farming_experience}</span>
            )}
          </div>
          
          <div className="form-group">
            <label htmlFor="farming_type">Farming Type</label>
            <select
              id="farming_type"
              name="farming_type"
              value={formData.farming_type}
              onChange={handleChange}
              className={formErrors.farming_type ? 'error' : ''}
              required
            >
              <option value="">Select farming type</option>
              {farmingTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            {formErrors.farming_type && (
              <span className="field-error">{formErrors.farming_type}</span>
            )}
          </div>
        </>
      );
    }
    
    if (formData.role === 'expert') {
      return (
        <>
          <div className="form-group">
            <label>Specializations</label>
            <div className="checkbox-grid">
              {expertSpecializations.map(spec => (
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
            {formErrors.specializations && (
              <span className="field-error">{formErrors.specializations}</span>
            )}
          </div>
          
          <div className="form-group">
            <label htmlFor="years_experience">Years of Experience</label>
            <select
              id="years_experience"
              name="years_experience"
              value={formData.years_experience}
              onChange={handleChange}
              className={formErrors.years_experience ? 'error' : ''}
              required
            >
              <option value="">Select experience</option>
              <option value="1-3">1-3 years</option>
              <option value="4-7">4-7 years</option>
              <option value="8-15">8-15 years</option>
              <option value="15+">15+ years</option>
            </select>
            {formErrors.years_experience && (
              <span className="field-error">{formErrors.years_experience}</span>
            )}
          </div>
        </>
      );
    }
    
    return null;
  };

  return (
    <div className="auth-container">
      <div className="auth-card register-card">
        <div className="auth-header">
          <h2>Join Our Agricultural Community</h2>
          <p>Create your account to connect with farmers, experts, and suppliers</p>
        </div>
        
        <form onSubmit={handleSubmit} className="auth-form">
          {error && (
            <div className="error-message">
              {error}
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
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={formErrors.password ? 'error' : ''}
                placeholder="Create a strong password"
                required
              />
              {formErrors.password && (
                <span className="field-error">{formErrors.password}</span>
              )}
            </div>
            
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={formErrors.confirmPassword ? 'error' : ''}
                placeholder="Confirm your password"
                required
              />
              {formErrors.confirmPassword && (
                <span className="field-error">{formErrors.confirmPassword}</span>
              )}
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="role">Role</label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              className={formErrors.role ? 'error' : ''}
              required
            >
              <option value="">Select your role</option>
              {roles.map(role => (
                <option key={role.value} value={role.value}>{role.label}</option>
              ))}
            </select>
            {formErrors.role && (
              <span className="field-error">{formErrors.role}</span>
            )}
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="country">Country</label>
              <select
                id="country"
                name="country"
                value={formData.country}
                onChange={handleChange}
                className={formErrors.country ? 'error' : ''}
                required
              >
                <option value="">Select country</option>
                {countries.map(country => (
                  <option key={country.value} value={country.value}>{country.label}</option>
                ))}
              </select>
              {formErrors.country && (
                <span className="field-error">{formErrors.country}</span>
              )}
            </div>
            
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
          </div>
          
          <div className="form-row">
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
            
            <div className="form-group">
              <label htmlFor="phone">Phone Number (Optional)</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter phone number"
              />
            </div>
          </div>
          
          {renderAgriculturalFields()}
          
          <button
            type="submit"
            className="auth-button"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="loading-spinner"></span>
            ) : (
              'Create Account'
            )}
          </button>
          
          <div className="auth-links">
            <p>
              Already have an account? {' '}
              <Link to="/login" className="auth-link">
                Sign in here
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterForm;
