import React from 'react';
import { FaExclamationCircle } from 'react-icons/fa';

const ErrorMessage = ({ message, className = "" }) => {
  if (!message) return null;

  return (
    <div className={`flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg ${className}`}>
      <FaExclamationCircle className="text-red-500 flex-shrink-0" size={20} />
      <div>
        <h4 className="text-sm font-medium text-red-800">Error</h4>
        <p className="text-sm text-red-700 mt-1">{message}</p>
      </div>
    </div>
  );
};

export default ErrorMessage; 