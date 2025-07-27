import React, { useState, useEffect, useRef } from 'react';
import CountryDetectionService from '../../../utils/countryDetectionService';
import { COUNTRIES_WITH_PHONE_DATA } from '../../../utils/constants';
import FormField from '../FormField/FormField';
import './PhoneNumberField.css';

const PhoneNumberField = ({
  value,
  countryCode,
  onChange,
  onValidationChange,
  defaultCountry = null,
  label = 'Phone Number',
  placeholder = 'Enter your phone number',
  required = false,
  className = '',
  name = 'phone_number',
  ...props
}) => {
  const [selectedCountry, setSelectedCountry] = useState(countryCode || defaultCountry || 'US');
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredCountries, setFilteredCountries] = useState(COUNTRIES_WITH_PHONE_DATA);
  const [isValid, setIsValid] = useState(false);
  const [focused, setFocused] = useState(false);
  
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);
  const searchRef = useRef(null);

  // Initialize country detection
  useEffect(() => {
    const initializeCountry = async () => {
      if (!countryCode && !defaultCountry) {
        try {
          const detectedCountry = await CountryDetectionService.getCountryPreference();
          setSelectedCountry(detectedCountry);
        } catch (error) {
          console.warn('Failed to detect country:', error);
          setSelectedCountry('US');
        }
      }
    };

    initializeCountry();
  }, [countryCode, defaultCountry]);

  // Update filtered countries when search query changes
  useEffect(() => {
    if (searchQuery) {
      const filtered = CountryDetectionService.searchCountries(searchQuery);
      setFilteredCountries(filtered);
    } else {
      setFilteredCountries(CountryDetectionService.getAllCountries());
    }
  }, [searchQuery]);

  // Validate phone number when value or country changes
  useEffect(() => {
    if (value) {
      const valid = CountryDetectionService.validatePhoneNumber(value, selectedCountry);
      setIsValid(valid);
      
      if (onValidationChange) {
        onValidationChange(valid);
      }
    } else {
      setIsValid(false);
      if (onValidationChange) {
        onValidationChange(true); // Empty is valid if not required
      }
    }
  }, [value, selectedCountry, onValidationChange]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
        setSearchQuery('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCountrySelect = (country) => {
    setSelectedCountry(country.code);
    setShowDropdown(false);
    setSearchQuery('');
    
    // Store user preference
    CountryDetectionService.storeCountryPreference(country.code);
    
    // Format existing phone number for new country
    if (value) {
      const formattedNumber = CountryDetectionService.formatPhoneNumber(value, country.code);
      onChange(formattedNumber, country.code);
    } else {
      onChange('', country.code);
    }
    
    // Focus back to input
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handlePhoneChange = (newValue) => {
    // Clean the input
    const cleanedValue = CountryDetectionService.cleanPhoneInput(newValue);
    
    // Format the number
    const formattedValue = CountryDetectionService.formatPhoneNumber(cleanedValue, selectedCountry);
    
    onChange(formattedValue, selectedCountry);
  };

  const handleInputFocus = () => {
    setFocused(true);
  };

  const handleInputBlur = () => {
    setFocused(false);
  };

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
    if (!showDropdown && searchRef.current) {
      setTimeout(() => searchRef.current?.focus(), 100);
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setShowDropdown(false);
      setSearchQuery('');
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  };

  const selectedCountryData = CountryDetectionService.getCountryData(selectedCountry);
  const phoneExample = CountryDetectionService.getPhoneExample(selectedCountry);
  
  const getValidationMessage = () => {
    if (!value) return '';
    if (isValid) return '';
    return `Please enter a valid phone number. Example: ${phoneExample}`;
  };

  return (
    <div className={`phone-number-field ${className}`}>
      <FormField
        label={label}
        value={value}
        onChange={handlePhoneChange}
        type="tel"
        name={name}
        placeholder={placeholder || phoneExample}
        required={required}
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
        helpText={focused ? `Format: ${phoneExample}` : ''}
        className="phone-number-field__input-field"
        validation={[
          {
            validator: (val) => !val || isValid,
            message: getValidationMessage()
          }
        ]}
        {...props}
      >
        <div className="phone-number-field__input-container">
          {/* Country code selector */}
          <div className="phone-number-field__country-selector" ref={dropdownRef}>
            <button
              type="button"
              onClick={toggleDropdown}
              className="phone-number-field__country-button"
              aria-label={`Selected country: ${selectedCountryData?.name}. Click to change.`}
              aria-expanded={showDropdown}
              aria-haspopup="listbox"
            >
              <span className="phone-number-field__country-flag">
                {selectedCountryData?.flag}
              </span>
              <span className="phone-number-field__country-code">
                {selectedCountryData?.phoneCode}
              </span>
              <svg 
                className={`phone-number-field__dropdown-arrow ${showDropdown ? 'phone-number-field__dropdown-arrow--open' : ''}`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown */}
            {showDropdown && (
              <div className="phone-number-field__dropdown" role="listbox">
                {/* Search input */}
                <div className="phone-number-field__search-container">
                  <input
                    ref={searchRef}
                    type="text"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    onKeyDown={handleKeyDown}
                    placeholder="Search countries..."
                    className="phone-number-field__search"
                    aria-label="Search countries"
                  />
                </div>

                {/* Country list */}
                <div className="phone-number-field__country-list">
                  {filteredCountries.length > 0 ? (
                    filteredCountries.map((country) => (
                      <button
                        key={country.code}
                        type="button"
                        onClick={() => handleCountrySelect(country)}
                        className={`phone-number-field__country-option ${
                          country.code === selectedCountry ? 'phone-number-field__country-option--selected' : ''
                        }`}
                        role="option"
                        aria-selected={country.code === selectedCountry}
                      >
                        <span className="phone-number-field__country-flag">
                          {country.flag}
                        </span>
                        <span className="phone-number-field__country-name">
                          {country.name}
                        </span>
                        <span className="phone-number-field__country-code">
                          {country.phoneCode}
                        </span>
                      </button>
                    ))
                  ) : (
                    <div className="phone-number-field__no-results">
                      No countries found
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Phone number input */}
          <input
            ref={inputRef}
            type="tel"
            value={value || ''}
            onChange={(e) => handlePhoneChange(e.target.value)}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            placeholder={placeholder || phoneExample}
            className={`phone-number-field__input ${
              value && !isValid ? 'phone-number-field__input--error' : ''
            } ${
              value && isValid ? 'phone-number-field__input--valid' : ''
            }`}
            name={name}
            required={required}
            autoComplete="tel"
            aria-describedby={`${name}-format ${name}-validation`}
          />

          {/* Validation indicator */}
          {value && (
            <div className="phone-number-field__validation-indicator">
              {isValid ? (
                <span className="phone-number-field__validation-icon phone-number-field__validation-icon--valid" aria-label="Valid">
                  ✓
                </span>
              ) : (
                <span className="phone-number-field__validation-icon phone-number-field__validation-icon--error" aria-label="Invalid">
                  ✗
                </span>
              )}
            </div>
          )}
        </div>
      </FormField>

      {/* Format example */}
      {focused && phoneExample && (
        <div className="phone-number-field__format-example" id={`${name}-format`}>
          <span className="phone-number-field__format-label">Format:</span>
          <span className="phone-number-field__format-text">{phoneExample}</span>
        </div>
      )}
    </div>
  );
};

export default PhoneNumberField;