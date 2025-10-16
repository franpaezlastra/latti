import React from 'react';
import { FaBox, FaCog, FaEye, FaInfoCircle, FaList, FaTag, FaWeight } from 'react-icons/fa';
import FormModal from '../../../ui/FormModal';
import RecetaInsumoDisplay from '../components/RecetaInsumoDisplay';
import { formatQuantity, formatPrice } from '../../../../utils/formatters';
import { getAbreviaturaByValue } from '../../../../constants/unidadesMedida';

const DetallesInsumoModal = ({ isOpen, onClose, insumo }) => {
  if (!insumo) return null;

  const esCompuesto = insumo.tipoOriginal === 'COMPUESTO' || insumo.tipo === 'COMPUESTO';

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title={`Detalles del Insumo`}
      submitText="Cerrar"
      onSubmit={onClose}
      maxWidth="max-w-2xl"
      showCancel={false}
    >
      <div className="space-y-6">
        {/* Información básica */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
          <div className="flex items-center gap-4 mb-4">
            {esCompuesto ? (
              <FaCog className="text-purple-600" size={32} />
            ) : (
              <FaBox className="text-blue-600" size={32} />
            )}
            <div>
              <h3 className="text-2xl font-bold text-gray-800">{insumo.nombre}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  esCompuesto
                    ? 'bg-purple-100 text-purple-800'
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {esCompuesto ? 'Insumo Compuesto' : 'Insumo Simple'}
                </span>
              </div>
            </div>
          </div>

          {/* Detalles del insumo */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <FaWeight className="text-gray-600" size={16} />
                <span className="text-sm font-medium text-gray-600">Unidad de Medida:</span>
                <span className="text-sm text-gray-800">
                  {getAbreviaturaByValue(insumo.unidadMedida) || insumo.unidadMedida}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <FaTag className="text-gray-600" size={16} />
                <span className="text-sm font-medium text-gray-600">Stock Actual:</span>
                <span className="text-sm text-gray-800">
                  {formatQuantity(insumo.stockActual || 0, getAbreviaturaByValue(insumo.unidadMedida) || '')}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <FaInfoCircle className="text-gray-600" size={16} />
                <span className="text-sm font-medium text-gray-600">Precio Unitario:</span>
                <span className="text-sm text-gray-800">
                  {formatPrice(insumo.precioDeCompra || 0)}
                </span>
              </div>
              
              {!esCompuesto && (
                <div className="flex items-center gap-2">
                  <FaList className="text-gray-600" size={16} />
                  <span className="text-sm font-medium text-gray-600">Total Invertido:</span>
                  <span className="text-sm text-gray-800">
                    {formatPrice(insumo.totalInvertido || 0)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Receta del insumo compuesto */}
        {esCompuesto && insumo.receta && insumo.receta.length > 0 && (
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <FaList className="text-purple-600" size={18} />
              Receta del Insumo Compuesto
            </h4>
            <RecetaInsumoDisplay receta={insumo.receta} />
          </div>
        )}

        {/* Información adicional para insumos simples */}
        {!esCompuesto && (
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <FaInfoCircle className="text-blue-600" size={18} />
              Información del Insumo Simple
            </h4>
            <p className="text-sm text-gray-600">
              Este es un insumo base que puede ser utilizado como componente en la creación de insumos compuestos.
              Su stock se puede gestionar mediante movimientos de entrada y salida.
            </p>
          </div>
        )}

        {/* Información adicional para insumos compuestos */}
        {esCompuesto && (
          <div className="bg-purple-50 rounded-lg p-4">
            <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <FaCog className="text-purple-600" size={18} />
              Información del Insumo Compuesto
            </h4>
            <p className="text-sm text-gray-600 mb-3">
              Este insumo está compuesto por otros insumos base. Para ensamblarlo, se descontarán automáticamente 
              los componentes necesarios del stock y se calculará el precio unitario basado en el costo de los componentes.
            </p>
            <div className="text-xs text-purple-700 bg-purple-100 rounded p-2">
              <strong>💡 Consejo:</strong> Para ensamblar este insumo, ve a la sección de movimientos y usa la opción "Ensamble".
            </div>
          </div>
        )}
      </div>
    </FormModal>
  );
};

export default DetallesInsumoModal;
