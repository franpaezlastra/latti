import React from 'react';
import ModalForm from '../../../ui/ModalForm';
import Button from '../../../ui/Button';

const MovimientoSeleccionModal = ({ isOpen, onClose, onSeleccion }) => {
  const handleSeleccion = (tipo) => {
    onSeleccion(tipo);
  };

  return (
    <ModalForm
      isOpen={isOpen}
      onClose={onClose}
      title="¿Qué tipo de movimiento deseas agregar?"
      maxWidth="max-w-md"
    >
      <div className="flex flex-col items-center py-4">
        <div className="flex gap-4 items-center">
          <Button
            onClick={() => handleSeleccion("insumo")}
            variant="primary"
            className="w-40 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
          >
            Insumo
          </Button>
          <Button
            onClick={() => handleSeleccion("producto")}
            variant="secondary"
            className="w-40 py-3 text-lg font-semibold bg-green-600 hover:bg-green-700 shadow-lg hover:shadow-xl transition-all duration-200"
          >
            Producto
          </Button>
        </div>
      </div>
    </ModalForm>
  );
};

export default MovimientoSeleccionModal; 