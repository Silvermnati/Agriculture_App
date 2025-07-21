import React from 'react';
import PropTypes from 'prop-types';
import './Input.css';

const Input = ({
  id,
  name,
  type = 'text',
  label,
  value,
  onChange,
  placeholder,
  error,
  required = false,
  disabled = false,
  className = '',
  ...props
}) => {
  return (
    <div className={`input-group ${error ? 'has-error' : ''} ${className}`}>
      {label && (
        <label htmlFor={id} className="input-label">
          {label}
          {required && <span className="required-mark">*</span>}
        </label>
      )}
      <input
        id={id}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className="input-field"
        {...props}
      />
      {error && <div className="input-error">{error}</div>}
    </div>
  );
};

Input.propTypes = {
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    type: PropTypes.string,
    label: PropTypes.string,
    value: PropTypes.any.isRequired,
    onChange: PropTypes.func.isRequired,
    placeholder: PropTypes.string,
    error: PropTypes.string,
    required: PropTypes.bool,
    disabled: PropTypes.bool,
    className: PropTypes.string,
};

export default Input;