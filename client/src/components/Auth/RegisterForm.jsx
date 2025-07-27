import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { register, reset } from '../../store/slices/authSlice';
import { FARMING_TYPES, COUNTRIES, COUNTRIES_WITH_PHONE_DATA } from '../../utils/constants';
import { validateForm, formatValidationMessage } from '../../utils/helpers';
import CountryDetectionService from '../../utils/countryDetectionService';
import FormField from '../common/FormField/FormField';
import PasswordField from '../common/PasswordField/PasswordField';
import PhoneNumberField from '../common/PhoneNumberField/PhoneNumberField';
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
    phone_number: '',
    phone_country_code: '',
    country: '',
    city: '',
    farm_size: '',
    farm_size_unit: 'hectares',
    farming_experience: '',
    farming_type: 'organic',
  });
  
  const [validationState, setValidationState] = useState({});
  const [formErrors, setFormErrors] = useState({});
  const [isFormValid, setIsFormValid] = useState(false);
  const [detectedCountry, setDetectedCountry] = useState('');

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isLoading, isError, isSuccess, message } = useSelector((state) => state.auth);

  // Initialize country detection
  useEffect(() => {
    const initializeCountry = async () => {
      try {
        const country = await CountryDetectionService.getCountryPreference();
        setDetectedCountry(country);
        
        // Set default country if not already set
        if (!formData.country && !formData.phone_country_code) {
          setFormData(prev => ({
            ...prev,
            country: CountryDetectionService.getCountryData(country)?.name || '',
            phone_country_code: country
          }));
        }
      } catch (error) {
        console.warn('Failed to detect country:', error);
        setDetectedCountry('US');
      }
    };

    initializeCountry();
  }, []);

  // Redirect on successful registration
  useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => {
        navigate('/');
      }, 1500);
      
      return () => clearTimeout(timer);
    }
    
    return () => {
      dispatch(reset());
    };
  }, [isSuccess, dispatch, navigate]);

  // Update form validity when validation state changes
  useEffect(() => {
    const requiredFields = ['email', 'password', 'first_name', 'last_name'];
    const allRequiredValid = requiredFields.every(field => validationState[field] !== false);
    const passwordsMatch = formData.password === formData.confirmPassword;
    const hasNoErrors = Object.keys(formErrors).length === 0;
    
    setIsFormValid(allRequiredValid && passwordsMatch && hasNoErrors);
  }, [validationState, formData.password, formData.confirmPassword, formErrors]);

  const handleFieldChange = (fieldName, value) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  const handlePhoneChange = (phoneValue, countryCode) => {
    setFormData(prev => {
      const newData = {
        ...prev,
        phone_number: phoneValue,
        phone_country_code: countryCode
      };

      // Sync country field if it's empty or different
      const countryData = CountryDetectionService.getCountryData(countryCode);
      if (countryData && (!prev.country || prev.country !== countryData.name)) {
        // Ask user if they want to update country field
        if (prev.country && prev.country !== countryData.name) {
          const shouldUpdate = window.confirm(
            `Would you like to update your country to ${countryData.name} to match your phone number?`
          );
          if (shouldUpdate) {
            newData.country = countryData.name;
          }
        } else {
          newData.country = countryData.name;
        }
      }

      return newData;
    });
  };

  const handleCountryChange = (countryName) => {
    setFormData(prev => ({
      ...prev,
      country: countryName
    }));

    // Sync phone country code
    const countryData = COUNTRIES_WITH_PHONE_DATA.find(c => c.name === countryName);
    if (countryData && countryData.code !== formData.phone_country_code) {
      setFormData(current => ({
        ...current,
        phone_country_code: countryData.code
      }));
      
      // Store the preference
      CountryDetectionService.storeCountryPreference(countryData.code);
    }
  };

  const handleValidationChange = (fieldName, isValid, error) => {
    setValidationState(prev => ({
      ...prev,
      [fieldName]: isValid
    }));

    if (error) {
      setFormErrors(prev => ({
        ...prev,
        [fieldName]: error
      }));
    } else {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }
  };

  const scrollToFirstError = () => {
    const firstErrorField = Object.keys(formErrors)[0];
    if (firstErrorField) {
      const element = document.querySelector(`[name="${firstErrorField}"]`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element.focus();
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate entire form
    const validationResult = validateForm(formData, {
      phone_number: { countryCode: formData.phone_country_code }
    });

    if (!validationResult.isValid) {
      setFormErrors(validationResult.errors);
      scrollToFirstError();
      return;
    }

    // Check password match
    if (formData.password !== formData.confirmPassword) {
      setFormErrors(prev => ({
        ...prev,
        confirmPassword: 'Passwords do not match'
      }));
      scrollToFirstError();
      return;
    }
    
    // Prepare data for submission
    const { confirmPassword, phone_country_code, ...registerData } = formData;
    
    // Convert numeric fields
    if (registerData.farm_size) {
      registerData.farm_size = parseFloat(registerData.farm_size);
    }
    
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
      
      <form className="auth-form enhanced-form" onSubmit={handleSubmit}>
        {/* Form-level errors */}
        {Object.keys(formErrors).length > 0 && (
          <div className="form-errors" role="alert">
            <h4>Please correct the following errors:</h4>
            <ul>
              {Object.entries(formErrors).map(([field, error]) => (
                <li key={field}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Personal Information */}
        <div className="form-section">
          <h3 className="form-section-title">Personal Information</h3>
          
          <div className="form-row">
            <FormField
              label="First Name"
              value={formData.first_name}
              onChange={(value) => handleFieldChange('first_name', value)}
              type="text"
              name="first_name"
              placeholder="Enter your first name"
              required
              helpText="Your first name as it appears on official documents"
              maxLength={50}
              onValidationChange={(isValid, error) => handleValidationChange('first_name', isValid, error)}
            />
            
            <FormField
              label="Last Name"
              value={formData.last_name}
              onChange={(value) => handleFieldChange('last_name', value)}
              type="text"
              name="last_name"
              placeholder="Enter your last name"
              required
              helpText="Your last name as it appears on official documents"
              maxLength={50}
              onValidationChange={(isValid, error) => handleValidationChange('last_name', isValid, error)}
            />
          </div>
          
          <FormField
            label="Gender"
            value={formData.gender}
            onChange={(value) => handleFieldChange('gender', value)}
            type="select"
            name="gender"
            required
            helpText="This helps us provide personalized content"
            options={[
              { value: 'male', label: 'Male' },
              { value: 'female', label: 'Female' },
              { value: 'other', label: 'Other' }
            ]}
          />
        </div>

        {/* Contact Information */}
        <div className="form-section">
          <h3 className="form-section-title">Contact Information</h3>
          
          <FormField
            label="Email Address"
            value={formData.email}
            onChange={(value) => handleFieldChange('email', value)}
            type="email"
            name="email"
            placeholder="Enter your email address"
            required
            helpText="We'll use this to send you important updates and notifications"
            onValidationChange={(isValid, error) => handleValidationChange('email', isValid, error)}
          />

          <PhoneNumberField
            label="Phone Number (Optional)"
            value={formData.phone_number}
            countryCode={formData.phone_country_code}
            onChange={handlePhoneChange}
            name="phone_number"
            placeholder="Enter your phone number"
            defaultCountry={detectedCountry}
            onValidationChange={(isValid) => handleValidationChange('phone_number', isValid)}
          />

          <div className="form-row">
            <FormField
              label="Country"
              value={formData.country}
              onChange={handleCountryChange}
              type="select"
              name="country"
              helpText="Select your country of residence"
              options={[
                { value: '', label: 'Select your country' },
                ...COUNTRIES.map(country => ({ value: country, label: country }))
              ]}
            />
            
            <FormField
              label="City"
              value={formData.city}
              onChange={(value) => handleFieldChange('city', value)}
              type="text"
              name="city"
              placeholder="Enter your city"
              helpText="Your city or nearest major city"
              maxLength={100}
            />
          </div>
        </div>

        {/* Security */}
        <div className="form-section">
          <h3 className="form-section-title">Security</h3>
          
          <div className="form-row">
            <PasswordField
              label="Password"
              value={formData.password}
              onChange={(value) => handleFieldChange('password', value)}
              name="password"
              placeholder="Create a strong password"
              required
              showRequirements={true}
              onValidationChange={(isValid) => handleValidationChange('password', isValid)}
            />
            
            <FormField
              label="Confirm Password"
              value={formData.confirmPassword}
              onChange={(value) => handleFieldChange('confirmPassword', value)}
              type="password"
              name="confirmPassword"
              placeholder="Confirm your password"
              required
              helpText="Re-enter your password to confirm"
              validation={[
                {
                  validator: (value) => value === formData.password,
                  message: 'Passwords do not match'
                }
              ]}
              onValidationChange={(isValid, error) => handleValidationChange('confirmPassword', isValid, error)}
            />
          </div>
        </div>

        {/* Professional Information */}
        <div className="form-section">
          <h3 className="form-section-title">Professional Information</h3>
          
          <FormField
            label="I am a:"
            value={formData.role}
            onChange={(value) => handleFieldChange('role', value)}
            type="select"
            name="role"
            required
            helpText="Select your primary role in agriculture"
            options={[
              { value: 'farmer', label: 'Farmer' },
              { value: 'expert', label: 'Agricultural Expert' },
              { value: 'supplier', label: 'Supplier' },
              { value: 'researcher', label: 'Researcher' },
              { value: 'student', label: 'Student' }
            ]}
          />
          
          {formData.role === 'farmer' && (
            <div className="farmer-specific-fields">
              <div className="form-row">
                <FormField
                  label="Farm Size"
                  value={formData.farm_size}
                  onChange={(value) => handleFieldChange('farm_size', value)}
                  type="number"
                  name="farm_size"
                  placeholder="Enter farm size"
                  helpText="Size of your farming area"
                  min="0.01"
                  step="0.01"
                />
                
                <FormField
                  label="Unit"
                  value={formData.farm_size_unit}
                  onChange={(value) => handleFieldChange('farm_size_unit', value)}
                  type="select"
                  name="farm_size_unit"
                  helpText="Unit of measurement"
                  options={[
                    { value: 'hectares', label: 'Hectares' },
                    { value: 'acres', label: 'Acres' }
                  ]}
                />
              </div>
              
              <div className="form-row">
                <FormField
                  label="Years of Experience"
                  value={formData.farming_experience}
                  onChange={(value) => handleFieldChange('farming_experience', value)}
                  type="number"
                  name="farming_experience"
                  placeholder="Years of farming experience"
                  helpText="How many years have you been farming?"
                  min="0"
                  max="100"
                />
                
                <FormField
                  label="Farming Type"
                  value={formData.farming_type}
                  onChange={(value) => handleFieldChange('farming_type', value)}
                  type="select"
                  name="farming_type"
                  helpText="Your primary farming approach"
                  options={FARMING_TYPES.map(type => ({ value: type.value, label: type.label }))}
                />
              </div>
            </div>
          )}
        </div>
        
        <div className="form-actions">
          <button 
            type="submit" 
            className={`auth-button ${isFormValid ? 'auth-button--ready' : ''}`}
            disabled={isLoading || !isFormValid}
          >
            {isLoading ? (
              <>
                <span className="loading-spinner"></span>
                Registering...
              </>
            ) : (
              'Create Account'
            )}
          </button>
          
          {!isFormValid && (
            <p className="form-validation-hint">
              Please fill in all required fields correctly to continue
            </p>
          )}
        </div>
      </form>
      
      <div className="auth-links">
        <p>Already have an account? <a href="/login">Login</a></p>
      </div>
    </div>
  );
};

export default RegisterForm;