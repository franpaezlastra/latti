import React from 'react';

const LoadingSpinner = ({ size = "medium", message = "Cargando..." }) => {
  const sizeClasses = {
    small: "w-4 h-4",
    medium: "w-8 h-8",
    large: "w-12 h-12"
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-100">
      <div className="text-center">
        <div className={`${sizeClasses[size]} animate-spin rounded-full border-4 border-blue-200 border-t-blue-600 mx-auto mb-4`}></div>
        <p className="text-blue-600 font-medium">{message}</p>
      </div>
    </div>
  );
};

export default LoadingSpinner; 