import React from 'react';
import { FaExclamationTriangle, FaTrash } from 'react-icons/fa';
import Modal from './Modal';
import Button from './Button';
import ErrorMessage from './ErrorMessage';

const DeleteConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirmar eliminación",
  message = "¿Estás seguro de que quieres eliminar este elemento?",
  confirmText = "Eliminar",
  cancelText = "Cancelar",
  loading = false,
  error = false,
  errorMessage = "",
  variant = "danger",
  className = "",
  ...props
}) => {
  const handleConfirm = () => {
    if (!loading) {
      onConfirm();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      className={className}
      {...props}
    >
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
            <FaExclamationTriangle className="text-red-600" size={20} />
          </div>
        </div>
        
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {title}
          </h3>
          
          <p className="text-sm text-gray-600 mb-4">
            {message}
          </p>
          
          {error && errorMessage && (
            <ErrorMessage
              message={errorMessage}
              variant="error"
              showIcon={false}
              className="mb-4"
            />
          )}
          
          <div className="flex items-center justify-end gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              {cancelText}
            </Button>
            
            <Button
              variant="danger"
              onClick={handleConfirm}
              loading={loading}
              leftIcon={<FaTrash size={14} />}
            >
              {confirmText}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default DeleteConfirmationModal;