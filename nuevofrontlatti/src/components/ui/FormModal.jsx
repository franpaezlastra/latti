import React from 'react';
import ModalForm from './ModalForm';
import Button from './Button';

const FormModal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  onSubmit, 
  submitText = "Guardar",
  cancelText = "Cancelar",
  isSubmitting = false,
  error = false,
  errorMessage = "",
  maxWidth = "max-w-md",
  closeOnBackdropClick = true
}) => {
  // 🔥 Debug: Log cuando cambia el estado de error
  React.useEffect(() => {
    if (error && errorMessage) {
      console.log('🔥 FormModal - ERROR DETECTED:', { error, errorMessage });
      console.log('🔥 FormModal - isOpen:', isOpen);
    }
  }, [error, errorMessage, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('🔥 FormModal - handleSubmit called');
    if (onSubmit) {
      onSubmit(e);
    }
  };

  return (
    <ModalForm
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      maxWidth={maxWidth}
      closeOnBackdropClick={closeOnBackdropClick && !error}
    >
      <div className="flex flex-col h-full">
        {/* Contenido scrolleable */}
        <div className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-4">
            {children}
          </form>

          {/* Errores - arriba de los botones */}
          {error && errorMessage && (
            <p className="mt-4 mb-2 text-sm font-medium text-red-600">
              {errorMessage}
            </p>
          )}
        </div>

        {/* Footer con botones - siempre fijo */}
        <div className="flex gap-3 pt-4 border-t border-gray-100 bg-white flex-shrink-0">
          <Button
            type="button"
            onClick={onClose}
            variant="outline"
            className="flex-1"
            disabled={isSubmitting}
          >
            {cancelText}
          </Button>
          <Button
            type="button"
            variant="primary"
            className="flex-1"
            loading={isSubmitting}
            disabled={isSubmitting}
            onClick={handleSubmit}
          >
            {isSubmitting ? 'Guardando...' : submitText}
          </Button>
        </div>
      </div>
    </ModalForm>
  );
};

export default FormModal; 