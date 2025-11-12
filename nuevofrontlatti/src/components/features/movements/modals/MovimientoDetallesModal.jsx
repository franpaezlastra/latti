import React from 'react';
import { FaBox, FaCalendar, FaList, FaTag, FaWeight, FaArrowDown, FaArrowUp } from 'react-icons/fa';
import { Modal } from '../../../ui';
import { formatPrice } from '../../../../utils/formatters';

const MovimientoDetallesModal = ({ isOpen, onClose, movimiento }) => {
  if (!movimiento || !isOpen) return null;

  const esInsumo = movimiento.tipo === "Insumo";
  const esEntrada = movimiento.tipoMovimiento === "ENTRADA";
  
  // ✅ Asegurar que detalles siempre sea un array válido
  let detalles = movimiento.detalles;
  
  // Validar y normalizar detalles
  if (!detalles) {
    detalles = [];
  } else if (!Array.isArray(detalles)) {
    // Si detalles no es un array, intentar convertirlo
    try {
      detalles = [detalles];
    } catch (e) {
      console.error('Error al convertir detalles a array:', e);
      detalles = [];
    }
  }
  
  // Filtrar elementos nulos o inválidos
  detalles = detalles.filter(det => det != null);

  // ✅ NUEVO: Consolidar detalles del mismo producto/insumo (sumar cantidades)
  const detallesConsolidados = new Map();
  
  detalles.forEach(detalle => {
    // ✅ CRÍTICO: Para productos, el id del detalle es el id del producto
    // El backend devuelve ResponseDetalleMovimientoProductoDTO con id = producto.getId()
    const id = detalle.id || detalle.insumoId || detalle.productoId || 
               detalle.insumo?.id || detalle.producto?.id;
    // ✅ CRÍTICO: El backend devuelve 'nombre' directamente en ResponseDetalleMovimientoProductoDTO
    const nombre = detalle.nombre || detalle.nombreProducto || 
                   detalle.insumo?.nombre || detalle.producto?.nombre || 'Sin nombre';
    
    if (id) {
      const clave = String(id);
      if (detallesConsolidados.has(clave)) {
        // Si ya existe, sumar la cantidad y promediar/actualizar otros campos
        const existente = detallesConsolidados.get(clave);
        existente.cantidad = (existente.cantidad || 0) + (detalle.cantidad || 0);
        // Mantener el precio más reciente o sumar según el tipo
        if (esInsumo && esEntrada) {
          existente.precioTotal = (existente.precioTotal || 0) + (detalle.precioTotal || 0);
        }
      } else {
        // Si no existe, agregar nuevo
        detallesConsolidados.set(clave, { ...detalle });
      }
    } else {
      // Si no tiene ID, agregarlo directamente (no se puede consolidar)
      detallesConsolidados.set(nombre + Math.random(), { ...detalle });
    }
  });

  // Ordenar detalles alfabéticamente por nombre
  const detallesOrdenados = Array.from(detallesConsolidados.values()).sort((a, b) => {
    const nombreA = a.nombre || a.insumo?.nombre || a.producto?.nombre || "";
    const nombreB = b.nombre || b.insumo?.nombre || b.producto?.nombre || "";
    return nombreA.localeCompare(nombreB, 'es', { sensitivity: 'base' });
  });

  const totalCantidad = detallesOrdenados.reduce((sum, det) => sum + (det.cantidad || 0), 0);

  // Calcular totales financieros
  const totalVentas = esInsumo ? 0 : detallesOrdenados.reduce((sum, det) => 
    sum + ((det.precioVenta || 0) * (det.cantidad || 0)), 0);
  const totalInversion = esInsumo ? 0 : detallesOrdenados.reduce((sum, det) => 
    sum + ((det.precioInversion || 0) * (det.cantidad || 0)), 0);
  const ganancia = totalVentas - totalInversion;
  const totalGastado = esInsumo ? detallesOrdenados.reduce((sum, det) => 
    sum + (det.precioTotal || 0), 0) : 0;

  // Formatear fecha
  const fechaFormateada = movimiento.fecha 
    ? (typeof movimiento.fecha === 'string' ? movimiento.fecha : new Date(movimiento.fecha).toLocaleDateString('es-ES'))
    : 'Sin fecha';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Detalles de ${esEntrada ? 'Entrada' : 'Salida'} - ${fechaFormateada}`}
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
                  <p className="text-base font-bold text-gray-800">{fechaFormateada}</p>
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
                  <p className="text-xs font-semibold text-gray-500 uppercase">
                    {esInsumo ? 'Insumos' : 'Productos'}
                  </p>
                  <p className="text-base font-bold text-gray-800">
                    {detallesOrdenados.length}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 bg-white rounded-lg p-3 shadow-sm border border-gray-100">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <FaTag className="text-orange-600" size={18} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase">
                    {esInsumo 
                      ? 'Total Gastado'
                      : esEntrada 
                        ? 'Total Invertido'
                        : 'Total Ventas'
                    }
                  </p>
                  <p className="text-base font-bold text-orange-700">
                    {esInsumo 
                      ? formatPrice(totalGastado)
                      : esEntrada 
                        ? formatPrice(totalInversion)
                        : formatPrice(totalVentas)
                    }
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

          {/* Lista de items */}
          <div className="space-y-3">
            <h4 className="text-base font-semibold text-gray-800 flex items-center gap-2 px-1">
              <FaBox className="text-blue-600" size={16} />
              {esInsumo ? 'Insumos' : 'Productos'} {esEntrada ? 'Ingresados' : 'Salidos'}
            </h4>
            
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
              <div className="overflow-x-auto max-h-60 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gradient-to-r from-gray-50 to-slate-50 border-b border-gray-200 sticky top-0">
                  <tr>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">
                        {esInsumo ? 'Insumo' : 'Producto'}
                    </th>
                      <th className="px-4 py-2 text-right text-xs font-semibold text-gray-600 uppercase">
                      Cantidad
                    </th>
                    {esInsumo ? (
                        esEntrada && (
                          <>
                            <th className="px-4 py-2 text-right text-xs font-semibold text-gray-600 uppercase">
                              P. Unit.
                            </th>
                            <th className="px-4 py-2 text-right text-xs font-semibold text-gray-600 uppercase">
                              Total
                        </th>
                          </>
                      )
                    ) : (
                      <>
                          {esEntrada && (
                            <th className="px-4 py-2 text-right text-xs font-semibold text-gray-600 uppercase">
                              Fecha Venc.
                            </th>
                          )}
                          {!esEntrada && (
                            <th className="px-4 py-2 text-right text-xs font-semibold text-gray-600 uppercase">
                              P. Venta
                          </th>
                        )}
                          {!esEntrada && (
                            <th className="px-4 py-2 text-right text-xs font-semibold text-gray-600 uppercase">
                              Total
                          </th>
                        )}
                      </>
                    )}
                  </tr>
                </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {detallesOrdenados.length === 0 ? (
                      <tr>
                        <td colSpan={esInsumo ? (esEntrada ? 4 : 2) : (esEntrada ? 3 : 4)} className="px-4 py-8 text-center text-gray-500">
                          No hay {esInsumo ? 'insumos' : 'productos'} registrados
                        </td>
                      </tr>
                    ) : (
                      detallesOrdenados.map((detalle, index) => {
                        const nombre = detalle.nombre || detalle.insumo?.nombre || detalle.producto?.nombre || 'Sin nombre';
                        const cantidad = detalle.cantidad || 0;
                        const unidadMedida = detalle.unidadMedida || '';
                        const cantidadFormateada = unidadMedida ? `${cantidad} ${unidadMedida}` : cantidad.toString();

                        return (
                          <tr key={index} className="hover:bg-blue-50 transition-colors duration-150">
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">
                              <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                                {nombre}
                        </div>
                      </td>
                            <td className="px-4 py-3 text-sm text-gray-600 font-medium text-right">
                              {cantidadFormateada}
                      </td>
                      {esInsumo ? (
                          esEntrada && (
                                <>
                                  <td className="px-4 py-3 text-sm text-gray-600 text-right">
                                    {formatPrice(detalle.precioDeCompra || (detalle.precioTotal / cantidad) || 0)}
                                  </td>
                                  <td className="px-4 py-3 text-sm font-bold text-gray-900 text-right">
                                    {formatPrice(detalle.precioTotal || 0)}
                          </td>
                                </>
                        )
                      ) : (
                        <>
                            {esEntrada && (
                                  <td className="px-4 py-3 text-sm text-gray-600 text-right">
                                    {detalle.fechaVencimiento 
                                      ? new Date(detalle.fechaVencimiento).toLocaleDateString('es-ES')
                                      : 'No especificada'
                              }
                            </td>
                          )}
                            {!esEntrada && (
                                  <>
                                    <td className="px-4 py-3 text-sm text-gray-600 text-right">
                                      {formatPrice(detalle.precioVenta || 0)}
                                    </td>
                                    <td className="px-4 py-3 text-sm font-bold text-gray-900 text-right">
                                      {formatPrice((detalle.precioVenta || 0) * cantidad)}
                            </td>
                                  </>
                          )}
                        </>
                      )}
                    </tr>
                        );
                      })
                    )}
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
                  <p className="text-white text-xs font-medium opacity-90">
                    {esInsumo 
                      ? 'Total Gastado'
                      : esEntrada 
                        ? 'Total Inversión'
                        : 'Total Ventas'
                    }
                  </p>
                  <p className="text-white text-xl font-bold">
                    {esInsumo 
                      ? formatPrice(totalGastado)
                : esEntrada
                        ? formatPrice(totalInversion)
                        : formatPrice(totalVentas)
                    }
                  </p>
                </div>
                  </div>
              {!esInsumo && !esEntrada && (
                <div className="text-right">
                  <p className="text-white text-xs font-medium opacity-90">Ganancia</p>
                  <p className={`text-white text-xl font-bold ${ganancia >= 0 ? '' : 'opacity-75'}`}>
                    {formatPrice(ganancia)}
                  </p>
                </div>
              )}
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

export default MovimientoDetallesModal; 
