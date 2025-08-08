import React from 'react';
import { clsx } from 'clsx';

const Badge = ({
  children,
  variant = 'info',
  size = 'md',
  className = '',
  ...props
}) => {
  const baseClasses = 'badge inline-flex items-center font-medium';
  
  const variantClasses = {
    success: 'badge-success',
    warning: 'badge-warning',
    danger: 'badge-danger',
    info: 'badge-info',
  };
  
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-xs',
    lg: 'px-3 py-1 text-sm',
  };
  
  const classes = clsx(
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    className
  );
  
  return (
    <span className={classes} {...props}>
      {children}
    </span>
  );
};

export default Badge; 