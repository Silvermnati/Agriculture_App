import React, { useState, useEffect } from 'react';
import { validatePassword } from '../../../utils/helpers';
import { VALIDATION } from '../../../utils/constants';
import FormField from '../FormField/FormField';
import './PasswordField.css';

const PasswordField = ({
  value,
  onChange,
  onValidationChange,
  showRequirements = true,
  label = 'Password',
  placeholder = 'Enter your password',
  required = true,
  className = '',
  name = 'password',
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState(false);
  const [validationResult, setValidationResult] = useState({
    isValid: false,
    requirements: [],
    strength: 0,
    strengthPercentage: 0
  });

  // Validate password when value changes
  useEffect(() => {
    const result = validatePassword(value || '');
    setValidationResult(result);
    
    if (onValidationChange) {
      onValidationChange(result.isValid);
    }
  }, [value, onValidationChange]);

  const handleFocus = () => {
    setFocused(true);
  };

  const handleBlur = () => {
    setFocused(false);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const getStrengthColor = () => {
    const { strengthPercentage } = validationResult;
    if (strengthPercentage < 25) return '#ef4444'; // Red
    if (strengthPercentage < 50) return '#f59e0b'; // Orange
    if (strengthPercentage < 75) return '#eab308'; // Yellow
    return '#10b981'; // Green
  };

  const getStrengthText = () => {
    const { strengthPercentage } = validationResult;
    if (strengthPercentage < 25) return 'Weak';
    if (strengthPercentage < 50) return 'Fair';
    if (strengthPercentage < 75) return 'Good';
    return 'Strong';
  };

  const shouldShowRequirements = showRequirements && (focused || value);

  return (
    <div className={`password-field ${className}`}>
      <FormField
        label={label}
        value={value}
        onChange={onChange}
        type={showPassword ? 'text' : 'password'}
        name={name}
        placeholder={placeholder}
        required={required}
        onFocus={handleFocus}
        onBlur={handleBlur}
        className="password-field__input-field"
        {...props}
      >
        <div className="password-field__input-container">
          <input
            type={showPassword ? 'text' : 'password'}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={placeholder}
            className="password-field__input"
            name={name}
            required={required}
            autoComplete="new-password"
            aria-describedby={`${name}-requirements ${name}-strength`}
            {...props}
          />
          
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="password-field__toggle"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            tabIndex={-1}
          >
            {showPassword ? (
              <svg className="password-field__toggle-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
              </svg>
            ) : (
              <svg className="password-field__toggle-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        </div>
      </FormField>

      {/* Password strength indicator */}
      {value && (
        <div className="password-field__strength" id={`${name}-strength`}>
          <div className="password-field__strength-bar">
            <div 
              className="password-field__strength-fill"
              style={{ 
                width: `${validationResult.strengthPercentage}%`,
                backgroundColor: getStrengthColor()
              }}
            />
          </div>
          <span 
            className="password-field__strength-text"
            style={{ color: getStrengthColor() }}
          >
            {getStrengthText()}
          </span>
        </div>
      )}

      {/* Password requirements */}
      {shouldShowRequirements && (
        <div className="password-field__requirements" id={`${name}-requirements`}>
          <div className="password-field__requirements-title">
            Password requirements:
          </div>
          <ul className="password-field__requirements-list">
            {validationResult.requirements.map((requirement) => (
              <li
                key={requirement.id}
                className={`password-field__requirement ${
                  requirement.met ? 'password-field__requirement--met' : 'password-field__requirement--unmet'
                } ${requirement.optional ? 'password-field__requirement--optional' : ''}`}
              >
                <span className="password-field__requirement-icon">
                  {requirement.met ? '✓' : '○'}
                </span>
                <span className="password-field__requirement-text">
                  {requirement.text}
                  {requirement.optional && (
                    <span className="password-field__requirement-optional"> (optional)</span>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default PasswordField;