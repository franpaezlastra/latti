import React from 'react';
import { FaBox, FaCog, FaTag } from 'react-icons/fa';
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
      <div className="py-4 space-y-3">
        {/* Insumo Simple */}
        <Button
          onClick={() => handleSeleccion("insumo-simple")}
          variant="primary"
          className="w-full py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-3"
        >
          <FaBox className="text-xl" />
          Insumo Simple
        </Button>

        {/* Insumo Compuesto */}
        <Button
          onClick={() => handleSeleccion("insumo-compuesto")}
          variant="secondary"
          className="w-full py-4 text-lg font-semibold bg-purple-600 hover:bg-purple-700 shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-3"
        >
          <FaCog className="text-xl" />
          Insumo Compuesto
        </Button>

        {/* Producto */}
        <Button
          onClick={() => handleSeleccion("producto")}
          variant="secondary"
          className="w-full py-4 text-lg font-semibold bg-green-600 hover:bg-green-700 shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-3"
        >
          <FaTag className="text-xl" />
          Producto
        </Button>
      </div>
    </ModalForm>
  );
};

export default MovimientoSeleccionModal; 