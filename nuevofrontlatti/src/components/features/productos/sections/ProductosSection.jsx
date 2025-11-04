import React, { useState } from 'react';
import { FaPlus, FaEye, FaEdit, FaTrash, FaFilter } from 'react-icons/fa';
import DataTable from '../../../ui/DataTable';
import { formatPrice, formatQuantity } from '../../../../utils/formatters';

const ProductosSection = ({ 
  productos = [], 
  onCreate, 
  onEdit, 
  onDelete, 
  onView 
}) => {
  const [filtroStockBajo, setFiltroStockBajo] = useState(false);
  const columns = [
    { key: 'nombre', label: 'Nombre', sortable: true },
    { key: 'precioInversion', label: 'Precio de inversión', sortable: true },
    { key: 'stockDisponible', label: 'Stock disponible', sortable: true },
    { key: 'estado', label: 'Estado', sortable: true }
  ];

  const actions = [
    {
      label: 'Ver',
      icon: <FaEye />,
      onClick: onView
    },
    {
      label: 'Editar',
      icon: <FaEdit />,
      onClick: onEdit
    },
    {
      label: 'Eliminar',
      icon: <FaTrash />,
      onClick: onDelete
    }
  ];

  const formatData = (productos) => {
    // Aplicar filtro de stock bajo si está activo
    let productosFiltrados = productos;
    if (filtroStockBajo) {
      productosFiltrados = productos.filter(producto => {
        const stockActual = producto.stockDisponible || producto.stockActual || 0;
        const stockMinimo = producto.stockMinimo || 0;
        return stockActual <= stockMinimo;
      });
    }
    
    // Ordenar productos alfabéticamente por nombre
    const productosOrdenados = [...productosFiltrados].sort((a, b) => 
      a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' })
    );
    
    return productosOrdenados.map(producto => {
      const stockActual = producto.stockDisponible || producto.stockActual || 0;
      const stockMinimo = producto.stockMinimo || 0;
      const tieneStockBajo = stockActual <= stockMinimo;
      
      return {
        ...producto,
        precioInversion: formatPrice(producto.precioInversion || 0),
        stockDisponible: formatQuantity(stockActual, 'unidades'),
        // Badge de estado
        estado: (
          <span className={`px-2 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${
            tieneStockBajo 
              ? 'bg-red-100 text-red-700 border border-red-200' 
              : 'bg-green-100 text-green-700 border border-green-200'
          }`}>
            {tieneStockBajo ? '⚠️ Stock Bajo' : '✓ Stock OK'}
          </span>
        )
      };
    });
  };

  return (
    <section className="w-full">
      {/* Header con botón de agregar y filtro */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-semibold text-blue-700 font-[TransformaSans_Trial-Bold] tracking-tight">
            Productos
          </h2>
          <button
            onClick={onCreate}
            className="flex items-center gap-1 p-1.5 text-white bg-blue-600 rounded-full shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300 transition text-xs"
            aria-label="Agregar producto"
            tabIndex={0}
          >
            <FaPlus className="text-xs" />
          </button>
        </div>
        
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

      {/* Tabla */}
      <div className="w-full">
        <DataTable
          data={formatData(productos)}
          columns={columns}
          actions={actions}
          emptyMessage="No hay productos registrados"
          className="w-full"
          itemsPerPage={5}
        />
      </div>
    </section>
  );
};

export default ProductosSection; 