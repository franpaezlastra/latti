import React from 'react';
import { FaBox, FaCog, FaTimes, FaArrowRight } from 'react-icons/fa';
import Button from '../../../ui/Button';

const MovimientoSeleccionModal = ({
  isOpen,
  onClose,
  onSeleccionarInsumo,
  onSeleccionarInsumoCompuesto,
  onSeleccionarProducto
}) => {
  if (!isOpen) return null;

  const opciones = [
    {
      id: 'insumo',
      titulo: 'Movimiento de Insumo',
      descripcion: 'Entrada o salida de materias primas individuales',
      icono: <FaBox className="text-blue-600" size={24} />,
      color: 'blue',
      onClick: onSeleccionarInsumo
    },
    {
      id: 'insumoCompuesto',
      titulo: 'Ensamble de Insumo Compuesto',
      descripcion: 'Crear insumos compuestos usando componentes base',
      icono: <FaCog className="text-purple-600" size={24} />,
      color: 'purple',
      onClick: onSeleccionarInsumoCompuesto
    },
    {
      id: 'producto',
      titulo: 'Movimiento de Producto',
      descripcion: 'Producción o venta de productos terminados',
      icono: <FaCog className="text-green-600" size={24} />,
      color: 'green',
      onClick: onSeleccionarProducto
    }
  ];

  const getColorClasses = (color) => {
    const colors = {
      blue: 'border-blue-200 bg-blue-50 hover:bg-blue-100',
      purple: 'border-purple-200 bg-purple-50 hover:bg-purple-100',
      green: 'border-green-200 bg-green-50 hover:bg-green-100'
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 border border-gray-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Nuevo Movimiento</h3>
            <p className="text-sm text-gray-600 mt-1">Selecciona el tipo de movimiento que deseas crear</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Cerrar modal"
          >
            <FaTimes size={20} />
          </button>
        </div>

        {/* Opciones */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {opciones.map((opcion) => (
              <button
                key={opcion.id}
                onClick={opcion.onClick}
                className={`p-6 rounded-lg border-2 transition-all duration-200 text-left group ${getColorClasses(opcion.color)}`}
              >
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="p-3 bg-white rounded-full shadow-sm">
                    {opcion.icono}
                  </div>
                  
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">
                      {opcion.titulo}
                    </h4>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {opcion.descripcion}
                    </p>
                  </div>

                  <div className="flex items-center text-sm font-medium text-gray-500 group-hover:text-gray-700 transition-colors">
                    <span>Crear movimiento</span>
                    <FaArrowRight className="ml-2" size={12} />
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-gray-100">
          <Button
            onClick={onClose}
            variant="outline"
          >
            Cancelar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MovimientoSeleccionModal; 