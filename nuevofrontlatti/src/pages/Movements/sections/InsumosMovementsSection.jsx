import React, { useState } from "react";
import { FaPlus, FaEye, FaTrash, FaEdit, FaBox, FaCog, FaFilter, FaSearch } from "react-icons/fa";
import { DataTable, Button, Card, Badge, FilterPanel } from "../../../components/ui";
import { formatQuantity, formatPrice } from "../../../utils/formatters";
import { getAbreviaturaByValue } from "../../../constants/unidadesMedida";

const InsumosMovementsSection = ({
  movimientos = [],
  insumos = [],
  onVerDetalles,
  onEliminar,
  onEditar,
  onNuevoInsumo,
  onNuevoInsumoCompuesto
}) => {
  // Debug: Log de movimientos recibidos
  console.log('📊 InsumosMovementsSection - Movimientos recibidos:', movimientos);
  console.log('📊 InsumosMovementsSection - Cantidad de movimientos:', movimientos?.length || 0);
  console.log('📊 InsumosMovementsSection - Primer movimiento:', movimientos?.[0]);
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
      placeholder: 'Buscar por descripción o insumo...',
      value: filtros.busqueda
    },
    {
      key: 'tipoMovimiento',
      label: 'Tipo de Movimiento',
      type: 'select',
      placeholder: 'Todos',
      value: filtros.tipoMovimiento,
      options: [
        { value: 'ENTRADA', label: 'Entrada' },
        { value: 'SALIDA', label: 'Salida' }
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
        detalle.nombreInsumo?.toLowerCase().includes(filtros.busqueda.toLowerCase())
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
    console.log('🔄 formatearMovimientos - Movimientos a formatear:', movimientos);
    const formateados = movimientos.map(movimiento => ({
      id: movimiento.id,
      fecha: new Date(movimiento.fecha).toLocaleDateString('es-ES'),
      tipoMovimiento: movimiento.tipoMovimiento === 'ENTRADA' ? '✅ Entrada' : '❌ Salida',
      descripcion: movimiento.descripcion || 'Sin descripción',
      detalles: movimiento.insumos?.map(insumo => {
        const nombre = insumo.nombreInsumo || insumo.nombre || insumo.insumo?.nombre || 'Sin nombre';
        const cantidad = formatQuantity(insumo.cantidad, getAbreviaturaByValue(insumo.unidadMedida));
        const precio = insumo.precioTotal > 0 ? formatPrice(insumo.precioTotal) : '';
        return `${nombre} • ${cantidad}${precio ? ` • ${precio}` : ''}`;
      }).join('\n') || 'Sin detalles',
      total: formatPrice(movimiento.insumos?.reduce((sum, insumo) => sum + (insumo.precioTotal || 0), 0) || 0)
    }));
    console.log('✅ formatearMovimientos - Movimientos formateados:', formateados);
    return formateados;
  };

  // Columnas de la tabla
  const columnas = [
    { key: 'fecha', label: 'Fecha', sortable: true },
    { key: 'tipoMovimiento', label: 'Tipo', sortable: true },
    { key: 'descripcion', label: 'Descripción', sortable: true },
    { key: 'detalles', label: 'Detalles', sortable: false },
    { key: 'total', label: 'Total', sortable: true }
  ];

  // Acciones de la tabla
  const acciones = [
    {
      label: 'Ver detalles',
      icon: <FaEye size={14} />,
      onClick: (mov) => onVerDetalles(mov),
      variant: 'ghost',
      className: 'text-blue-600 hover:text-blue-800'
    },
    {
      label: 'Editar',
      icon: <FaEdit size={14} />,
      onClick: (mov) => onEditar(mov),
      variant: 'ghost',
      className: 'text-gray-600 hover:text-gray-800',
      disabled: (mov) => {
        // Verificar si es un movimiento de ensamble
        return mov.insumos?.some(insumo => insumo.ensambleId) || false;
      }
    },
    {
      label: 'Eliminar',
      icon: <FaTrash size={14} />,
      onClick: (mov) => onEliminar(mov),
      variant: 'ghost',
      className: 'text-red-600 hover:text-red-800',
      disabled: (mov) => {
        // Verificar si es un movimiento de ensamble
        return mov.insumos?.some(insumo => insumo.ensambleId) || false;
      }
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
    <div className="space-y-6">
      {/* Header con botones */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Movimientos de Insumos</h2>
          <p className="text-gray-600">Gestiona entradas y salidas de materias primas</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setMostrarFiltros(!mostrarFiltros)}
            leftIcon={<FaFilter size={14} />}
          >
            Filtros
          </Button>
          
          <Button
            onClick={onNuevoInsumo}
            variant="primary"
            size="sm"
            leftIcon={<FaBox size={14} />}
          >
            Nuevo Insumo
          </Button>
          
          <Button
            onClick={onNuevoInsumoCompuesto}
            variant="purple"
            size="sm"
            leftIcon={<FaCog size={14} />}
          >
            Ensamblar
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
        emptyMessage="No hay movimientos de insumos registrados"
      />

      {/* Información adicional */}
      <Card variant="outlined" className="bg-blue-50 border-blue-200">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <FaBox className="text-blue-600" size={16} />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-blue-900 mb-2">💡 Tipos de Movimientos de Insumos</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-blue-700">
              <div className="flex items-center gap-2">
                <FaBox className="text-blue-600" size={12} />
                <div>
                  <span className="font-medium">📦 Entrada:</span>
                  <span className="ml-1">Compra de insumos, devoluciones, ajustes positivos</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <FaBox className="text-red-600" size={12} />
                <div>
                  <span className="font-medium">📤 Salida:</span>
                  <span className="ml-1">Venta de insumos, desperdicios, uso en producción</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <FaCog className="text-purple-600" size={12} />
                <div>
                  <span className="font-medium">🔨 Ensamble:</span>
                  <span className="ml-1">Creación de insumos compuestos usando componentes base</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-400 rounded-full flex items-center justify-center">
                  <span className="text-yellow-800 text-xs">!</span>
                </div>
                <div>
                  <span className="font-medium">⚠️ Nota:</span>
                  <span className="ml-1">Los movimientos de ensamble no se pueden editar o eliminar individualmente</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

    </div>
  );
};

export default InsumosMovementsSection;