import React from 'react';
import { DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import { formatPrice } from '../../utils/formatters.js';

const FinancialSummary = ({ movimientosProductos, movimientosInsumos }) => {
  // Calcular precio total invertido (compras de insumos)
  const precioInvertido = movimientosInsumos
    .filter(m => m.tipoMovimiento === 'COMPRA')
    .reduce((total, m) => {
      const precioUnitario = m.precioUnitario || 0;
      const cantidad = m.cantidad || 0;
      return total + (precioUnitario * cantidad);
    }, 0);

  // Calcular precio total obtenido (ventas de productos)
  const precioObtenido = movimientosProductos
    .filter(m => m.tipoMovimiento === 'VENTA')
    .reduce((total, m) => {
      const precioVenta = m.precioVenta || 0;
      const cantidad = m.cantidad || 0;
      return total + (precioVenta * cantidad);
    }, 0);

  const ganancia = precioObtenido - precioInvertido;
  const porcentajeGanancia = precioInvertido > 0 ? (ganancia / precioInvertido) * 100 : 0;

  return (
    <div className="card">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Resumen Financiero</h3>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Precio Invertido */}
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <TrendingDown className="h-8 w-8 text-red-500" />
            </div>
            <h4 className="text-sm font-medium text-gray-500">Precio Invertido</h4>
            <p className="text-2xl font-bold text-red-600">
              {formatPrice(precioInvertido)}
            </p>
          </div>

          {/* Precio Obtenido */}
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
            <h4 className="text-sm font-medium text-gray-500">Precio Obtenido</h4>
            <p className="text-2xl font-bold text-green-600">
              {formatPrice(precioObtenido)}
            </p>
          </div>

          {/* Ganancia */}
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <DollarSign className={`h-8 w-8 ${ganancia >= 0 ? 'text-green-500' : 'text-red-500'}`} />
            </div>
            <h4 className="text-sm font-medium text-gray-500">Ganancia</h4>
            <p className={`text-2xl font-bold ${ganancia >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatPrice(ganancia)}
            </p>
            <p className={`text-sm ${ganancia >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {porcentajeGanancia.toFixed(1)}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialSummary;
