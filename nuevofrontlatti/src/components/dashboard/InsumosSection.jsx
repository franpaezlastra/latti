import React from 'react';
import { Box, AlertTriangle, DollarSign, Package } from 'lucide-react';
import { formatPrice, formatNumber } from '../../utils/formatters.js';

const InsumosSection = ({ insumos, movimientosInsumos }) => {
  // Calcular stock actual y precio promedio por insumo
  const insumosConStock = insumos.map(insumo => {
    // Obtener movimientos de este insumo
    const movimientosInsumo = movimientosInsumos.filter(m => m.insumoId === insumo.id);
    
    // Calcular stock actual
    let stockActual = 0;
    let precioTotal = 0;
    let cantidadTotal = 0;
    
    movimientosInsumo.forEach(movimiento => {
      if (movimiento.tipoMovimiento === 'COMPRA') {
        stockActual += movimiento.cantidad || 0;
        precioTotal += (movimiento.precioUnitario || 0) * (movimiento.cantidad || 0);
        cantidadTotal += movimiento.cantidad || 0;
      } else if (movimiento.tipoMovimiento === 'CONSUMO') {
        stockActual -= movimiento.cantidad || 0;
      }
    });
    
    const precioPromedio = cantidadTotal > 0 ? precioTotal / cantidadTotal : 0;
    const stockCritico = insumo.stockCritico || 5; // Valor por defecto
    const isStockCritico = stockActual <= stockCritico;
    
    return {
      ...insumo,
      stockActual,
      precioPromedio,
      isStockCritico
    };
  });

  // Filtrar insumos con stock > 0
  const insumosActivos = insumosConStock.filter(insumo => insumo.stockActual > 0);

  return (
    <div className="card">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Insumos en Stock</h3>
        <p className="text-sm text-gray-500">Cantidad, precio por unidad y stock crítico</p>
      </div>
      <div className="p-6">
        {insumosActivos.length > 0 ? (
          <div className="space-y-4">
            {insumosActivos.map((insumo, index) => (
              <div 
                key={index} 
                className={`p-4 rounded-lg border ${
                  insumo.isStockCritico 
                    ? 'border-red-200 bg-red-50' 
                    : 'border-gray-200 bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <Box className={`h-6 w-6 ${
                        insumo.isStockCritico ? 'text-red-500' : 'text-green-500'
                      }`} />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">
                        {insumo.nombre}
                      </h4>
                      <p className="text-xs text-gray-500">
                        {insumo.descripcion || 'Sin descripción'}
                      </p>
                      <p className="text-xs text-gray-500">
                        Stock crítico: {formatNumber(insumo.stockCritico || 5)} unidades
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-6">
                    {/* Cantidad */}
                    <div className="text-center">
                      <div className="flex items-center space-x-1">
                        <Package className="h-4 w-4 text-gray-400" />
                        {insumo.isStockCritico && <AlertTriangle className="h-4 w-4 text-red-500" />}
                      </div>
                      <p className={`text-lg font-semibold ${
                        insumo.isStockCritico ? 'text-red-600' : 'text-gray-900'
                      }`}>
                        {formatNumber(insumo.stockActual)}
                      </p>
                      <p className="text-xs text-gray-500">Unidades</p>
                    </div>

                    {/* Precio por Unidad */}
                    <div className="text-center">
                      <div className="flex items-center justify-center">
                        <DollarSign className="h-4 w-4 text-gray-400" />
                      </div>
                      <p className="text-lg font-semibold text-gray-900">
                        {formatPrice(insumo.precioPromedio)}
                      </p>
                      <p className="text-xs text-gray-500">Por unidad</p>
                    </div>

                    {/* Valor Total */}
                    <div className="text-center">
                      <div className="flex items-center justify-center">
                        <DollarSign className="h-4 w-4 text-gray-400" />
                      </div>
                      <p className="text-lg font-semibold text-gray-900">
                        {formatPrice(insumo.stockActual * insumo.precioPromedio)}
                      </p>
                      <p className="text-xs text-gray-500">Valor total</p>
                    </div>
                  </div>
                </div>
                
                {insumo.isStockCritico && (
                  <div className="mt-3 p-2 bg-red-100 rounded-md">
                    <p className="text-xs text-red-700 font-medium">
                      ⚠️ Stock crítico: Solo quedan {formatNumber(insumo.stockActual)} unidades 
                      (mínimo: {formatNumber(insumo.stockCritico)})
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Box className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No hay insumos en stock</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InsumosSection;
