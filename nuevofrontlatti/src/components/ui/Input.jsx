import React, { forwardRef } from 'react';

const Input = forwardRef(({
  label,
  placeholder,
  type = 'text',
  name,
  value,
  onChange,
  disabled = false,
  required = false,
  error,
  className = "",
  ...props
}, ref) => {
  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <label 
          htmlFor={name} 
          className="block text-sm font-medium text-gray-700 font-[TransformaSans_Trial-Bold]"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        ref={ref}
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        className={`
          w-full px-3 py-2 text-sm border rounded-md shadow-sm 
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
          placeholder-gray-400 transition-all duration-200 
          disabled:bg-gray-100 disabled:cursor-not-allowed
          ${error 
            ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
            : 'border-gray-300'
          }
        `}
        {...props}
      />
      {error && (
        <p className="text-red-600 text-xs font-medium">{error}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input; 