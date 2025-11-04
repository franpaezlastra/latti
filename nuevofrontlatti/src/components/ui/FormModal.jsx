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
            <div className="mt-4 mb-2 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg shadow-sm">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <div className="ml-3">
                  <p className="text-sm font-semibold text-red-800">{errorMessage}</p>
                </div>
              </div>
            </div>
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