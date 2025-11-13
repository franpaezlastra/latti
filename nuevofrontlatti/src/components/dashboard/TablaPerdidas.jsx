import React from 'react';
import { Trash2, Calendar, Package, DollarSign, TrendingDown } from 'lucide-react';
import { formatPrice, formatNumber } from '../../utils/formatters';
import Tabla from '../ui/Tabla';

const TablaPerdidas = ({ perdidas, isLoading }) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-800 flex items-center gap-2">
            <TrendingDown className="h-5 w-5 text-red-500" />
            Historial de Pérdidas
          </h2>
        </div>
        <div className="p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Cargando pérdidas...</p>
        </div>
      </div>
    );
  }

  if (!perdidas || perdidas.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-800 flex items-center gap-2">
            <TrendingDown className="h-5 w-5 text-red-500" />
            Historial de Pérdidas
          </h2>
        </div>
        <div className="p-6 text-center text-gray-500">
          <Trash2 className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-sm font-medium">No hay pérdidas registradas</p>
          <p className="text-xs mt-1">Los productos descartados aparecerán aquí</p>
        </div>
      </div>
    );
  }

  // Calcular total de pérdidas
  const totalPerdidas = perdidas.reduce((sum, perdida) => sum + (perdida.valorPerdido || 0), 0);
  const totalCantidad = perdidas.reduce((sum, perdida) => sum + (perdida.cantidad || 0), 0);

  // Formatear datos para la tabla
  const columnas = [
    { key: 'fecha', label: 'Fecha', sortable: true },
    { key: 'producto', label: 'Producto', sortable: true },
    { key: 'lote', label: 'Lote', sortable: true },
    { key: 'cantidad', label: 'Cantidad', sortable: true },
    { key: 'diasVencidos', label: 'Días Vencidos', sortable: true },
    { key: 'valorPerdido', label: 'Valor Perdido', sortable: true },
    { key: 'descripcion', label: 'Descripción', sortable: false }
  ];

  const datosFormateados = perdidas.map((perdida, index) => ({
    ...perdida,
    fecha: (
      <span className="flex items-center gap-1 text-sm text-gray-700">
        <Calendar className="h-3 w-3" />
        {new Date(perdida.fecha).toLocaleDateString('es-ES')}
      </span>
    ),
    producto: (
      <span className="font-medium text-gray-900">{perdida.nombreProducto}</span>
    ),
    lote: (
      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
        {perdida.lote || 'N/A'}
      </span>
    ),
    cantidad: (
      <span className="flex items-center gap-1 text-sm text-gray-700">
        <Package className="h-3 w-3" />
        {formatNumber(perdida.cantidad)}
      </span>
    ),
    diasVencidos: (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
        perdida.diasVencidos > 30 
          ? 'bg-red-100 text-red-700' 
          : perdida.diasVencidos > 7
          ? 'bg-orange-100 text-orange-700'
          : 'bg-yellow-100 text-yellow-700'
      }`}>
        {perdida.diasVencidos} día{perdida.diasVencidos !== 1 ? 's' : ''}
      </span>
    ),
    valorPerdido: (
      <span className="flex items-center gap-1 text-sm font-semibold text-red-600">
        <DollarSign className="h-3 w-3" />
        {formatPrice(perdida.valorPerdido)}
      </span>
    ),
    descripcion: (
      <span className="text-xs text-gray-600 italic max-w-xs truncate" title={perdida.descripcion}>
        {perdida.descripcion}
      </span>
    )
  }));

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-medium text-gray-800 flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-red-500" />
              Historial de Pérdidas
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {perdidas.length} descarte{perdidas.length !== 1 ? 's' : ''} registrado{perdidas.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-600">Total Pérdidas</div>
            <div className="text-lg font-bold text-red-600">
              {formatPrice(totalPerdidas)}
            </div>
            <div className="text-xs text-gray-500">
              {formatNumber(totalCantidad)} unidades
            </div>
          </div>
        </div>
      </div>
      
      <div className="p-6">
        <Tabla
          columnas={columnas}
          datos={datosFormateados}
          emptyMessage="No hay pérdidas registradas"
        />
      </div>
    </div>
  );
};

export default TablaPerdidas;

