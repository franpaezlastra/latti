import React, { useState } from "react";
import { FaPlus, FaEye, FaTrash, FaCog, FaFilter, FaSearch } from "react-icons/fa";
import { DataTable, Button, Card, Badge, FilterPanel } from "../../../components/ui";
import { formatQuantity, formatPrice } from "../../../utils/formatters";

const ProductosMovementsSection = ({
  movimientos = [],
  productos = [],
  onVerDetalles,
  onEliminar,
  onNuevoProducto
}) => {
  const [filtros, setFiltros] = useState({
    busqueda: "",
    tipoMovimiento: "",
    fechaDesde: "",
    fechaHasta: ""
  });

  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  // Configuración de filtros para FilterPanel
  const filterConfig = [
    {
      key: 'busqueda',
      label: 'Buscar',
      type: 'search',
      placeholder: 'Buscar por descripción o producto...',
      value: filtros.busqueda
    },
    {
      key: 'tipoMovimiento',
      label: 'Tipo de Movimiento',
      type: 'select',
      placeholder: 'Todos',
      value: filtros.tipoMovimiento,
      options: [
        { value: 'ENTRADA', label: 'Producción' },
        { value: 'SALIDA', label: 'Venta' }
      ]
    },
    {
      key: 'fechaDesde',
      label: 'Fecha Desde',
      type: 'date',
      value: filtros.fechaDesde
    },
    {
      key: 'fechaHasta',
      label: 'Fecha Hasta',
      type: 'date',
      value: filtros.fechaHasta
    }
  ];

  // Filtrar movimientos
  const movimientosFiltrados = movimientos.filter(movimiento => {
    const cumpleBusqueda = !filtros.busqueda || 
      movimiento.descripcion?.toLowerCase().includes(filtros.busqueda.toLowerCase()) ||
      movimiento.detalles?.some(detalle => 
        detalle.nombreProducto?.toLowerCase().includes(filtros.busqueda.toLowerCase())
      );

    const cumpleTipo = !filtros.tipoMovimiento || 
      movimiento.tipoMovimiento === filtros.tipoMovimiento;

    const cumpleFechaDesde = !filtros.fechaDesde || 
      new Date(movimiento.fecha) >= new Date(filtros.fechaDesde);

    const cumpleFechaHasta = !filtros.fechaHasta || 
      new Date(movimiento.fecha) <= new Date(filtros.fechaHasta);

    return cumpleBusqueda && cumpleTipo && cumpleFechaDesde && cumpleFechaHasta;
  });

  // Formatear datos para la tabla
  const formatearMovimientos = (movimientos) => {
    return movimientos.map(movimiento => ({
      ...movimiento,
      fecha: new Date(movimiento.fecha).toLocaleDateString('es-ES'),
      tipoMovimiento: (
        <Badge 
          variant={movimiento.tipoMovimiento === 'ENTRADA' ? 'success' : 'primary'}
          size="sm"
        >
          {movimiento.tipoMovimiento === 'ENTRADA' ? 'Producción' : 'Venta'}
        </Badge>
      ),
      detalles: (
        <div className="space-y-1">
          {movimiento.detalles?.map((detalle, index) => (
            <div key={index} className="text-xs text-gray-600">
              <span className="font-medium">{detalle.nombreProducto}</span>
              <span className="mx-1">•</span>
              <span>{formatQuantity(detalle.cantidad, 'unidades')}</span>
              {detalle.precioVenta > 0 && (
                <>
                  <span className="mx-1">•</span>
                  <span className="text-green-600 font-medium">{formatPrice(detalle.precioVenta)} c/u</span>
                </>
              )}
            </div>
          ))}
        </div>
      ),
      total: movimiento.detalles?.reduce((sum, detalle) => sum + (detalle.precioVenta * detalle.cantidad || 0), 0) || 0,
      totalFormateado: formatPrice(movimiento.detalles?.reduce((sum, detalle) => sum + (detalle.precioVenta * detalle.cantidad || 0), 0) || 0)
    }));
  };

  // Columnas de la tabla
  const columnas = [
    { key: 'fecha', label: 'Fecha', sortable: true },
    { key: 'tipoMovimiento', label: 'Tipo', sortable: true },
    { key: 'descripcion', label: 'Descripción', sortable: true },
    { key: 'detalles', label: 'Productos', sortable: false },
    { key: 'totalFormateado', label: 'Total', sortable: true }
  ];

  // Acciones de la tabla
  const acciones = [
    {
      label: 'Ver detalles',
      icon: <FaEye size={14} />,
      onClick: (mov) => onVerDetalles(mov),
      variant: 'ghost'
    },
    {
      label: 'Eliminar',
      icon: <FaTrash size={14} />,
      onClick: (mov) => onEliminar(mov),
      variant: 'ghost'
    }
  ];

  const handleFilterChange = (key, value) => {
    setFiltros(prev => ({ ...prev, [key]: value }));
  };

  const limpiarFiltros = () => {
    setFiltros({
      busqueda: "",
      tipoMovimiento: "",
      fechaDesde: "",
      fechaHasta: ""
    });
  };

  return (
    <div className="space-y-4">
      {/* Header con botones */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-gray-900">Movimientos de Productos</h2>
          <button
            onClick={onNuevoProducto}
            className="flex items-center gap-1 p-2 text-white bg-green-600 rounded-full shadow hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-300 transition"
            aria-label="Nuevo movimiento de producto"
            title="Nuevo movimiento de producto"
          >
            <FaPlus size={14} />
          </button>
        </div>
        <p className="text-gray-600">Gestiona producción y ventas de productos terminados</p>
        
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setMostrarFiltros(!mostrarFiltros)}
            leftIcon={<FaFilter size={14} />}
          >
            Filtros
          </Button>
        </div>
      </div>

      {/* Panel de filtros */}
      <FilterPanel
        isOpen={mostrarFiltros}
        onClose={() => setMostrarFiltros(false)}
        filters={filterConfig}
        onFilterChange={handleFilterChange}
        onClearFilters={limpiarFiltros}
      />

      {/* Tabla */}
      <DataTable
        data={formatearMovimientos(movimientosFiltrados)}
        columns={columnas}
        actions={acciones}
        emptyMessage="No hay movimientos de productos registrados"
      />

      {/* Información adicional */}
      <Card variant="outlined" className="bg-green-50 border-green-200">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <FaCog className="text-green-600" size={16} />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-green-900 mb-2">💡 Tipos de Movimientos de Productos</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-green-700">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                <div>
                  <span className="font-medium">🏭 Producción:</span>
                  <span className="ml-1">Creación de productos usando insumos (descuenta automáticamente)</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                <div>
                  <span className="font-medium">💰 Venta:</span>
                  <span className="ml-1">Venta de productos terminados</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-purple-600 rounded-full"></div>
                <div>
                  <span className="font-medium">🔄 Restauración:</span>
                  <span className="ml-1">Al eliminar una producción, se restauran automáticamente los insumos usados</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-600 rounded-full"></div>
                <div>
                  <span className="font-medium">📊 Costos:</span>
                  <span className="ml-1">Los precios de inversión se calculan automáticamente basados en los insumos</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ProductosMovementsSection;