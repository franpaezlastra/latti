import React from 'react';
import { FaExclamationTriangle, FaRedo } from 'react-icons/fa';
import Button from './Button';
import Card from './Card';

const ErrorMessage = ({ 
  message = "Ha ocurrido un error inesperado",
  onRetry,
  retryText = "Reintentar",
  showIcon = true,
  variant = "error",
  className = "",
  ...props 
}) => {
  const variants = {
    error: {
      icon: 'text-red-600',
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-800',
      title: 'Error'
    },
    warning: {
      icon: 'text-yellow-600',
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      text: 'text-yellow-800',
      title: 'Advertencia'
    },
    info: {
      icon: 'text-blue-600',
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-800',
      title: 'Información'
    }
  };

  const variantStyles = variants[variant] || variants.error;

  return (
    <Card 
      className={`${variantStyles.bg} ${variantStyles.border} ${className}`}
      {...props}
    >
      <div className="flex items-start gap-3">
        {showIcon && (
          <div className={`p-2 rounded-lg ${variantStyles.bg}`}>
            <FaExclamationTriangle className={variantStyles.icon} size={20} />
          </div>
        )}
        
        <div className="flex-1">
          <h3 className={`text-sm font-semibold ${variantStyles.text} mb-1`}>
            {variantStyles.title}
          </h3>
          <p className={`text-sm ${variantStyles.text} mb-3`}>
            {message}
          </p>
          
          {onRetry && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRetry}
              leftIcon={<FaRedo size={14} />}
              className="text-gray-700 hover:text-gray-900"
            >
              {retryText}
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};

export default ErrorMessage;