import React from 'react';
import { FaTimes, FaCalendarAlt, FaBox, FaArrowUp, FaArrowDown, FaDollarSign, FaChartLine } from 'react-icons/fa';

const MovimientoDetallesModal = ({ isOpen, onClose, movimiento }) => {
  if (!movimiento || !isOpen) return null;

  const esInsumo = movimiento.tipo === "Insumo";
  const detalles = movimiento.detalles || [];

  // Ordenar detalles alfabéticamente por nombre
  const detallesOrdenados = [...detalles].sort((a, b) => {
    const nombreA = a.nombre || a.insumo?.nombre || a.producto?.nombre || "";
    const nombreB = b.nombre || b.insumo?.nombre || b.producto?.nombre || "";
    return nombreA.localeCompare(nombreB, 'es', { sensitivity: 'base' });
  });

  const totalCantidad = detallesOrdenados.reduce((sum, det) => sum + (det.cantidad || 0), 0);

  // Calcular totales financieros para productos
  const totalVentas = esInsumo ? 0 : detallesOrdenados.reduce((sum, det) => 
    sum + ((det.precioVenta || 0) * (det.cantidad || 0)), 0);
  const totalInversion = esInsumo ? 0 : detallesOrdenados.reduce((sum, det) => 
    sum + ((det.precioInversion || 0) * (det.cantidad || 0)), 0);
  const ganancia = totalVentas - totalInversion;

  // Calcular total gastado para insumos
  const totalGastado = esInsumo ? detallesOrdenados.reduce((sum, det) => 
    sum + (det.precioTotal || 0), 0) : 0;

  const esEntrada = movimiento.tipoMovimiento === "ENTRADA";

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* Modal */}
        <div 
          className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header mejorado */}
          <div className="px-6 py-4 rounded-t-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white sticky top-0 z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {esEntrada ? (
                  <div className="p-2 bg-green-500 rounded-full">
                    <FaArrowUp className="text-white text-lg" />
                  </div>
                ) : (
                  <div className="p-2 bg-red-500 rounded-full">
                    <FaArrowDown className="text-white text-lg" />
                  </div>
                )}
                <div>
                  <h2 className="text-xl font-bold">
                    Detalles de {esEntrada ? "Entrada" : "Salida"} de {movimiento.tipo}
                  </h2>
                  <p className="text-blue-100 text-sm">
                    {new Date(movimiento.fecha).toLocaleDateString('es-ES', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-white hover:text-gray-200 transition-colors p-2 rounded-full hover:bg-white/10"
              >
                <FaTimes className="text-xl" />
              </button>
            </div>
          </div>

          {/* Contenido */}
          <div className="p-6 space-y-6">
            {/* Información general */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <div className="flex items-center space-x-2 mb-2">
                  <FaCalendarAlt className="text-blue-600" />
                  <span className="font-semibold text-blue-800">Fecha</span>
                </div>
                <p className="text-blue-900">{new Date(movimiento.fecha).toLocaleDateString()}</p>
              </div>
              
              <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                <div className="flex items-center space-x-2 mb-2">
                  <FaBox className="text-purple-600" />
                  <span className="font-semibold text-purple-800">Tipo</span>
                </div>
                <p className="text-purple-900 capitalize">{movimiento.tipo}</p>
              </div>
              
              <div className={`rounded-lg p-4 border ${
                esEntrada 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-center space-x-2 mb-2">
                  {esEntrada ? (
                    <FaArrowUp className="text-green-600" />
                  ) : (
                    <FaArrowDown className="text-red-600" />
                  )}
                  <span className={`font-semibold ${
                    esEntrada ? 'text-green-800' : 'text-red-800'
                  }`}>Movimiento</span>
                </div>
                <span className={`px-3 py-1 text-xs rounded-full font-medium ${
                  esEntrada
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}>
                  {esEntrada ? "Entrada" : "Salida"}
                </span>
              </div>
              
              <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                <div className="flex items-center space-x-2 mb-2">
                  <FaChartLine className="text-orange-600" />
                  <span className="font-semibold text-orange-800">Total Cantidad</span>
                </div>
                <p className="text-orange-900 font-bold text-xl">{totalCantidad}</p>
            </div>
          </div>

          {/* Tabla de detalles */}
            <div className="bg-gray-50 rounded-lg overflow-hidden border border-gray-200">
              <div className="px-6 py-4 bg-white border-b border-gray-200">
                <h3 className="font-bold text-gray-800 text-lg flex items-center space-x-2">
                  <FaBox className="text-blue-600" />
                  <span>
                    {esInsumo ? "Insumos" : "Productos"} {esEntrada ? "Ingresados" : "Salidos"}
                  </span>
              </h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                  <thead className="bg-gray-100">
                  <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      {esInsumo ? "Insumo" : "Producto"}
                    </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Cantidad
                    </th>
                    {esInsumo ? (
                        esEntrada && (
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Precio por Unidad
                        </th>
                      )
                    ) : (
                      <>
                          {esEntrada && (
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Fecha Vencimiento
                          </th>
                        )}
                          {!esEntrada && (
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Precio Venta
                          </th>
                        )}
                      </>
                    )}
                      {esInsumo && esEntrada && (
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Precio Total
                      </th>
                    )}
                      {!esInsumo && !esEntrada && (
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Total
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {detallesOrdenados.map((detalle, index) => (
                      <tr key={index} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-blue-600 font-semibold text-sm">
                                {index + 1}
                              </span>
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900">
                            {detalle.nombre || detalle.insumo?.nombre || detalle.producto?.nombre || "Sin nombre"}
                              </div>
                          {esInsumo && detalle.unidadMedida && (
                                <div className="text-xs text-gray-500">
                                  {detalle.unidadMedida}
                                </div>
                              )}
                            </div>
                        </div>
                      </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {detalle.cantidad}
                          </span>
                      </td>
                      {esInsumo ? (
                          esEntrada && (
                          <td className="px-6 py-4 text-sm text-gray-900">
                            ${detalle.precioDeCompra ? detalle.precioDeCompra.toFixed(2) : "0.00"}
                          </td>
                        )
                      ) : (
                        <>
                            {esEntrada && (
                            <td className="px-6 py-4 text-sm text-gray-900">
                              {detalle.fechaVencimiento ? 
                                new Date(detalle.fechaVencimiento).toLocaleDateString() : 
                                "No especificada"
                              }
                            </td>
                          )}
                            {!esEntrada && (
                            <td className="px-6 py-4 text-sm text-gray-900">
                              ${detalle.precioVenta ? parseFloat(detalle.precioVenta).toFixed(2) : "0.00"}
                            </td>
                          )}
                        </>
                      )}
                        {esInsumo && esEntrada && (
                          <td className="px-6 py-4 text-sm font-medium text-green-600">
                          ${detalle.precioTotal ? detalle.precioTotal.toFixed(2) : "0.00"}
                        </td>
                      )}
                        {!esInsumo && !esEntrada && (
                          <td className="px-6 py-4 text-sm font-medium text-green-600">
                          ${((detalle.precioVenta || 0) * (detalle.cantidad || 0)).toFixed(2)}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Resumen financiero */}
          <div className={`rounded-lg p-6 ${
            esInsumo 
                ? "bg-gradient-to-r from-green-50 to-green-100 border border-green-200" 
                : esEntrada
                  ? "bg-gradient-to-r from-green-50 to-green-100 border border-green-200"
                  : "bg-gradient-to-r from-red-50 to-red-100 border border-red-200"
          }`}>
            <div className="text-center">
                <div className="flex items-center justify-center space-x-2 mb-4">
                  <FaDollarSign className={`text-2xl ${
                    esInsumo || esEntrada ? 'text-green-600' : 'text-red-600'
                  }`} />
                  <h3 className={`text-xl font-bold ${
                    esInsumo || esEntrada ? 'text-green-800' : 'text-red-800'
                  }`}>
                    Resumen Financiero
                  </h3>
                </div>
                
              {esInsumo ? (
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <span className="font-bold text-green-700 text-3xl block">
                  Total Gastado: ${totalGastado.toFixed(2)}
                    </span>
                  </div>
                ) : esEntrada ? (
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <span className="font-bold text-green-700 text-3xl block">
                      Total Inversión: ${totalInversion.toFixed(2)}
                    </span>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <span className="font-bold text-red-700 text-xl block">
                        Total Ventas
                      </span>
                      <span className="font-bold text-red-700 text-2xl block">
                        ${totalVentas.toFixed(2)}
                      </span>
                    </div>
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <span className="font-bold text-red-700 text-xl block">
                        Total Inversión
                      </span>
                      <span className="font-bold text-red-700 text-2xl block">
                        ${totalInversion.toFixed(2)}
                      </span>
                    </div>
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <span className="font-bold text-xl block">
                        Ganancia
                      </span>
                      <span className={`font-bold text-2xl block ${
                      ganancia >= 0 ? 'text-green-700' : 'text-red-700'
                    }`}>
                        ${ganancia.toFixed(2)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Descripción */}
          {movimiento.descripcion && (
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center space-x-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  <span>Descripción</span>
                </h3>
                <p className="text-gray-700 leading-relaxed">{movimiento.descripcion}</p>
            </div>
          )}
          </div>
        </div>
      </div>
    </>
  );
};

export default MovimientoDetallesModal; 