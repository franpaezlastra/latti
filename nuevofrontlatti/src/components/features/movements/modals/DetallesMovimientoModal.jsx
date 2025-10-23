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
      <div className="h-[70vh] flex flex-col">
        {/* Contenido con scroll propio */}
        <div className="flex-1 overflow-y-auto pr-2 space-y-6">
        {/* Información básica */}
        <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 rounded-xl p-6 shadow-sm border border-blue-100">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="flex items-center gap-4 bg-white rounded-lg p-4 shadow-sm border border-gray-100">
              <div className="p-3 bg-blue-100 rounded-xl">
                <FaCalendar className="text-blue-600" size={24} />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Fecha</p>
                <p className="text-lg font-bold text-gray-800 mt-1">{movimiento.fecha}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-white rounded-lg p-4 shadow-sm border border-gray-100">
              <div className={`p-3 rounded-xl ${esEntrada ? 'bg-green-100' : 'bg-red-100'}`}>
                {esEntrada ? (
                  <FaArrowUp className="text-green-600" size={24} />
                ) : (
                  <FaArrowDown className="text-red-600" size={24} />
                )}
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Tipo</p>
                <p className={`text-lg font-bold mt-1 ${esEntrada ? 'text-green-700' : 'text-red-700'}`}>
                  {esEntrada ? 'Entrada' : 'Salida'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-white rounded-lg p-4 shadow-sm border border-gray-100">
              <div className="p-3 bg-purple-100 rounded-xl">
                <FaList className="text-purple-600" size={24} />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Insumos</p>
                <p className="text-lg font-bold text-gray-800 mt-1">
                  {movimiento.insumos?.length || 0}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-white rounded-lg p-4 shadow-sm border border-gray-100">
              <div className="p-3 bg-orange-100 rounded-xl">
                <FaTag className="text-orange-600" size={24} />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Total</p>
                <p className="text-lg font-bold text-orange-700 mt-1">
                  {formatPrice(total)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Descripción */}
        <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl p-6 shadow-sm border border-gray-100">
          <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <div className="p-2 bg-gray-200 rounded-lg">
              <FaWeight className="text-gray-600" size={16} />
            </div>
            Descripción
          </h4>
          <p className="text-gray-600 bg-white rounded-lg p-4 border border-gray-200">
            {movimiento.descripcion || 'Sin descripción'}
          </p>
        </div>

        {/* Lista de insumos */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-gray-800 flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FaBox className="text-blue-600" size={18} />
            </div>
            Insumos {esEntrada ? 'Ingresados' : 'Salidos'}
          </h4>
          
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gradient-to-r from-gray-50 to-slate-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Insumo
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Cantidad
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Precio Unitario
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
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
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                            {nombre}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 font-medium">
                          {cantidad}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {formatPrice(precioUnitario)}
                        </td>
                        <td className="px-6 py-4 text-sm font-bold text-gray-900">
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
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-6 shadow-lg">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white bg-opacity-20 rounded-lg">
                <FaTag className="text-white" size={24} />
              </div>
              <div>
                <p className="text-white text-sm font-medium opacity-90">Total del Movimiento</p>
                <p className="text-white text-2xl font-bold">{formatPrice(total)}</p>
              </div>
            </div>
          </div>
        </div>
        </div>

        {/* Botón de cerrar - fijo en la parte inferior */}
        <div className="flex justify-end pt-4 border-t border-gray-200 bg-white">
          <button
            onClick={onClose}
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
          >
            Cerrar
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default DetallesMovimientoModal;
