import React, { useState } from "react";
import { FaPlus, FaEye, FaTrash, FaEdit, FaBox, FaCog, FaFilter, FaSearch } from "react-icons/fa";
import Tabla from "../../../components/ui/Tabla";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
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
  const [filtros, setFiltros] = useState({
    busqueda: "",
    tipoMovimiento: "",
    fechaDesde: "",
    fechaHasta: ""
  });

  const [mostrarFiltros, setMostrarFiltros] = useState(false);

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
    return movimientos.map(movimiento => ({
      ...movimiento,
      fecha: new Date(movimiento.fecha).toLocaleDateString('es-ES'),
      tipoMovimiento: (
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
          movimiento.tipoMovimiento === 'ENTRADA' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {movimiento.tipoMovimiento === 'ENTRADA' ? 'Entrada' : 'Salida'}
        </span>
      ),
      detalles: (
        <div className="space-y-1">
          {movimiento.detalles?.map((detalle, index) => (
            <div key={index} className="text-xs text-gray-600">
              <span className="font-medium">{detalle.nombreInsumo}</span>
              <span className="mx-1">•</span>
              <span>{formatQuantity(detalle.cantidad, getAbreviaturaByValue(detalle.unidadMedida))}</span>
              {detalle.precioTotal > 0 && (
                <>
                  <span className="mx-1">•</span>
                  <span className="text-green-600 font-medium">{formatPrice(detalle.precioTotal)}</span>
                </>
              )}
            </div>
          ))}
        </div>
      ),
      total: movimiento.detalles?.reduce((sum, detalle) => sum + (detalle.precioTotal || 0), 0) || 0,
      totalFormateado: formatPrice(movimiento.detalles?.reduce((sum, detalle) => sum + (detalle.precioTotal || 0), 0) || 0)
    }));
  };

  // Columnas de la tabla
  const columnas = [
    { key: 'fecha', label: 'Fecha', sortable: true },
    { key: 'tipoMovimiento', label: 'Tipo', sortable: true },
    { key: 'descripcion', label: 'Descripción', sortable: true },
    { key: 'detalles', label: 'Insumos', sortable: false },
    { key: 'totalFormateado', label: 'Total', sortable: true }
  ];

  // Acciones de la tabla
  const acciones = [
    {
      label: 'Ver detalles',
      icon: <FaEye />,
      onClick: (mov) => onVerDetalles(mov),
      className: 'text-green-600 hover:bg-green-200'
    },
    {
      label: 'Editar',
      icon: <FaEdit />,
      onClick: (mov) => onEditar(mov),
      className: 'text-blue-600 hover:bg-blue-200',
      disabled: (mov) => {
        // Verificar si es un movimiento de ensamble
        return mov.detalles?.some(detalle => detalle.ensambleId) || false;
      }
    },
    {
      label: 'Eliminar',
      icon: <FaTrash />,
      onClick: (mov) => onEliminar(mov),
      className: 'text-red-600 hover:bg-red-200',
      disabled: (mov) => {
        // Verificar si es un movimiento de ensamble
        return mov.detalles?.some(detalle => detalle.ensambleId) || false;
      }
    }
  ];

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
            onClick={() => setMostrarFiltros(!mostrarFiltros)}
            variant="outline"
            className="flex items-center gap-2"
          >
            <FaFilter size={14} />
            Filtros
          </Button>
          
          <Button
            onClick={onNuevoInsumo}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
          >
            <FaBox size={14} />
            Nuevo Insumo
          </Button>
          
          <Button
            onClick={onNuevoInsumoCompuesto}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700"
          >
            <FaCog size={14} />
            Ensamblar
          </Button>
        </div>
      </div>

      {/* Filtros */}
      {mostrarFiltros && (
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Buscar
              </label>
              <div className="relative">
                <FaSearch className="absolute left-3 top-2.5 text-gray-400" size={14} />
                <Input
                  type="text"
                  value={filtros.busqueda}
                  onChange={(e) => setFiltros(prev => ({ ...prev, busqueda: e.target.value }))}
                  placeholder="Buscar por descripción o insumo..."
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Movimiento
              </label>
              <select
                value={filtros.tipoMovimiento}
                onChange={(e) => setFiltros(prev => ({ ...prev, tipoMovimiento: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Todos</option>
                <option value="ENTRADA">Entrada</option>
                <option value="SALIDA">Salida</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha Desde
              </label>
              <Input
                type="date"
                value={filtros.fechaDesde}
                onChange={(e) => setFiltros(prev => ({ ...prev, fechaDesde: e.target.value }))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha Hasta
              </label>
              <Input
                type="date"
                value={filtros.fechaHasta}
                onChange={(e) => setFiltros(prev => ({ ...prev, fechaHasta: e.target.value }))}
              />
            </div>
          </div>

          <div className="flex justify-end mt-4">
            <Button
              onClick={limpiarFiltros}
              variant="outline"
              className="mr-2"
            >
              Limpiar
            </Button>
          </div>
        </div>
      )}

      {/* Tabla */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <Tabla
          data={formatearMovimientos(movimientosFiltrados)}
          columns={columnas}
          actions={acciones}
          emptyMessage="No hay movimientos de insumos registrados"
          itemsPerPage={10}
        />
      </div>

      {/* Información adicional */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-2">
          <FaBox className="text-blue-600 mt-0.5" size={16} />
          <div className="text-sm text-blue-700">
            <p className="font-medium mb-1">💡 Tipos de Movimientos de Insumos</p>
            <ul className="space-y-1 text-xs">
              <li><strong>📦 Entrada:</strong> Compra de insumos, devoluciones, ajustes positivos</li>
              <li><strong>📤 Salida:</strong> Venta de insumos, desperdicios, uso en producción</li>
              <li><strong>🔨 Ensamble:</strong> Creación de insumos compuestos usando componentes base</li>
              <li><strong>⚠️ Nota:</strong> Los movimientos de ensamble no se pueden editar o eliminar individualmente</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InsumosMovementsSection;
