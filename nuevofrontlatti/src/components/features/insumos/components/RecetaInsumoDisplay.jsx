import React from 'react';
import { FaBox, FaArrowRight } from 'react-icons/fa';
import { formatQuantity } from '../../../../utils/formatters';
import { getAbreviaturaByValue } from '../../../../constants/unidadesMedida';

const RecetaInsumoDisplay = ({ receta = [] }) => {
  if (!receta || receta.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
      <h4 className="text-md font-semibold text-gray-800 flex items-center gap-2">
        <FaBox className="text-gray-600" size={14} />
        Componentes de la Receta
      </h4>
      <ul className="space-y-2">
        {receta.map((componente, index) => (
          <li key={index} className="flex items-center justify-between text-sm text-gray-700 bg-white p-3 rounded-md shadow-sm border border-gray-100">
            <span className="font-medium">{componente.nombreInsumoBase}</span>
            <div className="flex items-center gap-2 text-gray-600">
              <FaArrowRight size={10} />
              <span>
                {formatQuantity(componente.cantidad, getAbreviaturaByValue(componente.unidadMedida))}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RecetaInsumoDisplay;