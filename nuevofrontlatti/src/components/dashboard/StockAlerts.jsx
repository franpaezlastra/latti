import React from 'react';
import { AlertTriangle, Package, Box } from 'lucide-react';

const StockAlerts = ({ productos, insumos, movimientosProductos, movimientosInsumos }) => {
  // Calcular stock crítico de productos
  const productosConStock = productos.map(producto => {
    const movimientosProducto = movimientosProductos.filter(m => m.productoId === producto.id);
    let stockActual = 0;
    
    movimientosProducto.forEach(movimiento => {
      if (movimiento.tipoMovimiento === 'PRODUCCION') {
        stockActual += movimiento.cantidad || 0;
      } else if (movimiento.tipoMovimiento === 'VENTA') {
        stockActual -= movimiento.cantidad || 0;
      }
    });
    
    return {
      ...producto,
      stockActual,
      isStockCritico: stockActual <= 10
    };
  });

  // Calcular stock crítico de insumos
  const insumosConStock = insumos.map(insumo => {
    const movimientosInsumo = movimientosInsumos.filter(m => m.insumoId === insumo.id);
    let stockActual = 0;
    
    movimientosInsumo.forEach(movimiento => {
      if (movimiento.tipoMovimiento === 'COMPRA') {
        stockActual += movimiento.cantidad || 0;
      } else if (movimiento.tipoMovimiento === 'CONSUMO') {
        stockActual -= movimiento.cantidad || 0;
      }
    });
    
    const stockCritico = insumo.stockCritico || 5;
    return {
      ...insumo,
      stockActual,
      isStockCritico: stockActual <= stockCritico
    };
  });

  const productosStockCritico = productosConStock.filter(p => p.isStockCritico);
  const insumosStockCritico = insumosConStock.filter(i => i.isStockCritico);

  const totalAlertas = productosStockCritico.length + insumosStockCritico.length;

  if (totalAlertas === 0) {
    return (
      <div className="card">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Alertas de Stock</h3>
        </div>
        <div className="p-6 text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-green-100 rounded-full">
              <Package className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <p className="text-gray-600 font-medium">¡Excelente! No hay alertas de stock crítico</p>
          <p className="text-sm text-gray-500 mt-2">Todos los productos e insumos tienen stock suficiente</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">Alertas de Stock Crítico</h3>
          <span className="px-3 py-1 bg-red-100 text-red-800 text-sm font-medium rounded-full">
            {totalAlertas} alerta{totalAlertas !== 1 ? 's' : ''}
          </span>
        </div>
      </div>
      <div className="p-6">
        {/* Productos con stock crítico */}
        {productosStockCritico.length > 0 && (
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
              <Package className="h-4 w-4 mr-2 text-red-500" />
              Productos ({productosStockCritico.length})
            </h4>
            <div className="space-y-3">
              {productosStockCritico.map((producto, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{producto.nombre}</p>
                    <p className="text-xs text-gray-500">{producto.descripcion}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-red-600">{producto.stockActual} unidades</p>
                    <p className="text-xs text-red-500">Stock crítico: ≤10</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Insumos con stock crítico */}
        {insumosStockCritico.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
              <Box className="h-4 w-4 mr-2 text-red-500" />
              Insumos ({insumosStockCritico.length})
            </h4>
            <div className="space-y-3">
              {insumosStockCritico.map((insumo, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{insumo.nombre}</p>
                    <p className="text-xs text-gray-500">{insumo.descripcion}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-red-600">{insumo.stockActual} unidades</p>
                    <p className="text-xs text-red-500">Stock crítico: ≤{insumo.stockCritico || 5}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recomendación */}
        <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <div className="flex items-start">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-yellow-800">Recomendación</p>
              <p className="text-sm text-yellow-700 mt-1">
                Considera realizar pedidos de reposición para los productos e insumos con stock crítico 
                para evitar interrupciones en la producción.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockAlerts;
