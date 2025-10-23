import React from 'react';

const DataTable = ({ 
  data = [], 
  columns = [], 
  actions = [], 
  emptyMessage = "No hay datos disponibles",
  className = "",
  ...props
}) => {
  // Validaciones básicas
  if (!Array.isArray(data) || data.length === 0) {
    return (
      <div className="w-full p-4 text-center text-gray-500">
        <p className="text-sm">{emptyMessage}</p>
      </div>
    );
  }

  if (!Array.isArray(columns) || columns.length === 0) {
    return (
      <div className="w-full p-8 text-center text-gray-500">
        Error: No hay columnas definidas
      </div>
    );
  }

  console.log('🔍 DataTable - Renderizando tabla con:', {
    datos: data.length,
    columnas: columns.length,
    acciones: actions.length
  });

  try {
    return (
      <div className={`bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden w-full ${className}`} {...props}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-gray-700 table-fixed">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {columns.map((column, index) => {
                  console.log('🔍 DataTable - Renderizando columna:', column);
                  return (
                    <th
                      key={column.key || index}
                      className={`px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide ${
                        column.key === 'fecha' ? 'w-32' :
                        column.key === 'tipoMovimiento' ? 'w-24' :
                        column.key === 'total' ? 'w-32' :
                        column.key === 'nombre' ? 'w-48' :
                        column.key === 'stockActual' ? 'w-24' :
                        column.key === 'precioDeCompra' ? 'w-32' :
                        'w-auto'
                      }`}
                    >
                      {column.label || 'Columna'}
                    </th>
                  );
                })}
                {actions.length > 0 && (
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide w-32">
                    Acciones
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.map((row, rowIndex) => {
                console.log('🔍 DataTable - Renderizando fila:', rowIndex, row);
                return (
                  <tr
                    key={rowIndex}
                    className="hover:bg-gray-50 transition-colors duration-150"
                  >
                    {columns.map((column, colIndex) => {
                      const cellValue = row[column.key];
                      const displayValue = cellValue !== undefined && cellValue !== null ? String(cellValue) : '';
                      
                      console.log('🔍 DataTable - Renderizando celda:', column.key, cellValue, displayValue);
                      
                      return (
                        <td key={colIndex} className="px-3 py-2 whitespace-nowrap text-xs">
                          {displayValue}
                        </td>
                      );
                    })}
                    {actions.length > 0 && (
                      <td className="px-3 py-2 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {actions.map((action, actionIndex) => {
                            if (!action || typeof action.onClick !== 'function') {
                              return null;
                            }
                            
                            const isDisabled = action.disabled && typeof action.disabled === 'function' ? action.disabled(row) : false;
                            
                            return (
                            <button
                              key={actionIndex}
                              onClick={() => action.onClick(row)}
                              disabled={isDisabled}
                              className={`inline-flex items-center justify-center px-1.5 py-1 text-xs font-medium rounded transition-colors ${
                                action.variant === 'ghost' 
                                  ? 'text-gray-500 hover:text-gray-700 hover:bg-gray-100' 
                                  : action.label === 'Eliminar'
                                  ? 'text-red-500 hover:text-red-700 hover:bg-red-50'
                                  : action.label === 'Editar'
                                  ? 'text-blue-500 hover:text-blue-700 hover:bg-blue-50'
                                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                              } ${action.className || ''}`}
                              title={action.label || 'Acción'}
                            >
                              {action.icon || '⚙️'}
                            </button>
                            );
                          })}
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  } catch (error) {
    console.error('❌ DataTable - Error al renderizar:', error);
    return (
      <div className="w-full p-8 text-center text-red-500">
        Error al renderizar la tabla: {error.message}
      </div>
    );
  }
};

export default DataTable;