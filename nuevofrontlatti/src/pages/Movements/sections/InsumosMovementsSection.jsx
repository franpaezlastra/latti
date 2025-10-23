import React, { useState } from "react";
import { FaPlus, FaEye, FaTrash, FaEdit, FaBox, FaCog, FaFilter, FaSearch } from "react-icons/fa";
import { DataTable, Button, Card, Badge, FilterPanel } from "../../../components/ui";
import { formatQuantity, formatPrice } from "../../../utils/formatters";
import { getAbreviaturaByValue } from "../../../constants/unidadesMedida";
import DetallesMovimientoModal from '../../../components/features/movements/modals/DetallesMovimientoModal';

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
  const [movimientoSeleccionado, setMovimientoSeleccionado] = useState(null);
  const [mostrarDetalles, setMostrarDetalles] = useState(false);

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
    
    // Ordenar movimientos del más nuevo al más viejo por fecha
    const movimientosOrdenados = [...movimientos].sort((a, b) => {
      const fechaA = new Date(a.fecha);
      const fechaB = new Date(b.fecha);
      return fechaB - fechaA; // Descendente (más nuevo primero)
    });
    
    const formateados = movimientosOrdenados.map(movimiento => ({
      id: movimiento.id,
      fecha: new Date(movimiento.fecha).toLocaleDateString('es-ES'),
      tipoMovimiento: movimiento.tipoMovimiento === 'ENTRADA' ? '✅ Entrada' : '❌ Salida',
      descripcion: movimiento.descripcion || 'Sin descripción',
      total: formatPrice(movimiento.insumos?.reduce((sum, insumo) => sum + (insumo.precioTotal || 0), 0) || 0),
      // Mantener datos originales para el modal
      insumos: movimiento.insumos || [],
      // Mantener el tipoMovimiento original para el modal
      tipoMovimientoOriginal: movimiento.tipoMovimiento,
      // Mantener la fecha original para el modal
      fechaOriginal: movimiento.fecha
    }));
    console.log('✅ formatearMovimientos - Movimientos formateados y ordenados:', formateados);
    return formateados;
  };

  // Columnas de la tabla
  const columnas = [
    { key: 'fecha', label: 'Fecha', sortable: true, width: 'w-32' },
    { key: 'tipoMovimiento', label: 'Tipo', sortable: true, width: 'w-24' },
    { key: 'total', label: 'Total', sortable: true, width: 'w-32' }
  ];

  // Función para ver detalles
  const handleVerDetalles = (movimiento) => {
    // Reconstruir el objeto con los datos originales para el modal
    const movimientoOriginal = {
      id: movimiento.id,
      fecha: movimiento.fechaOriginal || movimiento.fecha,
      tipoMovimiento: movimiento.tipoMovimientoOriginal || movimiento.tipoMovimiento,
      descripcion: movimiento.descripcion,
      insumos: movimiento.insumos
    };
    setMovimientoSeleccionado(movimientoOriginal);
    setMostrarDetalles(true);
  };

  // Acciones de la tabla
  const acciones = [
    {
      label: 'Ver detalles',
      icon: <FaEye />,
      onClick: handleVerDetalles,
      variant: 'ghost'
    },
    {
      label: 'Editar',
      icon: <FaEdit />,
      onClick: (mov) => onEditar(mov),
      variant: 'ghost',
      disabled: (mov) => {
        // Verificar si es un movimiento de ensamble
        return mov.insumos?.some(insumo => insumo.ensambleId) || false;
      }
    },
    {
      label: 'Eliminar',
      icon: <FaTrash />,
      onClick: (mov) => onEliminar(mov),
      variant: 'ghost',
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
    <div className="space-y-4">
      {/* Header con botones */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Movimientos de Insumos</h2>
          <p className="text-sm text-gray-600">Gestiona entradas y salidas de materias primas</p>
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

      {/* Modal de detalles */}
      <DetallesMovimientoModal
        isOpen={mostrarDetalles}
        onClose={() => setMostrarDetalles(false)}
        movimiento={movimientoSeleccionado}
      />
    </div>
  );
};

export default InsumosMovementsSection;