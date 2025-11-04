import React from 'react';

const DataTable = ({ 
  data = [], 
  columns = [], 
  actions = [], 
  emptyMessage = "No hay datos disponibles",
  className = "",
  itemsPerPage, // Prop no usada, pero la aceptamos para evitar warnings
  ...props
}) => {
  // Filtrar props que no son válidas para el DOM (React no las reconoce)
  const domProps = Object.keys(props).reduce((acc, key) => {
    // Solo incluir props que sean válidas para elementos DOM
    if (!['itemsPerPage', 'onPageChange', 'currentPage'].includes(key)) {
      acc[key] = props[key];
    }
    return acc;
  }, {});
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

  try {
    return (
      <div className={`bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden w-full ${className}`} {...domProps}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-gray-700 table-fixed">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {columns.map((column, index) => {
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
                return (
                  <tr
                    key={rowIndex}
                    className="hover:bg-gray-50 transition-colors duration-150"
                  >
                    {columns.map((column, colIndex) => {
                      const cellValue = row[column.key];
                      
                      // Si es un elemento React válido (como JSX), renderizarlo directamente
                      // Si es un valor primitivo, mostrarlo como texto
                      const isReactElement = React.isValidElement(cellValue);
                      const displayValue = isReactElement 
                        ? cellValue 
                        : (cellValue !== undefined && cellValue !== null ? String(cellValue) : '');
                      
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
                            
                            // Estilos base según el tipo de acción
                            let baseStyles = '';
                            if (isDisabled) {
                              // Estilos para botones deshabilitados (grises y opacos)
                              baseStyles = 'text-gray-300 cursor-not-allowed opacity-50';
                            } else {
                              // Estilos normales según el tipo de acción
                              if (action.variant === 'ghost') {
                                if (action.label === 'Eliminar' || action.label === 'Delete' || action.label === 'Eliminar movimiento') {
                                  baseStyles = 'text-red-500 hover:text-red-700 hover:bg-red-50 cursor-pointer';
                                } else if (action.label === 'Editar' || action.label === 'Edit' || action.label === 'Editar movimiento') {
                                  baseStyles = 'text-blue-500 hover:text-blue-700 hover:bg-blue-50 cursor-pointer';
                                } else if (action.label === 'Ver detalles' || action.label === 'Ver' || action.label === 'View' || action.label === 'Ver movimiento') {
                                  baseStyles = 'text-gray-500 hover:text-gray-700 hover:bg-gray-100 cursor-pointer';
                                } else {
                                  baseStyles = 'text-gray-500 hover:text-gray-700 hover:bg-gray-100 cursor-pointer';
                                }
                              } else {
                                if (action.label === 'Eliminar') {
                                  baseStyles = 'text-red-500 hover:text-red-700 hover:bg-red-50 cursor-pointer';
                                } else if (action.label === 'Editar') {
                                  baseStyles = 'text-blue-500 hover:text-blue-700 hover:bg-blue-50 cursor-pointer';
                                } else {
                                  baseStyles = 'text-gray-500 hover:text-gray-700 hover:bg-gray-100 cursor-pointer';
                                }
                              }
                            }
                            
                            return (
                            <button
                              key={actionIndex}
                              onClick={(e) => {
                                if (!isDisabled && action.onClick) {
                                  action.onClick(row);
                                } else {
                                  e.preventDefault();
                                  e.stopPropagation();
                                }
                              }}
                              disabled={isDisabled}
                              className={`inline-flex items-center justify-center px-1.5 py-1 text-xs font-medium rounded transition-colors ${baseStyles} ${action.className || ''}`}
                              title={isDisabled ? `${action.label || 'Acción'} (No disponible)` : action.label || 'Acción'}
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