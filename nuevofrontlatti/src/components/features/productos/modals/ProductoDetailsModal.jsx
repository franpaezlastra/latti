import React from 'react';
import ModalForm from '../../../ui/ModalForm';
import Button from '../../../ui/Button';
import DetallesProducto from '../../../ui/DetallesProducto';

const ProductoDetailsModal = ({ isOpen, onClose, producto }) => {
  if (!producto) return null;

  return (
    <ModalForm
      isOpen={isOpen}
      onClose={onClose}
      title={producto.nombre}
      maxWidth="max-w-4xl"
    >
      <div className="space-y-6">
        {/* Componente DetallesProducto */}
        <DetallesProducto producto={producto} />

        {/* Footer */}
        <div className="flex justify-end pt-4 border-t border-gray-100">
          <Button
            onClick={onClose}
            variant="outline"
          >
            Cerrar
          </Button>
        </div>
      </div>
    </ModalForm>
  );
};

export default ProductoDetailsModal; 