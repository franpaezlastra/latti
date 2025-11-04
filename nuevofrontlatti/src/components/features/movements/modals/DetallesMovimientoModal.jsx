import React from 'react';
import { FaBox, FaCalendar, FaList, FaTag, FaWeight, FaArrowDown, FaArrowUp } from 'react-icons/fa';
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
      size="xl"
    >
      <div className="max-h-[75vh] flex flex-col">
        {/* Contenido con scroll propio */}
        <div className="flex-1 overflow-y-auto pr-2 space-y-4">
        {/* Información básica */}
        <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 rounded-lg p-4 shadow-sm border border-blue-100">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="flex items-center gap-3 bg-white rounded-lg p-3 shadow-sm border border-gray-100">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FaCalendar className="text-blue-600" size={18} />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase">Fecha</p>
                <p className="text-base font-bold text-gray-800">{movimiento.fecha}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-white rounded-lg p-3 shadow-sm border border-gray-100">
              <div className={`p-2 rounded-lg ${esEntrada ? 'bg-green-100' : 'bg-red-100'}`}>
                {esEntrada ? (
                  <FaArrowUp className="text-green-600" size={18} />
                ) : (
                  <FaArrowDown className="text-red-600" size={18} />
                )}
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase">Tipo</p>
                <p className={`text-base font-bold ${esEntrada ? 'text-green-700' : 'text-red-700'}`}>
                  {esEntrada ? 'Entrada' : 'Salida'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-white rounded-lg p-3 shadow-sm border border-gray-100">
              <div className="p-2 bg-purple-100 rounded-lg">
                <FaList className="text-purple-600" size={18} />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase">Insumos</p>
                <p className="text-base font-bold text-gray-800">
                  {movimiento.insumos?.length || 0}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-white rounded-lg p-3 shadow-sm border border-gray-100">
              <div className="p-2 bg-orange-100 rounded-lg">
                <FaTag className="text-orange-600" size={18} />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase">Total</p>
                <p className="text-base font-bold text-orange-700">
                  {formatPrice(total)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Descripción */}
        {movimiento.descripcion && (
          <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-lg p-4 shadow-sm border border-gray-100">
            <h4 className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
              <FaWeight className="text-gray-600" size={14} />
              Descripción
            </h4>
            <p className="text-sm text-gray-600 bg-white rounded-lg p-3 border border-gray-200">
              {movimiento.descripcion}
            </p>
          </div>
        )}

        {/* Lista de insumos */}
        <div className="space-y-3">
          <h4 className="text-base font-semibold text-gray-800 flex items-center gap-2 px-1">
            <FaBox className="text-blue-600" size={16} />
            Insumos {esEntrada ? 'Ingresados' : 'Salidos'}
          </h4>
          
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
            <div className="overflow-x-auto max-h-60 overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="bg-gradient-to-r from-gray-50 to-slate-50 border-b border-gray-200 sticky top-0">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">
                      Insumo
                    </th>
                    <th className="px-4 py-2 text-right text-xs font-semibold text-gray-600 uppercase">
                      Cantidad
                    </th>
                    <th className="px-4 py-2 text-right text-xs font-semibold text-gray-600 uppercase">
                      P. Unit.
                    </th>
                    <th className="px-4 py-2 text-right text-xs font-semibold text-gray-600 uppercase">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {movimiento.insumos?.map((insumo, index) => {
                    const nombre = insumo.nombreInsumo || insumo.nombre || insumo.insumo?.nombre || 'Sin nombre';
                    const cantidad = formatQuantity(insumo.cantidad, getAbreviaturaByValue(insumo.unidadMedida));
                    const precioUnitario = insumo.precioUnitario || (insumo.precioTotal / insumo.cantidad) || 0;
                    const total = insumo.precioTotal || 0;

                    return (
                      <tr key={index} className="hover:bg-blue-50 transition-colors duration-150">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                            {nombre}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 font-medium text-right">
                          {cantidad}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 text-right">
                          {formatPrice(precioUnitario)}
                        </td>
                        <td className="px-4 py-3 text-sm font-bold text-gray-900 text-right">
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
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg p-4 shadow-lg">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                <FaTag className="text-white" size={20} />
              </div>
              <div>
                <p className="text-white text-xs font-medium opacity-90">Total del Movimiento</p>
                <p className="text-white text-xl font-bold">{formatPrice(total)}</p>
              </div>
            </div>
          </div>
        </div>
        </div>

        {/* Botón de cerrar - fijo en la parte inferior */}
        <div className="flex justify-end pt-3 mt-2 border-t border-gray-200 bg-white">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg font-medium text-sm"
          >
            Cerrar
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default DetallesMovimientoModal;
