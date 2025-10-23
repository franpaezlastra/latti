import React from 'react';
import { FaSpinner } from 'react-icons/fa';

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
  
  const variantClasses = {
    primary: 'bg-blue-600 text-white border-transparent hover:bg-blue-700 focus:ring-blue-500 disabled:bg-blue-300',
    secondary: 'bg-gray-100 text-gray-900 border-gray-300 hover:bg-gray-200 focus:ring-gray-500 disabled:bg-gray-50 disabled:text-gray-400',
    outline: 'bg-transparent text-gray-700 border-gray-300 hover:bg-gray-50 focus:ring-gray-500 disabled:bg-transparent disabled:text-gray-400',
    ghost: 'bg-transparent text-gray-600 border-transparent hover:bg-gray-100 focus:ring-gray-500 disabled:bg-transparent disabled:text-gray-400',
    success: 'bg-green-600 text-white border-transparent hover:bg-green-700 focus:ring-green-500 disabled:bg-green-300',
    warning: 'bg-yellow-500 text-white border-transparent hover:bg-yellow-600 focus:ring-yellow-500 disabled:bg-yellow-300',
    danger: 'bg-red-600 text-white border-transparent hover:bg-red-700 focus:ring-red-500 disabled:bg-red-300',
    purple: 'bg-purple-600 text-white border-transparent hover:bg-purple-700 focus:ring-purple-500 disabled:bg-purple-300',
  }[variant] || 'bg-blue-600 text-white border-transparent hover:bg-blue-700 focus:ring-blue-500 disabled:bg-blue-300';
  
  const sizeClasses = {
    xs: 'px-2 py-1 text-xs',
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
    xl: 'px-8 py-4 text-lg',
  }[size] || 'px-4 py-2 text-sm';
  
  const classes = [
    baseClasses,
    variantClasses,
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