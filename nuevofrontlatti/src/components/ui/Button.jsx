import React from 'react';
import { FaSpinner } from 'react-icons/fa';
import { BUTTON_VARIANTS, BUTTON_SIZES } from '../../constants/design';

const Button = ({ 
  children, 
  variant = "primary", 
  size = "md",
  loading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  className = "",
  fullWidth = false,
  ...props 
}) => {
  const baseClasses = "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed border";
  
  const variantClasses = BUTTON_VARIANTS[variant] || BUTTON_VARIANTS.primary;
  const sizeClasses = BUTTON_SIZES[size] || BUTTON_SIZES.md;
  
  const classes = [
    baseClasses,
    variantClasses.base,
    variantClasses.hover,
    variantClasses.focus,
    variantClasses.disabled,
    sizeClasses,
    fullWidth ? 'w-full' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <button 
      className={classes}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <FaSpinner className="animate-spin mr-2" size={16} />
      )}
      {leftIcon && !loading && (
        <span className="mr-2">{leftIcon}</span>
      )}
      {children}
      {rightIcon && !loading && (
        <span className="ml-2">{rightIcon}</span>
      )}
    </button>
  );
};

export default Button;