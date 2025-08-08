import React, { useEffect } from 'react';
import { FaCheckCircle, FaExclamationCircle, FaTimes } from 'react-icons/fa';

const SuccessToast = ({ show, message, type = "success", onClose, duration = 3000 }) => {
  useEffect(() => {
    if (show && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [show, duration, onClose]);

  if (!show) return null;

  const toastStyles = {
    success: {
      bg: "bg-green-50",
      border: "border-green-200",
      text: "text-green-800",
      icon: "text-green-500",
      iconComponent: FaCheckCircle
    },
    error: {
      bg: "bg-red-50",
      border: "border-red-200",
      text: "text-red-800",
      icon: "text-red-500",
      iconComponent: FaExclamationCircle
    },
    warning: {
      bg: "bg-yellow-50",
      border: "border-yellow-200",
      text: "text-yellow-800",
      icon: "text-yellow-500",
      iconComponent: FaExclamationCircle
    }
  };

  const style = toastStyles[type];
  const IconComponent = style.iconComponent;

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in">
      <div className={`${style.bg} ${style.border} border rounded-lg shadow-lg p-4 max-w-sm`}>
        <div className="flex items-start gap-3">
          <IconComponent className={`${style.icon} mt-0.5 flex-shrink-0`} size={20} />
          <div className="flex-1">
            <p className={`${style.text} font-medium text-sm`}>
              {message}
            </p>
          </div>
          <button
            onClick={onClose}
            className={`${style.text} hover:opacity-70 transition-opacity`}
            aria-label="Cerrar notificación"
          >
            <FaTimes size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuccessToast; 