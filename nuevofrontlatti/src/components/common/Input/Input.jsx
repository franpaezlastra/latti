import React, { forwardRef } from 'react';
import { clsx } from 'clsx';

const Input = forwardRef(({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  onBlur,
  error,
  disabled = false,
  required = false,
  fullWidth = true,
  className = '',
  ...props
}, ref) => {
  // Determinar autocomplete basado en el tipo
  const getAutocomplete = () => {
    if (type === 'password') {
      return 'current-password';
    }
    if (type === 'email' || props.name === 'email' || props.name === 'username') {
      return 'username';
    }
    return 'off';
  };

  const inputClasses = clsx(
    'input',
    {
      'border-danger-300 focus:ring-danger-500 focus:border-danger-300': error,
      'bg-gray-100 cursor-not-allowed': disabled,
    },
    className
  );
  
  return (
    <div className={fullWidth ? 'w-full' : ''}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-danger-500 ml-1">*</span>}
        </label>
      )}
      <input
        ref={ref}
        type={type}
        className={inputClasses}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        disabled={disabled}
        required={required}
        autoComplete={getAutocomplete()}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-danger-600">{error}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input; 