import React from "react";

const Tabla = ({
  columnas,
  datos,
  renderFila,
  columnasAcciones = [],
  mensajeVacio = "No hay datos disponibles",
}) => {
  return (
    <div className="w-full overflow-hidden rounded-xl border border-blue-200 shadow bg-white/90">
      <div className="overflow-x-auto max-w-full">
        <div className="max-h-64 overflow-y-auto">
          <table className="w-full text-xs text-gray-700 border-collapse text-center">
            <thead className="bg-blue-100 text-blue-800 sticky top-0 z-10">
              <tr>
                {columnas.map((col, i) => (
                  <th key={i} className="px-2 py-2 font-semibold tracking-tight text-xs">
                    {col}
                  </th>
                ))}
                {columnasAcciones.length > 0 && (
                  <th className="px-2 py-2 font-semibold text-xs">Acciones</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-100">
              {datos.length > 0 ? (
                datos.map((fila, i) => (
                  <tr
                    key={i}
                    className={`${i % 2 === 0 ? "bg-white" : "bg-blue-50"} hover:bg-blue-100 transition`}
                  >
                    {renderFila(fila, i)}
                    {columnasAcciones.length > 0 && (
                      <td className="px-2 py-1">
                        <div className="flex justify-center gap-1">
                          {columnasAcciones.map((accion, j) => (
                            <button
                              key={j}
                              onClick={() => accion.onClick(fila)}
                              className={`rounded-full p-1 text-xs shadow hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-300 transition ${accion.className}`}
                              title={accion.label}
                              aria-label={accion.label}
                              tabIndex={0}
                            >
                              {accion.icon}
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
                    colSpan={columnas.length + (columnasAcciones.length > 0 ? 1 : 0)}
                    className="px-4 py-4 text-center text-blue-400 text-xs font-semibold"
                  >
                    {mensajeVacio}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Tabla; 