import React from 'react';
import { FaTimes } from 'react-icons/fa';

const ModalForm = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  maxWidth = "max-w-md",
  showCloseButton = true,
  backdropBlur = true,
  closeOnBackdropClick = true
}) => {
  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && closeOnBackdropClick) {
      onClose();
    }
  };

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${
        backdropBlur ? 'bg-black/50 backdrop-blur-sm' : 'bg-black/50'
      }`}
      onClick={handleBackdropClick}
    >
      <div className={`bg-white rounded-2xl shadow-2xl ${maxWidth} w-full max-h-[calc(100vh-40px)] flex flex-col transform transition-all duration-300 ease-out`}>
        {/* Header */}
        <div className="relative flex items-center justify-center p-6 border-b border-gray-100 flex-shrink-0">
          <h2 className="text-xl font-semibold text-gray-900 font-[TransformaSans_Trial-Bold] text-center">
            {title}
          </h2>
          {showCloseButton && (
            <button
              onClick={onClose}
              className="absolute right-6 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all duration-200"
            >
              <FaTimes size={18} />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-4 flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

export default ModalForm; 