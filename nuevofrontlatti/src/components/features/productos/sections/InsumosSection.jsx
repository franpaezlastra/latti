import React from 'react';
import { FaPlus, FaTrash, FaCog, FaBox, FaEdit, FaEye } from 'react-icons/fa';
import DataTable from '../../../ui/DataTable';
import { formatQuantity, formatPrice } from '../../../../utils/formatters';
import { getAbreviaturaByValue } from '../../../../constants/unidadesMedida';

const InsumosSection = ({ 
  insumos = [], 
  onCreate, 
  onDelete,
  onEdit,
  onDetails
}) => {
  const columns = [
    { key: 'nombre', label: 'Nombre', sortable: true },
    { key: 'tipo', label: 'Tipo', sortable: true },
    { key: 'stockActual', label: 'Stock', sortable: true },
    { key: 'unidadMedida', label: 'Unidad', sortable: true },
    { key: 'precioDeCompra', label: 'Precio/u', sortable: true }
  ];

  const actions = [
    {
      label: 'Ver detalles',
      icon: <FaEye />,
      onClick: (insumo) => onDetails(insumo)
    },
    {
      label: 'Editar',
      icon: <FaEdit />,
      onClick: (insumo) => onEdit(insumo)
    },
    {
      label: 'Eliminar',
      icon: <FaTrash />,
      onClick: (insumo) => onDelete(insumo)
    }
  ];

  const formatData = (insumos) => {
    // Ordenar insumos: primero BASE, luego COMPUESTO, alfabéticamente
    const insumosOrdenados = [...insumos].sort((a, b) => {
      // Primero por tipo
      if (a.tipo !== b.tipo) {
        return a.tipo === 'BASE' ? -1 : 1;
      }
      // Luego alfabéticamente
      return a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' });
    });
    
    return insumosOrdenados.map(insumo => ({
      ...insumo,
      stockActual: formatQuantity(insumo.stockActual || 0, getAbreviaturaByValue(insumo.unidadMedida) || ''),
      // Mostrar abreviatura de la unidad de medida
      unidadMedida: getAbreviaturaByValue(insumo.unidadMedida) || insumo.unidadMedida || 'N/A',
      // Preservar el tipo original para la lógica
      tipoOriginal: insumo.tipo,
      // Formatear tipo con icono - centrado (solo para visualización)
      tipo: insumo.tipo === 'COMPUESTO' ? 'Compuesto' : 'Base',
      // Formatear precio
      precioDeCompra: formatPrice(insumo.precioDeCompra || 0)
    }));
  };

  return (
    <section className="h-full flex flex-col">
      {/* Header con botón de agregar */}
      <div className="flex items-center gap-2 mb-2 flex-shrink-0">
        <h2 className="text-base font-[TransformaSans_Trial-Bold] text-blue-700 tracking-tight">
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