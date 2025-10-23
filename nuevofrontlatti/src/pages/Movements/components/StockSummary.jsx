import React, { useState } from "react";
import { FaBox, FaCog, FaChartLine, FaSearch, FaFilter } from "react-icons/fa";
import { Card, Button, DataTable, StatCard, FilterPanel, Badge } from "../../../../components/ui";
import { formatQuantity, formatPrice } from "../../../../utils/formatters";
import { getAbreviaturaByValue } from "../../../../constants/unidadesMedida";

const StockSummary = ({ insumos = [], productos = [] }) => {
  const [filtros, setFiltros] = useState({
    busqueda: "",
    tipo: "todos",
    stockBajo: false
  });

  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  // Configuración de filtros
  const filterConfig = [
    {
      key: 'busqueda',
      label: 'Buscar',
      type: 'search',
      placeholder: 'Buscar por nombre...',
      value: filtros.busqueda
    },
    {
      key: 'tipo',
      label: 'Tipo',
      type: 'select',
      placeholder: 'Todos',
      value: filtros.tipo,
      options: [
        { value: 'todos', label: 'Todos' },
        { value: 'insumos', label: 'Solo Insumos' },
        { value: 'productos', label: 'Solo Productos' }
      ]
    },
    {
      key: 'stockBajo',
      label: 'Solo stock bajo',
      type: 'checkbox',
      value: filtros.stockBajo
    }
  ];

  // Filtrar datos
  const insumosFiltrados = insumos.filter(insumo => {
    const cumpleBusqueda = !filtros.busqueda || 
      insumo.nombre?.toLowerCase().includes(filtros.busqueda.toLowerCase());
    
    const cumpleTipo = filtros.tipo === "todos" || filtros.tipo === "insumos";
    
    const cumpleStockBajo = !filtros.stockBajo || insumo.stockActual <= 10;
    
    return cumpleBusqueda && cumpleTipo && cumpleStockBajo;
  });

  const productosFiltrados = productos.filter(producto => {
    const cumpleBusqueda = !filtros.busqueda || 
      producto.nombre?.toLowerCase().includes(filtros.busqueda.toLowerCase());
    
    const cumpleTipo = filtros.tipo === "todos" || filtros.tipo === "productos";
    
    const cumpleStockBajo = !filtros.stockBajo || producto.stockActual <= 5;
    
    return cumpleBusqueda && cumpleTipo && cumpleStockBajo;
  });

  // Calcular totales
  const totalInsumos = insumosFiltrados.length;
  const totalProductos = productosFiltrados.length;
  const totalValorInsumos = insumosFiltrados.reduce((sum, insumo) => 
    sum + (insumo.stockActual * insumo.precioDeCompra), 0);
  const totalValorProductos = productosFiltrados.reduce((sum, producto) => 
    sum + (producto.stockActual * producto.precioInversion), 0);

  // Formatear datos para tablas
  const formatearInsumos = (insumos) => {
    return insumos.map(insumo => ({
      ...insumo,
      nombre: insumo.nombre,
      tipo: (
        <Badge 
          variant={insumo.tipo === 'COMPUESTO' ? 'purple' : 'primary'}
          size="sm"
        >
          {insumo.tipo === 'COMPUESTO' ? 'Compuesto' : 'Base'}
        </Badge>
      ),
      stock: formatQuantity(insumo.stockActual, getAbreviaturaByValue(insumo.unidadMedida)),
      precioUnitario: formatPrice(insumo.precioDeCompra),
      valorTotal: formatPrice(insumo.stockActual * insumo.precioDeCompra)
    }));
  };

  const formatearProductos = (productos) => {
    return productos.map(producto => ({
      ...producto,
      nombre: producto.nombre,
      stock: formatQuantity(producto.stockActual, 'unidades'),
      precioInversion: formatPrice(producto.precioInversion),
      precioVenta: formatPrice(producto.precioVenta),
      valorTotal: formatPrice(producto.stockActual * producto.precioInversion)
    }));
  };

  // Columnas para insumos
  const columnasInsumos = [
    { key: 'nombre', label: 'Nombre', sortable: true },
    { key: 'tipo', label: 'Tipo', sortable: true },
    { key: 'stock', label: 'Stock', sortable: true },
    { key: 'precioUnitario', label: 'Precio Unit.', sortable: true },
    { key: 'valorTotal', label: 'Valor Total', sortable: true }
  ];

  // Columnas para productos
  const columnasProductos = [
    { key: 'nombre', label: 'Nombre', sortable: true },
    { key: 'stock', label: 'Stock', sortable: true },
    { key: 'precioInversion', label: 'Precio Inversión', sortable: true },
    { key: 'precioVenta', label: 'Precio Venta', sortable: true },
    { key: 'valorTotal', label: 'Valor Total', sortable: true }
  ];

  const handleFilterChange = (key, value) => {
    setFiltros(prev => ({ ...prev, [key]: value }));
  };

  const limpiarFiltros = () => {
    setFiltros({
      busqueda: "",
      tipo: "todos",
      stockBajo: false
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Resumen de Stock</h2>
          <p className="text-gray-600">Vista general del inventario actual</p>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => setMostrarFiltros(!mostrarFiltros)}
          leftIcon={<FaFilter size={14} />}
        >
          Filtros
        </Button>
      </div>

      {/* Panel de filtros */}
      <FilterPanel
        isOpen={mostrarFiltros}
        onClose={() => setMostrarFiltros(false)}
        filters={filterConfig}
        onFilterChange={handleFilterChange}
        onClearFilters={limpiarFiltros}
      />

      {/* Tarjetas de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Insumos"
          value={totalInsumos}
          icon={<FaBox size={20} />}
          color="primary"
        />
        <StatCard
          title="Productos"
          value={totalProductos}
          icon={<FaCog size={20} />}
          color="success"
        />
        <StatCard
          title="Valor Insumos"
          value={formatPrice(totalValorInsumos)}
          icon={<FaChartLine size={20} />}
          color="warning"
        />
        <StatCard
          title="Valor Productos"
          value={formatPrice(totalValorProductos)}
          icon={<FaChartLine size={20} />}
          color="purple"
        />
      </div>

      {/* Tabla de insumos */}
      {(filtros.tipo === "todos" || filtros.tipo === "insumos") && (
        <Card>
          <Card.Header>
            <Card.Title className="flex items-center gap-2">
              <FaBox className="text-blue-600" size={16} />
              Insumos ({totalInsumos})
            </Card.Title>
          </Card.Header>
          <Card.Body>
            <DataTable
              data={formatearInsumos(insumosFiltrados)}
              columns={columnasInsumos}
              emptyMessage="No hay insumos registrados"
            />
          </Card.Body>
        </Card>
      )}

      {/* Tabla de productos */}
      {(filtros.tipo === "todos" || filtros.tipo === "productos") && (
        <Card>
          <Card.Header>
            <Card.Title className="flex items-center gap-2">
              <FaCog className="text-green-600" size={16} />
              Productos ({totalProductos})
            </Card.Title>
          </Card.Header>
          <Card.Body>
            <DataTable
              data={formatearProductos(productosFiltrados)}
              columns={columnasProductos}
              emptyMessage="No hay productos registrados"
            />
          </Card.Body>
        </Card>
      )}

      {/* Información adicional */}
      <Card variant="outlined" className="bg-blue-50 border-blue-200">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <FaChartLine className="text-blue-600" size={16} />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-blue-900 mb-2">💡 Información del Resumen de Stock</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-blue-700">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                <div>
                  <span className="font-medium">📊 Valores:</span>
                  <span className="ml-1">Calculados como stock actual × precio unitario</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                <div>
                  <span className="font-medium">🔍 Filtros:</span>
                  <span className="ml-1">Puedes buscar por nombre y filtrar por tipo</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-600 rounded-full"></div>
                <div>
                  <span className="font-medium">⚠️ Stock Bajo:</span>
                  <span className="ml-1">Insumos ≤ 10 unidades, Productos ≤ 5 unidades</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-purple-600 rounded-full"></div>
                <div>
                  <span className="font-medium">🔄 Actualización:</span>
                  <span className="ml-1">Los valores se actualizan automáticamente con cada movimiento</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default StockSummary;