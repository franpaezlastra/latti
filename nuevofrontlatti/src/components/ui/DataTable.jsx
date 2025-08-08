import React, { useState, useMemo } from 'react';

const DataTable = ({ 
  data = [], 
  columns = [], 
  actions = [], 
  emptyMessage = "No hay datos disponibles", 
  className = "", 
  itemsPerPage = 10 
}) => {
  const [currentPage, setCurrentPage] = useState(1);

  // Paginar datos
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return data.slice(startIndex, startIndex + itemsPerPage);
  }, [data, currentPage, itemsPerPage]);

  // Calcular páginas
  const totalPages = Math.ceil(data.length / itemsPerPage);

  // Determinar si usar altura completa o contenido natural
  const isFullHeight = className.includes('h-full');

  return (
    <div className={`w-full overflow-hidden rounded-xl border border-blue-200 shadow bg-white/90 ${className}`}>
      <div className="overflow-x-auto max-w-full">
        <div className={isFullHeight ? "h-full overflow-y-auto" : "max-h-64 overflow-y-auto"}>
          <table className="w-full text-xs text-gray-700 border-collapse text-center">
            <thead className="bg-blue-100 text-blue-800 sticky top-0 z-10">
              <tr>
                {columns.map((column, i) => (
                  <th key={i} className="px-2 py-2 font-semibold tracking-tight text-xs">
                    {column.label}
                  </th>
                ))}
                {actions.length > 0 && (
                  <th className="px-2 py-2 font-semibold text-xs">Acciones</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-100">
              {paginatedData.length > 0 ? (
                paginatedData.map((item, i) => (
                  <tr
                    key={i}
                    className={`${i % 2 === 0 ? "bg-white" : "bg-blue-50"} hover:bg-blue-100 transition`}
                  >
                    {columns.map((column, j) => (
                      <td key={j} className="px-2 py-1 text-xs">
                        {item[column.key]}
                      </td>
                    ))}
                    {actions.length > 0 && (
                      <td className="px-2 py-1">
                        <div className="flex justify-center gap-1">
                          {actions.map((action, j) => (
                            <button
                              key={j}
                              onClick={() => action.onClick(item)}
                              className={`rounded-full p-1 text-xs shadow hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-300 transition ${action.className}`}
                              title={action.label}
                              aria-label={action.label}
                              tabIndex={0}
                            >
                              {action.icon}
                            </button>
                          ))}
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={columns.length + (actions.length > 0 ? 1 : 0)}
                    className="px-4 py-4 text-center text-blue-400 text-xs font-semibold"
                  >
                    {emptyMessage}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between p-2 border-t border-blue-100 bg-blue-50">
          <div className="text-xs text-blue-700">
            Mostrando {((currentPage - 1) * itemsPerPage) + 1} a {Math.min(currentPage * itemsPerPage, data.length)} de {data.length} resultados
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-2 py-1 text-xs border border-blue-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-100 text-blue-700"
            >
              Anterior
            </button>
            <span className="px-2 py-1 text-xs text-blue-700">
              Página {currentPage} de {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-2 py-1 text-xs border border-blue-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-100 text-blue-700"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable; 