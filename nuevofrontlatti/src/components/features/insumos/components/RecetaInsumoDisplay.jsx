import React from 'react';
import { FaBox, FaCog } from 'react-icons/fa';

const RecetaInsumoDisplay = ({ receta, compact = false }) => {
  if (!receta || receta.length === 0) {
    return (
      <div className="text-gray-500 text-sm italic">
        Sin receta definida
      </div>
    );
  }

  if (compact) {
    return (
      <div className="flex items-center gap-1 text-xs text-gray-600">
        <FaCog size={10} className="text-purple-600" />
        <span>{receta.length} componente{receta.length !== 1 ? 's' : ''}</span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
        <FaCog className="text-purple-600" size={14} />
        <span>Receta del Insumo Compuesto</span>
      </div>
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
        <div className="space-y-2">
          {receta.map((componente, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-purple-200 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-purple-800">
                    {componente.cantidad}
                  </span>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-800">
                    {componente.nombreInsumoBase}
                  </span>
                  <span className="text-xs text-gray-500 ml-2">
                    ({componente.unidadMedida})
                  </span>
                </div>
              </div>
              <FaBox className="text-gray-400" size={12} />
            </div>
          ))}
        </div>
        
        {/* Resumen de la receta */}
        <div className="mt-3 pt-2 border-t border-purple-300">
          <div className="flex items-center justify-between text-xs">
            <span className="text-purple-700 font-medium">
              Total de componentes: {receta.length}
            </span>
            <span className="text-purple-600">
              = 1 {receta[0]?.unidadMedida || 'unidad'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecetaInsumoDisplay;
