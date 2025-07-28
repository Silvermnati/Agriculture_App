import React, { useState, useEffect, useRef } from 'react';
import { validateField, formatValidationMessage } from '../../../utils/helpers';
import './FormField.css';

const FormField = ({
  label,
  value,
  onChange,
  type = 'text',
  name,
  required = false,
  helpText = '',
  placeholder = '',
  maxLength = null,
  minLength = null,
  validation = [],
  showCounter = false,
  className = '',
  disabled = false,
  autoComplete = '',
  onFocus = null,
  onBlur = null,
  onValidationChange = null,
  children,
  ...props
}) => {
  const [focused, setFocused] = useState(false);
  const [touched, setTouched] = useState(false);
  const [validationResult, setValidationResult] = useState({ isValid: true, error: null });
  const onValidationChangeRef = useRef(onValidationChange);

  // Update the ref when the callback changes
  useEffect(() => {
    onValidationChangeRef.current = onValidationChange;
  }, [onValidationChange]);

  // Store validation rules in a ref to avoid dependency issues
  const validationRef = useRef(validation);
  useEffect(() => {
    validationRef.current = validation;
  }, [validation]);

  // Validation effect - run basic validation and custom rules
  useEffect(() => {
    if (!touched && !value) {
      setValidationResult({ isValid: true, error: null });
      return;
    }
    
    let result = validateField(name, value, { maxLength, minLength });
    
    // Run custom validation rules if basic validation passes
    const currentValidation = validationRef.current;
    if (result.isValid && currentValidation && currentValidation.length > 0) {
      for (const rule of currentValidation) {
        if (!rule.validator(value)) {
          result = {
            isValid: false,
            error: formatValidationMessage(rule.message, { value, maxLength, minLength })
          };
          break;
        }
      }
    }
    
    setValidationResult(result);
    
    // Notify parent of validation change using ref to avoid dependency issues
    if (onValidationChangeRef.current) {
      onValidationChangeRef.current(result.isValid, result.error);
    }
  }, [value, touched, name, maxLength, minLength]);

  const handleFocus = (e) => {
    setFocused(true);
    if (onFocus) onFocus(e);
  };

  const handleBlur = (e) => {
    setFocused(false);
    setTouched(true);
    if (onBlur) onBlur(e);
  };

  const handleChange = (e) => {
    let newValue = e.target.value;
    
    // Apply maxLength constraint
    if (maxLength && newValue.length > maxLength) {
      newValue = newValue.substring(0, maxLength);
    }
    
    onChange(newValue);
  };

  const getFieldId = () => name || label?.toLowerCase().replace(/\s+/g, '_');
  const fieldId = getFieldId();
  
  const hasError = touched && !validationResult.isValid;
  const showHelp = focused || hasError;
  const characterCount = value ? value.length : 0;

  const fieldClasses = [
    'form-field',
    className,
    { 'form-field--focused': focused },
    { 'form-field--error': hasError },
    { 'form-field--valid': touched && validationResult.isValid && value },
    { 'form-field--disabled': disabled }
  ].filter(Boolean).join(' ');

  const inputClasses = [
    'form-field__input',
    { 'form-field__input--error': hasError },
    { 'form-field__input--valid': touched && validationResult.isValid && value }
  ].filter(Boolean).join(' ');

  const renderInput = () => {
    if (children) {
      return children;
    }

    const inputProps = {
      id: fieldId,
      name: name,
      value: value || '',
      onChange: handleChange,
      onFocus: handleFocus,
      onBlur: handleBlur,
      placeholder: placeholder,
      disabled: disabled,
      autoComplete: autoComplete,
      className: inputClasses,
      'aria-describedby': `${fieldId}-help ${fieldId}-error`,
      'aria-invalid': hasError,
      'aria-required': required,
      ...props
    };

    switch (type) {
      case 'textarea':
        return (
          <textarea
            {...inputProps}
            rows={props.rows || 4}
          />
        );
      case 'select':
        return (
          <select {...inputProps}>
            {props.options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
      default:
        return <input {...inputProps} type={type} />;
    }
  };

  return (
    <div className={fieldClasses}>
      {label && (
        <label htmlFor={fieldId} className="form-field__label">
          {label}
          {required && <span className="form-field__required" aria-label="required">*</span>}
        </label>
      )}
      
      <div className="form-field__input-container">
        {renderInput()}
        
        {/* Validation status indicator */}
        {touched && (
          <div className="form-field__status">
            {validationResult.isValid && value ? (
              <span className="form-field__status-icon form-field__status-icon--valid" aria-label="Valid">
                ✓
              </span>
            ) : hasError ? (
              <span className="form-field__status-icon form-field__status-icon--error" aria-label="Error">
                ✗
              </span>
            ) : null}
          </div>
        )}
      </div>

      {/* Character counter */}
      {showCounter && maxLength && (
        <div className="form-field__counter">
          <span className={characterCount > maxLength * 0.9 ? 'form-field__counter--warning' : ''}>
            {characterCount}/{maxLength}
          </span>
        </div>
      )}

      {/* Help text */}
      {showHelp && (helpText || hasError) && (
        <div className="form-field__help" id={`${fieldId}-help`}>
          {hasError ? (
            <div className="form-field__error" id={`${fieldId}-error`} role="alert">
              {validationResult.error}
            </div>
          ) : (
            <div className="form-field__help-text">
              {helpText}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FormField;