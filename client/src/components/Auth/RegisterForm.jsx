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
    bio: '',
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
  }, [formData.country, formData.phone_country_code]);

  // Redirect on successful registration
  useEffect(() => {
    if (isSuccess) {
      navigate('/');
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
    
    // Format phone number properly if provided
    if (registerData.phone_number && phone_country_code) {
      // Ensure phone number is in international format
      const countryData = CountryDetectionService.getCountryData(phone_country_code);
      if (countryData && !registerData.phone_number.startsWith(countryData.phoneCode)) {
        registerData.phone_number = CountryDetectionService.formatPhoneNumber(
          registerData.phone_number, 
          phone_country_code
        );
      }
    }
    
    // Convert numeric fields
    if (registerData.farm_size) {
      registerData.farm_size = parseFloat(registerData.farm_size);
    }
    
    if (registerData.farming_experience) {
      registerData.farming_experience = parseInt(registerData.farming_experience, 10);
    }
    
    // Remove empty optional fields to avoid backend validation issues
    Object.keys(registerData).forEach(key => {
      if (registerData[key] === '' || registerData[key] === null || registerData[key] === undefined) {
        delete registerData[key];
      }
    });
    
    dispatch(register(registerData));
  };

  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold text-gray-900 mb-1">Create your account</h2>
      <p className="text-sm text-gray-600 mb-6">Already have an account? <a href="/login" className="font-medium text-green-600 hover:text-green-500">Sign in</a></p>
      
      {isError && <div className="rounded-md bg-red-50 p-4 mb-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">{message}</h3>
          </div>
        </div>
      </div>}
      
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
          <div className="sm:col-span-1">
            <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">
              First name
            </label>
            <div className="mt-1">
              <input
                type="text"
                name="first_name"
                id="first_name"
                autoComplete="given-name"
                required
                value={formData.first_name}
                onChange={(e) => handleFieldChange('first_name', e.target.value)}
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
              />
            </div>
          </div>

          <div className="sm:col-span-1">
            <label htmlFor="last_name" className="block text-sm font-medium text-gray-700">
              Last name
            </label>
            <div className="mt-1">
              <input
                type="text"
                name="last_name"
                id="last_name"
                autoComplete="family-name"
                required
                value={formData.last_name}
                onChange={(e) => handleFieldChange('last_name', e.target.value)}
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
              />
            </div>
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email address
            </label>
            <div className="mt-1">
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={(e) => handleFieldChange('email', e.target.value)}
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
              />
            </div>
          </div>

          <div className="sm:col-span-2">
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
          </div>

          <div className="sm:col-span-2">
            <PasswordField
              label="Confirm Password"
              value={formData.confirmPassword}
              onChange={(value) => {
                handleFieldChange('confirmPassword', value);
                // Validate password match
                const passwordsMatch = value === formData.password;
                const error = value && !passwordsMatch ? 'Passwords do not match' : null;
                handleValidationChange('confirmPassword', passwordsMatch || !value, error);
              }}
              name="confirmPassword"
              placeholder="Confirm your password"
              required
              showRequirements={false}
            />
            {formData.confirmPassword && formData.password !== formData.confirmPassword && (
              <p className="mt-1 text-sm text-red-600">Passwords do not match</p>
            )}
          </div>

          <div className="sm:col-span-1">
            <label htmlFor="gender" className="block text-sm font-medium text-gray-700">
              Gender
            </label>
            <div className="mt-1">
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={(e) => handleFieldChange('gender', e.target.value)}
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
                <option value="prefer_not_to_say">Prefer not to say</option>
              </select>
            </div>
          </div>

          <div className="sm:col-span-1">
            <label htmlFor="role" className="block text-sm font-medium text-gray-700">
              Role
            </label>
            <div className="mt-1">
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={(e) => handleFieldChange('role', e.target.value)}
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
              >
                <option value="farmer">Farmer</option>
                <option value="expert">Agricultural Expert</option>
                <option value="supplier">Supplier</option>
                <option value="researcher">Researcher</option>
                <option value="student">Student</option>
              </select>
            </div>
          </div>

          <div className="sm:col-span-2">
            <PhoneNumberField
              label="Phone Number"
              value={formData.phone_number}
              countryCode={formData.phone_country_code}
              onChange={handlePhoneChange}
              placeholder="Enter your phone number"
              name="phone_number"
              onValidationChange={(isValid) => handleValidationChange('phone_number', isValid)}
            />
          </div>

          <div className="sm:col-span-1">
            <label htmlFor="country" className="block text-sm font-medium text-gray-700">
              Country
            </label>
            <div className="mt-1">
              <select
                id="country"
                name="country"
                value={formData.country}
                onChange={(e) => handleCountryChange(e.target.value)}
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
              >
                <option value="">Select Country</option>
                {COUNTRIES.map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="sm:col-span-1">
            <label htmlFor="city" className="block text-sm font-medium text-gray-700">
              City
            </label>
            <div className="mt-1">
              <input
                type="text"
                name="city"
                id="city"
                value={formData.city}
                onChange={(e) => handleFieldChange('city', e.target.value)}
                placeholder="Enter your city"
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
              />
            </div>
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
              Bio (Optional)
            </label>
            <div className="mt-1">
              <textarea
                id="bio"
                name="bio"
                rows={3}
                value={formData.bio || ''}
                onChange={(e) => handleFieldChange('bio', e.target.value)}
                placeholder="Tell us about yourself and your agricultural interests..."
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
              />
            </div>
          </div>

          <div className="sm:col-span-1">
            <label htmlFor="farm_size" className="block text-sm font-medium text-gray-700">
              Farm Size (Optional)
            </label>
            <div className="mt-1">
              <input
                type="number"
                name="farm_size"
                id="farm_size"
                step="0.01"
                min="0"
                value={formData.farm_size}
                onChange={(e) => handleFieldChange('farm_size', e.target.value)}
                placeholder="Enter farm size"
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
              />
            </div>
          </div>

          <div className="sm:col-span-1">
            <label htmlFor="farm_size_unit" className="block text-sm font-medium text-gray-700">
              Unit
            </label>
            <div className="mt-1">
              <select
                id="farm_size_unit"
                name="farm_size_unit"
                value={formData.farm_size_unit}
                onChange={(e) => handleFieldChange('farm_size_unit', e.target.value)}
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
              >
                <option value="hectares">Hectares</option>
                <option value="acres">Acres</option>
                <option value="square_meters">Square Meters</option>
              </select>
            </div>
          </div>

          <div className="sm:col-span-1">
            <label htmlFor="farming_experience" className="block text-sm font-medium text-gray-700">
              Farming Experience (Years)
            </label>
            <div className="mt-1">
              <input
                type="number"
                name="farming_experience"
                id="farming_experience"
                min="0"
                max="100"
                value={formData.farming_experience}
                onChange={(e) => handleFieldChange('farming_experience', e.target.value)}
                placeholder="Years of experience"
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
              />
            </div>
          </div>

          <div className="sm:col-span-1">
            <label htmlFor="farming_type" className="block text-sm font-medium text-gray-700">
              Farming Type
            </label>
            <div className="mt-1">
              <select
                id="farming_type"
                name="farming_type"
                value={formData.farming_type}
                onChange={(e) => handleFieldChange('farming_type', e.target.value)}
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
              >
                {FARMING_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div>
          <button
            type="submit"
            disabled={isLoading || !isFormValid}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            {isLoading ? 'Creating account...' : 'Create Account'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RegisterForm;