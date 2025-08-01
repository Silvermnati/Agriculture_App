import React from 'react';

const FormField = ({ label, type = 'text', name, value, onChange, placeholder, required }) => {
  const id = name || label.toLowerCase().replace(/\s+/g, '_');

  return (
    <div className="form-group">
      <label htmlFor={id}>{label}</label>
      <input
        type={type}
        id={id}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
      />
    </div>
  );
};

export default FormField;
