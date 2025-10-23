import React from 'react';
import { FaPlus, FaEye, FaEdit, FaTrash } from 'react-icons/fa';
import DataTable from '../../../ui/DataTable';
import { formatPrice, formatQuantity } from '../../../../utils/formatters';

const ProductosSection = ({ 
  productos = [], 
  onCreate, 
  onEdit, 
  onDelete, 
  onView 
}) => {
  const columns = [
    { key: 'nombre', label: 'Nombre', sortable: true },
    { key: 'precioInversion', label: 'Precio de inversión', sortable: true },
    { key: 'stockDisponible', label: 'Stock disponible', sortable: true }
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
    // Ordenar productos alfabéticamente por nombre
    const productosOrdenados = [...productos].sort((a, b) => 
      a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' })
    );
    
    return productosOrdenados.map(producto => ({
      ...producto,
      precioInversion: formatPrice(producto.precioInversion || 0),
      stockDisponible: formatQuantity(producto.stockDisponible || 0, 'unidades')
    }));
  };

  return (
    <section className="w-full">
      {/* Header con botón de agregar */}
      <div className="flex items-center gap-2 mb-2">
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