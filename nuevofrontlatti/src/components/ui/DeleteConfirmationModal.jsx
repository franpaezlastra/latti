import React from 'react';
import { FaExclamationTriangle, FaTimes } from 'react-icons/fa';
import Button from './Button';

const DeleteConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Confirmar eliminación",
  message = "¿Estás seguro de que quieres eliminar este elemento?",
  confirmText = "Eliminar",
  cancelText = "Cancelar",
  isLoading = false,
  error = false,
  errorMessage = ""
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 border border-red-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <FaExclamationTriangle className="text-red-600" size={20} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Cerrar modal"
          >
            <FaTimes size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-600 text-sm leading-relaxed">
            {message}
          </p>
          <p className="text-red-600 text-xs mt-3 font-medium">
            Esta acción no se puede deshacer.
          </p>
          
          {/* Error Message */}
          {error && errorMessage && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm font-medium">
                {errorMessage}
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 p-6 border-t border-gray-100">
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1"
            disabled={isLoading}
          >
            {cancelText}
          </Button>
          <Button
            onClick={onConfirm}
            variant="danger"
            className="flex-1"
            loading={isLoading}
            disabled={isLoading}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal; 