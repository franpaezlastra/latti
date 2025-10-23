import React from 'react';

const Card = ({ 
  children, 
  variant = "default",
  className = "",
  padding = "md",
  ...props 
}) => {
  const baseClasses = "rounded-xl transition-all duration-200";
  
  const variantClasses = {
    default: 'bg-white border border-gray-200 shadow-sm',
    elevated: 'bg-white border border-gray-200 shadow-md',
    flat: 'bg-white border-0 shadow-none',
    outlined: 'bg-transparent border border-gray-200 shadow-none',
  }[variant] || 'bg-white border border-gray-200 shadow-sm';
  
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };
  
  const classes = [
    baseClasses,
    variantClasses,
    paddingClasses[padding],
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
};

// Subcomponentes de Card
Card.Header = ({ children, className = "", ...props }) => (
  <div className={`border-b border-gray-200 pb-4 mb-4 ${className}`} {...props}>
    {children}
  </div>
);

Card.Body = ({ children, className = "", ...props }) => (
  <div className={className} {...props}>
    {children}
  </div>
);

Card.Footer = ({ children, className = "", ...props }) => (
  <div className={`border-t border-gray-200 pt-4 mt-4 ${className}`} {...props}>
    {children}
  </div>
);

Card.Title = ({ children, className = "", ...props }) => (
  <h3 className={`text-lg font-semibold text-gray-900 ${className}`} {...props}>
    {children}
  </h3>
);

Card.Description = ({ children, className = "", ...props }) => (
  <p className={`text-sm text-gray-600 mt-1 ${className}`} {...props}>
    {children}
  </p>
);

export default Card;
