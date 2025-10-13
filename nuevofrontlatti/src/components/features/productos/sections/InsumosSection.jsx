import React from 'react';
import { FaPlus, FaTrash } from 'react-icons/fa';
import DataTable from '../../../ui/DataTable';
import { formatQuantity, formatPrice } from '../../../../utils/formatters';
import { getAbreviaturaByValue } from '../../../../constants/unidadesMedida';

const InsumosSection = ({ 
  insumos = [], 
  onCreate, 
  onDelete 
}) => {
  const columns = [
    { key: 'nombre', label: 'Nombre', sortable: true },
    { key: 'stockActual', label: 'Cantidad disponible', sortable: true },
    { key: 'unidadMedida', label: 'Unidad de medida', sortable: true }
  ];

  const actions = [
    {
      label: 'Eliminar',
      icon: <FaTrash />,
      onClick: onDelete,
      className: 'text-red-600 hover:bg-red-200'
    }
  ];

  const formatData = (insumos) => {
    // Ordenar insumos alfabéticamente por nombre
    const insumosOrdenados = [...insumos].sort((a, b) => 
      a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' })
    );
    
    return insumosOrdenados.map(insumo => ({
      ...insumo,
      stockActual: formatQuantity(insumo.stockActual || 0, getAbreviaturaByValue(insumo.unidadMedida) || ''),
      // ✅ CAMBIADO: Mostrar abreviatura de la unidad de medida
      unidadMedida: getAbreviaturaByValue(insumo.unidadMedida) || insumo.unidadMedida || 'N/A'
    }));
  };

  return (
    <section className="h-full flex flex-col">
      {/* Header con botón de agregar */}
      <div className="flex items-center gap-2 mb-2 flex-shrink-0">
        <h2 className="text-base font-semibold text-blue-700 font-[TransformaSans_Trial-Bold] tracking-tight">
          Insumos
        </h2>
        <button
          onClick={onCreate}
          className="flex items-center gap-1 p-1.5 text-white bg-blue-600 rounded-full shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300 transition text-xs"
          aria-label="Agregar insumo"
          tabIndex={0}
        >
          <FaPlus className="text-xs" />
        </button>
      </div>

      {/* Tabla con scroll interno */}
      <div className="flex-1 overflow-hidden">
        <DataTable
          data={formatData(insumos)}
          columns={columns}
          actions={actions}
          emptyMessage="No hay insumos registrados"
          className="h-full"
          itemsPerPage={10}
        />
      </div>
    </section>
  );
};

export default InsumosSection; 