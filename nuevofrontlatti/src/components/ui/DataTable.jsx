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
      <div className="w-full p-8 text-center text-gray-500">
        {emptyMessage}
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
      <div className={`bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden ${className}`} {...props}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-gray-700">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {columns.map((column, index) => {
                  console.log('🔍 DataTable - Renderizando columna:', column);
                  return (
                    <th
                      key={column.key || index}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {column.label || 'Columna'}
                    </th>
                  );
                })}
                {actions.length > 0 && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
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
                        <td key={colIndex} className="px-6 py-4 whitespace-nowrap">
                          {displayValue}
                        </td>
                      );
                    })}
                    {actions.length > 0 && (
                      <td className="px-6 py-4 whitespace-nowrap">
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
                                className={`inline-flex items-center justify-center px-2 py-1 text-xs font-medium rounded transition-colors ${
                                  action.variant === 'ghost' 
                                    ? 'text-gray-600 hover:text-gray-800 hover:bg-gray-100' 
                                    : 'text-blue-600 hover:text-blue-800 hover:bg-blue-50'
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