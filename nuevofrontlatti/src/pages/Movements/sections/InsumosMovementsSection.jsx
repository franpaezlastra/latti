import React, { useState, useEffect, useMemo, useRef } from "react";
import { FaPlus, FaEye, FaTrash, FaEdit, FaBox, FaCog, FaFilter, FaSearch } from "react-icons/fa";
import { DataTable, Button, Card, Badge, FilterPanel } from "../../../components/ui";
import { formatQuantity, formatPrice, formatDateToDisplay, parseLocalDateString } from "../../../utils/formatters";
import { getAbreviaturaByValue } from "../../../constants/unidadesMedida";
import DetallesMovimientoModal from '../../../components/features/movements/modals/DetallesMovimientoModal';
import { useDispatch } from "react-redux";
import { validarEdicionMovimiento, validarEliminacionMovimiento } from "../../../store/actions/movimientoInsumoActions";

const InsumosMovementsSection = ({
  movimientos = [],
  insumos = [],
  onVerDetalles,
  onEliminar,
  onEditar,
  onNuevoInsumo,
  onNuevoInsumoCompuesto
}) => {
  const dispatch = useDispatch();
  
  const [filtros, setFiltros] = useState({
    busqueda: "",
    tipoMovimiento: "",
    fechaDesde: "",
    fechaHasta: ""
  });

  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [movimientoSeleccionado, setMovimientoSeleccionado] = useState(null);
  const [mostrarDetalles, setMostrarDetalles] = useState(false);
  
  // Estado para almacenar las validaciones de edición de cada movimiento
  const [validacionesEdicion, setValidacionesEdicion] = useState({});
  const [validacionesCargando, setValidacionesCargando] = useState(true); // Indica si se están cargando las validaciones
  
  // ✅ NUEVO: Estado para almacenar las validaciones de eliminación de cada movimiento
  const [validacionesEliminacion, setValidacionesEliminacion] = useState({});
  const [validacionesEliminacionCargando, setValidacionesEliminacionCargando] = useState(true);
  
  const idsMovimientosPrevios = useRef('[]'); // Inicializar como string vacío
  const validandoEdicionesRef = useRef(false);
  const validandoEliminacionesRef = useRef(false); // ✅ NUEVO: Ref para validaciones de eliminación

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

    // ✅ CORREGIDO: Usar parseLocalDateString para evitar problemas de zona horaria en comparaciones
    const cumpleFechaDesde = !filtros.fechaDesde || 
      (parseLocalDateString(movimiento.fecha) || new Date(0)) >= (parseLocalDateString(filtros.fechaDesde) || new Date(0));

    const cumpleFechaHasta = !filtros.fechaHasta || 
      (parseLocalDateString(movimiento.fecha) || new Date(0)) <= (parseLocalDateString(filtros.fechaHasta) || new Date(0));

    return cumpleBusqueda && cumpleTipo && cumpleFechaDesde && cumpleFechaHasta;
  });

  // Formatear datos para la tabla
  const formatearMovimientos = (movimientos) => {
    // Ordenar movimientos por fecha (más reciente primero) como criterio principal
    // ✅ CORREGIDO: Usar parseLocalDateString para evitar problemas de zona horaria en ordenamiento
    const movimientosOrdenados = [...movimientos].sort((a, b) => {
      const fechaA = parseLocalDateString(a.fecha) || new Date(0);
      const fechaB = parseLocalDateString(b.fecha) || new Date(0);
      
      // Ordenar por fecha de forma descendente (más reciente primero)
      const diferenciaFecha = fechaB - fechaA;
      
      // Si las fechas son iguales, ordenar por ID descendente (más reciente primero)
      if (diferenciaFecha === 0) {
        return b.id - a.id;
      }
      
      return diferenciaFecha;
    });
    
    const formateados = movimientosOrdenados.map(movimiento => {
      // Verificar si es un movimiento de ensamble
      const esEnsamble = movimiento.insumos?.some(insumo => insumo.ensambleId && insumo.ensambleId.trim() !== '') || false;
      
      return {
        id: movimiento.id,
        fecha: formatDateToDisplay(movimiento.fecha),
        tipoMovimiento: movimiento.tipoMovimiento === 'ENTRADA' ? '✅ Entrada' : '❌ Salida',
        tipoEnsamble: esEnsamble ? '🔨 Ensamble' : '📦 Normal',
        descripcion: movimiento.descripcion || 'Sin descripción',
        total: formatPrice(movimiento.insumos?.reduce((sum, insumo) => sum + (insumo.precioTotal || 0), 0) || 0),
        // Mantener datos originales para el modal
        insumos: movimiento.insumos || [],
        // Mantener el tipoMovimiento original para el modal
        tipoMovimientoOriginal: movimiento.tipoMovimiento,
        // Mantener la fecha original para el modal
        fechaOriginal: movimiento.fecha,
        // Mantener información de ensamble
        esEnsamble: esEnsamble
      };
    });
    return formateados;
  };

  // Columnas de la tabla (ordenadas por fecha de forma fija)
  const columnas = [
    { key: 'fecha', label: 'Fecha', width: 'w-32' },
    { key: 'tipoMovimiento', label: 'Tipo', width: 'w-24' },
    { key: 'tipoEnsamble', label: 'Categoría', width: 'w-28' },
    { key: 'total', label: 'Total', width: 'w-32' }
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

  // ✅ Validar edición Y eliminación de todos los movimientos cuando se cargan
  useEffect(() => {
    // Extraer IDs de movimientos de forma estable
    const idsActuales = movimientos?.map(m => m.id).filter(id => id != null).sort((a, b) => a - b) || [];
    const idsStringActuales = JSON.stringify(idsActuales);
    
    // Comparar string de IDs actuales con los previos
    const idsHanCambiado = idsStringActuales !== idsMovimientosPrevios.current;
    
    // Solo validar si hay movimientos, los IDs han cambiado, y no estamos validando actualmente
    if (idsActuales.length > 0 && idsHanCambiado && !validandoEdicionesRef.current && !validandoEliminacionesRef.current) {
      // Actualizar referencia de string de IDs previos INMEDIATAMENTE para prevenir ejecuciones múltiples
      idsMovimientosPrevios.current = idsStringActuales;
      
      // Marcar que estamos validando INMEDIATAMENTE
      validandoEdicionesRef.current = true;
      validandoEliminacionesRef.current = true;
      setValidacionesCargando(true);
      setValidacionesEliminacionCargando(true);
      
      console.log('🔄 Iniciando validaciones de edición y eliminación para', idsActuales.length, 'movimientos...');
      
      // ✅ Validar EDICIÓN de todos los movimientos en paralelo
      const validacionesEdicionPromesas = idsActuales.map(async (id) => {
        try {
          const resultado = await dispatch(validarEdicionMovimiento(id)).unwrap();
          return { id, puedeEditar: resultado.puedeEditar };
        } catch (error) {
          console.error(`❌ Error validando edición para movimiento ${id}:`, error);
          return { id, puedeEditar: false };
        }
      });
      
      // ✅ Validar ELIMINACIÓN de todos los movimientos en paralelo
      const validacionesEliminacionPromesas = idsActuales.map(async (id) => {
        try {
          const resultado = await dispatch(validarEliminacionMovimiento(id)).unwrap();
          return { id, puedeEliminar: resultado.puedeEditar }; // ✅ Usa el mismo DTO ValidacionEdicionDTO
        } catch (error) {
          console.error(`❌ Error validando eliminación para movimiento ${id}:`, error);
          return { id, puedeEliminar: false };
        }
      });
      
      // Ejecutar ambas validaciones en paralelo
      Promise.all([
        Promise.all(validacionesEdicionPromesas),
        Promise.all(validacionesEliminacionPromesas)
      ]).then(([resultadosEdicion, resultadosEliminacion]) => {
        // Procesar resultados de edición
        const validacionesEdicionMap = {};
        resultadosEdicion.forEach(({ id, puedeEditar }) => {
          validacionesEdicionMap[id] = puedeEditar;
          console.log(`✅ Validación edición - Movimiento ID ${id}: puedeEditar = ${puedeEditar}`);
        });
        console.log('📋 Validaciones de edición completadas:', validacionesEdicionMap);
        setValidacionesEdicion(validacionesEdicionMap);
        validandoEdicionesRef.current = false;
        setValidacionesCargando(false);
        
        // Procesar resultados de eliminación
        const validacionesEliminacionMap = {};
        resultadosEliminacion.forEach(({ id, puedeEliminar }) => {
          validacionesEliminacionMap[id] = puedeEliminar;
          console.log(`✅ Validación eliminación - Movimiento ID ${id}: puedeEliminar = ${puedeEliminar}`);
        });
        console.log('📋 Validaciones de eliminación completadas:', validacionesEliminacionMap);
        setValidacionesEliminacion(validacionesEliminacionMap);
        validandoEliminacionesRef.current = false;
        setValidacionesEliminacionCargando(false);
      }).catch((error) => {
        console.error('❌ Error en validaciones:', error);
        validandoEdicionesRef.current = false;
        validandoEliminacionesRef.current = false;
        setValidacionesCargando(false);
        setValidacionesEliminacionCargando(false);
      });
    } else if (idsActuales.length === 0) {
      // Si no hay movimientos, las validaciones están completas
      setValidacionesCargando(false);
      setValidacionesEliminacionCargando(false);
    }
  }, [movimientos, dispatch]);

  // Función para verificar si un movimiento puede ser editado
  const puedeEditarMovimiento = useMemo(() => {
    return (movimiento) => {
      // Si las validaciones aún se están cargando, deshabilitar temporalmente
      // para evitar que los botones aparezcan habilitados mientras se valida
      if (validacionesCargando && !validacionesEdicion.hasOwnProperty(movimiento.id)) {
        return true; // Disabled mientras se carga
      }
      
      // Si ya tenemos la validación, usarla (el backend ya valida correctamente)
      if (validacionesEdicion.hasOwnProperty(movimiento.id)) {
        const puedeEditar = validacionesEdicion[movimiento.id];
        const disabled = !puedeEditar;
        console.log(`🔍 Verificando edición - Movimiento ID ${movimiento.id}: puedeEditar = ${puedeEditar}, disabled = ${disabled}`);
        // true si NO puede editar (disabled), false si puede editar (enabled)
        return disabled;
      }
      
      // Si las validaciones ya se completaron pero no tenemos esta validación,
      // por seguridad, deshabilitar hasta que se valide
      if (!validacionesCargando) {
        console.warn(`⚠️ No se encontró validación para movimiento ID ${movimiento.id}, deshabilitando por seguridad`);
        return true; // Disabled por seguridad si no tenemos la validación
      }
      
      // Por defecto, mientras se cargan, deshabilitar
      return true;
    };
  }, [validacionesEdicion, validacionesCargando]);

  // ✅ NUEVO: Función para verificar si un movimiento puede ser eliminado
  const puedeEliminarMovimiento = useMemo(() => {
    return (movimiento) => {
      // Si las validaciones aún se están cargando, deshabilitar temporalmente
      if (validacionesEliminacionCargando && !validacionesEliminacion.hasOwnProperty(movimiento.id)) {
        return true; // Disabled mientras se carga
      }
      
      // Si ya tenemos la validación, usarla
      if (validacionesEliminacion.hasOwnProperty(movimiento.id)) {
        const puedeEliminar = validacionesEliminacion[movimiento.id];
        const disabled = !puedeEliminar;
        console.log(`🔍 Verificando eliminación - Movimiento ID ${movimiento.id}: puedeEliminar = ${puedeEliminar}, disabled = ${disabled}`);
        // true si NO puede eliminar (disabled), false si puede eliminar (enabled)
        return disabled;
      }
      
      // Si las validaciones ya se completaron pero no tenemos esta validación,
      // por seguridad, deshabilitar hasta que se valide
      if (!validacionesEliminacionCargando) {
        console.warn(`⚠️ No se encontró validación de eliminación para movimiento ID ${movimiento.id}, deshabilitando por seguridad`);
        return true; // Disabled por seguridad si no tenemos la validación
      }
      
      // Por defecto, mientras se cargan, deshabilitar
      return true;
    };
  }, [validacionesEliminacion, validacionesEliminacionCargando]);

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
      disabled: (mov) => puedeEditarMovimiento(mov)
    },
    {
      label: 'Eliminar',
      icon: <FaTrash />,
      onClick: (mov) => onEliminar({ ...mov, tipo: 'Insumo' }),
      variant: 'ghost',
      disabled: (mov) => puedeEliminarMovimiento(mov) // ✅ Usar validación específica de eliminación
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
                <div className="w-3 h-3 bg-gray-400 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">📦</span>
                </div>
                <div>
                  <span className="font-medium">📦 Normal:</span>
                  <span className="ml-1">Movimientos regulares de entrada/salida de insumos</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-400 rounded-full flex items-center justify-center">
                  <span className="text-yellow-800 text-xs">!</span>
                </div>
                <div>
                  <span className="font-medium">⚠️ Nota:</span>
                  <span className="ml-1">Los movimientos de ensamble ENTRADA pueden editarse/eliminarse si no fueron usados para crear productos. Los movimientos de ensamble SALIDA no pueden editarse/eliminarse directamente.</span>
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