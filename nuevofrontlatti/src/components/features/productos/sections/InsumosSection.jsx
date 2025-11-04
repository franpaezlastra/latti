import React, { useState } from 'react';
import { FaPlus, FaTrash, FaCog, FaBox, FaEdit, FaEye, FaFilter } from 'react-icons/fa';
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
  const [filtroStockBajo, setFiltroStockBajo] = useState(false);
  const [filtroTipo, setFiltroTipo] = useState('');
  const columns = [
    { key: 'nombre', label: 'Nombre', sortable: true },
    { key: 'tipo', label: 'Tipo', sortable: true },
    { key: 'stockActual', label: 'Stock', sortable: true },
    { key: 'estado', label: 'Estado', sortable: true },
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
    // Aplicar filtros combinados
    let insumosFiltrados = insumos;
    
    // Filtro de stock bajo
    if (filtroStockBajo) {
      insumosFiltrados = insumosFiltrados.filter(insumo => {
        const stockActual = insumo.stockActual || 0;
        const stockMinimo = insumo.stockMinimo || 0;
        return stockActual <= stockMinimo;
      });
    }
    
    // Filtro de tipo (Base o Compuesto)
    if (filtroTipo) {
      insumosFiltrados = insumosFiltrados.filter(insumo => {
        return insumo.tipo === filtroTipo;
      });
    }
    
    // Ordenar insumos: primero BASE, luego COMPUESTO, alfabéticamente
    const insumosOrdenados = [...insumosFiltrados].sort((a, b) => {
      // Primero por tipo
      if (a.tipo !== b.tipo) {
        return a.tipo === 'BASE' ? -1 : 1;
      }
      // Luego alfabéticamente
      return a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' });
    });
    
    return insumosOrdenados.map(insumo => {
      const stockActual = insumo.stockActual || 0;
      const stockMinimo = insumo.stockMinimo || 0;
      const tieneStockBajo = stockActual <= stockMinimo;
      
      return {
      ...insumo,
        // Preservar el valor original de unidadMedida para el modal de edición
        unidadMedidaOriginal: insumo.unidadMedida,
        stockActualOriginal: stockActual,
        stockMinimoOriginal: stockMinimo,
        stockActual: formatQuantity(stockActual, getAbreviaturaByValue(insumo.unidadMedida) || ''),
        // Badge de estado
        estado: (
          <span className={`px-2 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${
            tieneStockBajo 
              ? 'bg-red-100 text-red-700 border border-red-200' 
              : 'bg-green-100 text-green-700 border border-green-200'
          }`}>
            {tieneStockBajo ? '⚠️ Stock Bajo' : '✓ Stock OK'}
          </span>
        ),
      // Mostrar abreviatura de la unidad de medida
      unidadMedida: getAbreviaturaByValue(insumo.unidadMedida) || insumo.unidadMedida || 'N/A',
      // Preservar el tipo original para la lógica
      tipoOriginal: insumo.tipo,
      // Formatear tipo con icono - centrado (solo para visualización)
      tipo: insumo.tipo === 'COMPUESTO' ? 'Compuesto' : 'Base',
      // Formatear precio
      precioDeCompra: formatPrice(insumo.precioDeCompra || 0)
      };
    });
  };

  return (
    <section className="h-full flex flex-col">
      {/* Header con botón de agregar y filtro */}
      <div className="flex items-center justify-between gap-2 mb-2 flex-shrink-0">
        <div className="flex items-center gap-2">
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
        
        {/* Filtros: Stock Bajo y Tipo */}
        <div className="flex items-center gap-2">
          {/* Filtro de Tipo */}
          <select
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value)}
            className="px-3 py-1.5 text-xs font-medium border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            title="Filtrar por tipo de insumo"
          >
            <option value="">Todos los tipos</option>
            <option value="BASE">Base</option>
            <option value="COMPUESTO">Compuesto</option>
          </select>
          
          {/* Filtro de Stock Bajo */}
          <button
            onClick={() => setFiltroStockBajo(!filtroStockBajo)}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
              filtroStockBajo
                ? 'bg-red-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            title={filtroStockBajo ? 'Mostrar todos' : 'Filtrar stock bajo'}
          >
            <FaFilter className={filtroStockBajo ? 'text-white' : 'text-gray-600'} />
            {filtroStockBajo ? '⚠️ Stock Bajo' : 'Filtrar'}
          </button>
        </div>
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