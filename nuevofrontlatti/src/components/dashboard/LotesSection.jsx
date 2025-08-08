import React from 'react';
import { Package, AlertTriangle, DollarSign } from 'lucide-react';
import { formatPrice, formatNumber } from '../../utils/formatters.js';

const LotesSection = ({ productos, movimientosProductos }) => {
  // Agrupar productos por lotes
  const lotes = productos.reduce((acc, producto) => {
    // Obtener movimientos de este producto
    const movimientosProducto = movimientosProductos.filter(m => m.productoId === producto.id);
    
    // Calcular stock por lotes
    const stockPorLotes = movimientosProducto.reduce((stockAcc, movimiento) => {
      if (movimiento.tipoMovimiento === 'PRODUCCION') {
        // Agregar al stock
        const lote = stockAcc.find(l => l.numeroLote === movimiento.numeroLote);
        if (lote) {
          lote.cantidad += movimiento.cantidad || 0;
          lote.precioInversion += (movimiento.precioUnitario || 0) * (movimiento.cantidad || 0);
        } else {
          stockAcc.push({
            numeroLote: movimiento.numeroLote,
            cantidad: movimiento.cantidad || 0,
            precioInversion: (movimiento.precioUnitario || 0) * (movimiento.cantidad || 0),
            fechaProduccion: movimiento.fecha,
            producto: producto
          });
        }
      } else if (movimiento.tipoMovimiento === 'VENTA') {
        // Restar del stock
        const lote = stockAcc.find(l => l.numeroLote === movimiento.numeroLote);
        if (lote) {
          lote.cantidad -= movimiento.cantidad || 0;
        }
      }
      return stockAcc;
    }, []);

    // Agregar lotes de este producto al acumulador
    return [...acc, ...stockPorLotes];
  }, []);

  // Filtrar lotes con stock > 0
  const lotesActivos = lotes.filter(lote => lote.cantidad > 0);

  return (
    <div className="card">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Lotes Activos</h3>
        <p className="text-sm text-gray-500">Stock por lotes con precios de inversión</p>
      </div>
      <div className="p-6">
        {lotesActivos.length > 0 ? (
          <div className="space-y-4">
            {lotesActivos.map((lote, index) => {
              const isStockCritico = lote.cantidad <= 10;
              
              return (
                <div 
                  key={index} 
                  className={`p-4 rounded-lg border ${
                    isStockCritico 
                      ? 'border-red-200 bg-red-50' 
                      : 'border-gray-200 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <Package className={`h-6 w-6 ${
                          isStockCritico ? 'text-red-500' : 'text-blue-500'
                        }`} />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">
                          {lote.producto?.nombre || 'Producto'}
                        </h4>
                        <p className="text-xs text-gray-500">
                          Lote: {lote.numeroLote}
                        </p>
                        <p className="text-xs text-gray-500">
                          Producción: {new Date(lote.fechaProduccion).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      {/* Cantidad */}
                      <div className="text-center">
                        <div className="flex items-center space-x-1">
                          <Package className="h-4 w-4 text-gray-400" />
                          {isStockCritico && <AlertTriangle className="h-4 w-4 text-red-500" />}
                        </div>
                        <p className={`text-lg font-semibold ${
                          isStockCritico ? 'text-red-600' : 'text-gray-900'
                        }`}>
                          {formatNumber(lote.cantidad)}
                        </p>
                        <p className="text-xs text-gray-500">Unidades</p>
                      </div>

                      {/* Precio de Inversión */}
                      <div className="text-center">
                        <div className="flex items-center justify-center">
                          <DollarSign className="h-4 w-4 text-gray-400" />
                        </div>
                        <p className="text-lg font-semibold text-gray-900">
                          {formatPrice(lote.precioInversion)}
                        </p>
                        <p className="text-xs text-gray-500">Inversión</p>
                      </div>
                    </div>
                  </div>
                  
                  {isStockCritico && (
                    <div className="mt-3 p-2 bg-red-100 rounded-md">
                      <p className="text-xs text-red-700 font-medium">
                        ⚠️ Stock crítico: Solo quedan {formatNumber(lote.cantidad)} unidades
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No hay lotes activos</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LotesSection;
