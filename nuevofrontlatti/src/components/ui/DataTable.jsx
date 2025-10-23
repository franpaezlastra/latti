import React, { useState } from 'react';
import { FaSort, FaSortUp, FaSortDown, FaEye, FaEdit, FaTrash } from 'react-icons/fa';

const DataTable = ({ 
  data = [], 
  columns = [], 
  actions = [], 
  emptyMessage = "No hay datos disponibles", 
  loading = false,
  className = "",
  itemsPerPage, // Extraer para evitar que se pase al DOM
  ...props
}) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  // Validar que los datos sean un array
  if (!Array.isArray(data)) {
    console.warn('DataTable: data debe ser un array, recibido:', typeof data);
    return (
      <div className="w-full p-8 text-center text-gray-500">
        {emptyMessage}
      </div>
    );
  }

  // Validar que las columnas sean un array
  if (!Array.isArray(columns)) {
    console.warn('DataTable: columns debe ser un array, recibido:', typeof columns);
    return (
      <div className="w-full p-8 text-center text-gray-500">
        Error: columnas no válidas
      </div>
    );
  }

  // Debug: Log de datos recibidos
  console.log('🔍 DataTable - Datos recibidos:', data);
  console.log('🔍 DataTable - Columnas recibidas:', columns);
  console.log('🔍 DataTable - Acciones recibidas:', actions);

  // Si no hay datos, mostrar mensaje
  if (data.length === 0) {
    console.log('🔍 DataTable - No hay datos, mostrando mensaje vacío');
    return (
      <div className="w-full p-8 text-center text-gray-500">
        {emptyMessage}
      </div>
    );
  }

  // Función de ordenamiento
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Aplicar ordenamiento
  const sortedData = React.useMemo(() => {
    if (!sortConfig.key) return data;
    
    return [...data].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      
      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [data, sortConfig]);

  const getSortIcon = (columnKey) => {
    if (sortConfig.key !== columnKey) {
      return <FaSort className="text-gray-400" size={12} />;
    }
    return sortConfig.direction === 'asc' 
      ? <FaSortUp className="text-blue-600" size={12} />
      : <FaSortDown className="text-blue-600" size={12} />;
  };

  if (loading) {
    return (
      <div className="w-full p-8 text-center text-gray-500">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2">Cargando...</p>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden ${className}`} {...props}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-gray-700">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {columns.map((column, index) => (
                <th
                  key={column.key || index}
                  className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                    column.sortable ? 'cursor-pointer hover:bg-gray-100' : ''
                  }`}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className="flex items-center gap-2">
                    <span>{column.label}</span>
                    {column.sortable && getSortIcon(column.key)}
                  </div>
                  </th>
                ))}
                {actions.length > 0 && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
                )}
              </tr>
            </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedData.length > 0 ? (
              sortedData.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className="hover:bg-gray-50 transition-colors duration-150"
                >
                  {columns.map((column, colIndex) => {
                    const cellValue = row[column.key];
                    const displayValue = cellValue !== undefined && cellValue !== null ? String(cellValue) : '';
                    
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
                            console.warn('DataTable: Acción inválida en índice', actionIndex, action);
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
                ))
              ) : (
                <tr>
                  <td
                    colSpan={columns.length + (actions.length > 0 ? 1 : 0)}
                  className="px-6 py-12 text-center text-gray-500"
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                      <FaEye className="text-gray-400" size={20} />
                    </div>
                    <p className="text-sm font-medium">{emptyMessage}</p>
                  </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
    </div>
  );
};

export default DataTable; 