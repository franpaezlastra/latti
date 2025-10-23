import React from 'react';
import { FaBox, FaCalendar, FaList, FaTag, FaWeight } from 'react-icons/fa';
import { Modal } from '../../../ui';
import { formatQuantity, formatPrice } from '../../../../utils/formatters';
import { getAbreviaturaByValue } from '../../../../constants/unidadesMedida';

const DetallesMovimientoModal = ({ isOpen, onClose, movimiento }) => {
  if (!movimiento) return null;

  const esEntrada = movimiento.tipoMovimiento === 'ENTRADA';
  const total = movimiento.insumos?.reduce((sum, insumo) => sum + (insumo.precioTotal || 0), 0) || 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Detalles de ${esEntrada ? 'Entrada' : 'Salida'} - ${movimiento.fecha}`}
      size="lg"
    >
      <div className="space-y-6">
        {/* Información básica */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FaCalendar className="text-blue-600" size={20} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Fecha</p>
                <p className="text-lg font-semibold text-gray-800">{movimiento.fecha}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${esEntrada ? 'bg-green-100' : 'bg-red-100'}`}>
                <FaBox className={esEntrada ? 'text-green-600' : 'text-red-600'} size={20} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Tipo</p>
                <p className="text-lg font-semibold text-gray-800">
                  {esEntrada ? 'Entrada' : 'Salida'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 rounded-lg">
                <FaList className="text-gray-600" size={20} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Cantidad de Insumos</p>
                <p className="text-lg font-semibold text-gray-800">
                  {movimiento.insumos?.length || 0}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <FaTag className="text-orange-600" size={20} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-lg font-semibold text-gray-800">
                  {formatPrice(total)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Descripción */}
        {movimiento.descripcion && (
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-lg font-semibold text-gray-800 mb-2">Descripción</h4>
            <p className="text-gray-600">{movimiento.descripcion}</p>
          </div>
        )}

        {/* Lista de insumos */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <FaBox className="text-blue-600" size={18} />
            Insumos {esEntrada ? 'Ingresados' : 'Salidos'}
          </h4>
          
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Insumo
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cantidad
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Precio Unitario
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {movimiento.insumos?.map((insumo, index) => {
                    const nombre = insumo.nombreInsumo || insumo.nombre || insumo.insumo?.nombre || 'Sin nombre';
                    const cantidad = formatQuantity(insumo.cantidad, getAbreviaturaByValue(insumo.unidadMedida));
                    const precioUnitario = insumo.precioUnitario || (insumo.precioTotal / insumo.cantidad) || 0;
                    const total = insumo.precioTotal || 0;

                    return (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          {nombre}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {cantidad}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {formatPrice(precioUnitario)}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          {formatPrice(total)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Resumen total */}
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold text-gray-800">Total del Movimiento:</span>
            <span className="text-2xl font-bold text-blue-600">{formatPrice(total)}</span>
          </div>
        </div>

        {/* Botón de cerrar */}
        <div className="flex justify-end pt-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default DetallesMovimientoModal;
