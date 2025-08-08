import React from 'react';
import { FaList } from 'react-icons/fa';

const DetallesProducto = ({ producto }) => {
  if (!producto) return null;

  return (
    <div className="space-y-6">
      {/* Sección de receta */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <FaList className="text-blue-500" />
            Receta
          </h3>
        </div>

        <div className="p-6">
          {producto.receta && producto.receta.length > 0 ? (
            <div className="space-y-2">
              {producto.receta.map((detalle, index) => (
                <p key={index} className="text-gray-700">
                  {detalle.nombre || 'Insumo no disponible'} - {detalle.cantidadNecesaria} {detalle.unidadMedida || 'unidades'}
                </p>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaList className="text-gray-400 text-xl" />
              </div>
              <p className="text-gray-500 font-medium">Este producto no tiene receta</p>
              <p className="text-sm text-gray-400 mt-1">
                No se han definido ingredientes para este producto
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DetallesProducto; 