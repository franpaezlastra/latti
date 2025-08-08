import React, { useState, useEffect } from "react";
import { FaPlus, FaEye, FaTrash } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { loadMovimientosInsumo, deleteMovimientoInsumo } from "../../store/actions/movimientoInsumoActions";
import { loadMovimientosProducto, deleteMovimientoProducto } from "../../store/actions/movimientoProductoActions";
import { loadInsumos } from "../../store/actions/insumoActions";
import { loadProductos } from "../../store/actions/productosActions";
import { useGlobalUpdate } from "../../hooks/useGlobalUpdate";
import Tabla from "../../components/ui/Tabla";
import DeleteConfirmationModal from "../../components/ui/DeleteConfirmationModal";
import PageHeader from "../../components/ui/PageHeader";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";

// Modales de movimientos
import MovimientoSeleccionModal from "../../components/features/movements/modals/MovimientoSeleccionModal";
import MovimientoInsumoModal from "../../components/features/movements/modals/MovimientoInsumoModal";
import MovimientoProductoModal from "../../components/features/movements/modals/MovimientoProductoModal";
import MovimientoDetallesModal from "../../components/features/movements/modals/MovimientoDetallesModal";

const Movements = () => {
  const dispatch = useDispatch();
  
  // Estados de modales
  const [showSeleccionModal, setShowSeleccionModal] = useState(false);
  const [showInsumoModal, setShowInsumoModal] = useState(false);
  const [showProductoModal, setShowProductoModal] = useState(false);
  const [showDetallesModal, setShowDetallesModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  // Estados de datos
  const [movimientoSeleccionado, setMovimientoSeleccionado] = useState(null);
  const [movimientoAEliminar, setMovimientoAEliminar] = useState(null);
  const [eliminando, setEliminando] = useState(false);

  // Estados de filtros
  const [productoFiltro, setProductoFiltro] = useState("");
  const [tipoMovimientoFiltro, setTipoMovimientoFiltro] = useState("");
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  const [fechaVencimientoDesde, setFechaVencimientoDesde] = useState("");
  const [fechaVencimientoHasta, setFechaVencimientoHasta] = useState("");

  // Estados de paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const movimientosPorPagina = 9;

  // Cargar datos solo cuando sea necesario
  const insumos = useSelector((state) => state.insumos.insumos);
  const productos = useSelector((state) => state.productos.productos);
  const { updateAfterDeletion } = useGlobalUpdate();
  
  // Datos del store
  const movimientosInsumos = useSelector((state) => state.movimientosInsumo.movimientos);
  const movimientosProductos = useSelector((state) => state.movimientosProducto.movimientos);
  


  useEffect(() => {
    dispatch(loadMovimientosInsumo());
    dispatch(loadMovimientosProducto());
    dispatch(loadInsumos());
    dispatch(loadProductos());
  }, []);

  // Unificar movimientos
  const movimientosUnificados = [
    ...(movimientosInsumos || []).map((m) => ({
      ...m,
      id: m.id,
      tipo: "Insumo",
      fecha: new Date(m.fecha),
      descripcion: m.descripcion,
      tipoMovimiento: m.tipoMovimiento,
      detalles: m.insumos || [],
    })),
    ...(movimientosProductos || []).map((m) => ({
      ...m,
      id: m.id,
      tipo: "Producto",
      fecha: new Date(m.fecha),
      descripcion: m.descripcion,
      tipoMovimiento: m.tipoMovimiento,
      detalles: m.detalles || [],
    })),
  ].sort((a, b) => {
    const comparacionFecha = b.fecha - a.fecha;
    if (comparacionFecha !== 0) {
      return comparacionFecha;
    }
    return (a.descripcion || "").localeCompare(b.descripcion || "", 'es', { sensitivity: 'base' });
  });



  // Filtrar movimientos
  const movimientosFiltrados = movimientosUnificados.filter((mov) => {
    const cumpleProducto = !productoFiltro || mov.tipo === productoFiltro;
    const cumpleTipoMov = !tipoMovimientoFiltro || mov.tipoMovimiento === tipoMovimientoFiltro;
    
    let cumpleFecha = true;
    
    if (mov.tipo === "Insumo") {
      const cumpleFechaDesde = !fechaDesde || mov.fecha >= new Date(fechaDesde);
      const cumpleFechaHasta = !fechaHasta || mov.fecha <= new Date(fechaHasta);
      cumpleFecha = cumpleFechaDesde && cumpleFechaHasta;
    } else if (mov.tipo === "Producto") {
      if (fechaVencimientoDesde || fechaVencimientoHasta) {
        const tieneFechaVencimientoEnRango = mov.detalles.some(detalle => {
          if (!detalle.fechaVencimiento) return false;
          
          const fechaVenc = new Date(detalle.fechaVencimiento);
          const cumpleDesde = !fechaVencimientoDesde || fechaVenc >= new Date(fechaVencimientoDesde);
          const cumpleHasta = !fechaVencimientoHasta || fechaVenc <= new Date(fechaVencimientoHasta);
          
          return cumpleDesde && cumpleHasta;
        });
        
        cumpleFecha = tieneFechaVencimientoEnRango;
      }
    }
    
    return cumpleProducto && cumpleTipoMov && cumpleFecha;
  });

  // Paginación
  const totalPaginas = Math.ceil(movimientosFiltrados.length / movimientosPorPagina);
  const movimientosPaginados = movimientosFiltrados.slice(
    (paginaActual - 1) * movimientosPorPagina,
    paginaActual * movimientosPorPagina
  );



  // Handlers
  const handleSeleccionarTipo = (tipo) => {
    if (tipo === "insumo") {
      setShowInsumoModal(true);
    } else if (tipo === "producto") {
      setShowProductoModal(true);
    }
    setShowSeleccionModal(false);
  };

  const handleExitoMovimiento = () => {
    setShowInsumoModal(false);
    setShowProductoModal(false);
    // Los modales ya actualizan los datos automáticamente
  };

  const handleVerDetalles = (movimiento) => {
    setMovimientoSeleccionado(movimiento);
    setShowDetallesModal(true);
  };

  const handleEliminarMovimiento = (movimiento) => {
    setMovimientoAEliminar(movimiento);
    setShowDeleteModal(true);
  };

    const handleConfirmarEliminacion = async () => {
    if (!movimientoAEliminar) return;

    setEliminando(true);
    try {
      if (movimientoAEliminar.tipo === "Insumo") {
        await dispatch(deleteMovimientoInsumo(movimientoAEliminar.id)).unwrap();
        // Actualizar datos después de eliminar movimiento de insumo
        await updateAfterDeletion('movimientoInsumo');
      } else {
        await dispatch(deleteMovimientoProducto(movimientoAEliminar.id)).unwrap();
        // Actualizar datos después de eliminar movimiento de producto
        await updateAfterDeletion('movimientoProducto');
      }

      setShowDeleteModal(false);
      setMovimientoAEliminar(null);
    } catch (error) {
      console.error("Error al eliminar movimiento:", error);
    } finally {
      setEliminando(false);
    }
  };

  const limpiarFiltros = () => {
    setProductoFiltro("");
    setTipoMovimientoFiltro("");
    setFechaDesde("");
    setFechaHasta("");
    setFechaVencimientoDesde("");
    setFechaVencimientoHasta("");
    setPaginaActual(1);
  };

  // Configuración de la tabla
  const columnas = ["Fecha", "Tipo movimiento", "Tipo ítem", "Descripción"];

  const renderFila = (mov) => (
    <>
      <td className="px-4 py-2">{mov.fecha.toLocaleDateString()}</td>
      <td className="px-4 py-2">
        <span
          className={`px-2 py-1 text-xs rounded-full ${
            mov.tipoMovimiento === "ENTRADA"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {mov.tipoMovimiento === "ENTRADA" ? "Entrada" : "Salida"}
        </span>
      </td>
      <td className="px-4 py-2">{mov.tipo}</td>
      <td className="px-4 py-2">{mov.descripcion || "-"}</td>
    </>
  );



  const columnasAcciones = [
    {
      label: "Ver detalles",
      icon: <FaEye size={12} />,
      onClick: (mov) => {
        setMovimientoSeleccionado(mov);
        setShowDetallesModal(true);
      },
      className: "text-blue-600 hover:text-blue-800 hover:bg-blue-50",
    },
    {
      label: "Eliminar",
      icon: <FaTrash size={12} />,
      onClick: (mov) => handleEliminarMovimiento(mov),
      className: "text-red-600 hover:text-red-800 hover:bg-red-50",
    },
  ];

  return (
    <div className="flex flex-col bg-gradient-to-br from-blue-50 via-white to-blue-100 min-h-screen">
      {/* Header */}
      <PageHeader
        title="Movimientos"
        subtitle="Gestión de entradas y salidas de stock"
        actionButton={{
          icon: <FaPlus size={16} />,
          onClick: () => setShowSeleccionModal(true),
          label: "Agregar movimiento"
        }}
      />

      {/* Modales */}
      <MovimientoSeleccionModal
        isOpen={showSeleccionModal}
        onClose={() => setShowSeleccionModal(false)}
        onSeleccion={handleSeleccionarTipo}
      />

      <MovimientoInsumoModal
        isOpen={showInsumoModal}
        onClose={() => setShowInsumoModal(false)}
        onSubmit={handleExitoMovimiento}
      />

      <MovimientoProductoModal
        isOpen={showProductoModal}
        onClose={() => setShowProductoModal(false)}
        onSubmit={handleExitoMovimiento}
      />

      <MovimientoDetallesModal
        isOpen={showDetallesModal}
        onClose={() => {
          setShowDetallesModal(false);
          setMovimientoSeleccionado(null);
        }}
        movimiento={movimientoSeleccionado}
      />

      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setMovimientoAEliminar(null);
        }}
        onConfirm={handleConfirmarEliminacion}
        title="Eliminar Movimiento"
        message={`¿Estás seguro de que quieres eliminar este movimiento de ${movimientoAEliminar?.tipo?.toLowerCase()}? Esta acción revertirá todos los cambios de stock y no se puede deshacer.`}
        loading={eliminando}
      />

      {/* Contenido principal */}
      <section className="px-5 mt-6 mb-6">
        {/* Filtros */}
        <div className="flex flex-wrap gap-2 mb-4 items-end bg-white/80 p-3 rounded-xl shadow-sm">
          <div className="flex flex-col min-w-[120px]">
            <label className="text-xs text-gray-600 mb-1">Producto</label>
            <select
              className="px-2 py-1 border border-gray-300 rounded text-xs"
              value={productoFiltro}
              onChange={(e) => {
                setProductoFiltro(e.target.value);
                setPaginaActual(1);
              }}
            >
              <option value="">Todos</option>
              <option value="Producto">Producto</option>
              <option value="Insumo">Insumo</option>
            </select>
          </div>

          <div className="flex flex-col min-w-[120px]">
            <label className="text-xs text-gray-600 mb-1">Tipo de movimiento</label>
            <select
              className="px-2 py-1 border border-gray-300 rounded text-xs"
              value={tipoMovimientoFiltro}
              onChange={(e) => {
                setTipoMovimientoFiltro(e.target.value);
                setPaginaActual(1);
              }}
            >
              <option value="">Todos</option>
              <option value="ENTRADA">Entrada</option>
              <option value="SALIDA">Salida</option>
            </select>
          </div>

          {/* Filtros de fecha dinámicos */}
          {productoFiltro === "Insumo" || (!productoFiltro && tipoMovimientoFiltro) ? (
            <>
              <div className="flex flex-col min-w-[120px]">
                <label className="text-xs text-gray-600 mb-1">Fecha desde</label>
                <input
                  type="date"
                  value={fechaDesde}
                  onChange={(e) => {
                    setFechaDesde(e.target.value);
                    setPaginaActual(1);
                  }}
                  className="px-2 py-1 border border-gray-300 rounded text-xs"
                />
              </div>

              <div className="flex flex-col min-w-[120px]">
                <label className="text-xs text-gray-600 mb-1">Fecha hasta</label>
                <input
                  type="date"
                  value={fechaHasta}
                  onChange={(e) => {
                    setFechaHasta(e.target.value);
                    setPaginaActual(1);
                  }}
                  className="px-2 py-1 border border-gray-300 rounded text-xs"
                />
              </div>
            </>
          ) : productoFiltro === "Producto" || (!productoFiltro && !tipoMovimientoFiltro) ? (
            <>
              <div className="flex flex-col min-w-[120px]">
                <label className="text-xs text-gray-600 mb-1 flex items-center gap-1">
                  Vencimiento desde
                  {fechaVencimientoDesde && (
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  )}
                </label>
                <input
                  type="date"
                  value={fechaVencimientoDesde}
                  onChange={(e) => {
                    setFechaVencimientoDesde(e.target.value);
                    setPaginaActual(1);
                  }}
                  className="px-2 py-1 border border-gray-300 rounded text-xs"
                />
              </div>

              <div className="flex flex-col min-w-[120px]">
                <label className="text-xs text-gray-600 mb-1 flex items-center gap-1">
                  Vencimiento hasta
                  {fechaVencimientoHasta && (
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  )}
                </label>
                <input
                  type="date"
                  value={fechaVencimientoHasta}
                  onChange={(e) => {
                    setFechaVencimientoHasta(e.target.value);
                    setPaginaActual(1);
                  }}
                  className="px-2 py-1 border border-gray-300 rounded text-xs"
                />
              </div>
            </>
          ) : null}

          <Button
            onClick={limpiarFiltros}
            variant="outline"
            size="small"
            className="px-3 py-1 text-xs"
          >
            Limpiar filtros
          </Button>
        </div>



        {/* Contador de resultados */}
        <div className="flex justify-between items-center mb-2 px-1">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-600">
              Mostrando {movimientosFiltrados.length} de {movimientosUnificados.length} movimientos
            </span>
            {(fechaDesde || fechaHasta) && (
              <span className="text-xs text-green-600 font-medium">
                • Filtro por fecha de movimiento
              </span>
            )}
            {(fechaVencimientoDesde || fechaVencimientoHasta) && (
              <span className="text-xs text-orange-600 font-medium">
                • Filtro por fecha de vencimiento
              </span>
            )}
          </div>
          {(productoFiltro || tipoMovimientoFiltro || fechaDesde || fechaHasta || fechaVencimientoDesde || fechaVencimientoHasta) && (
            <span className="text-xs text-blue-600 font-medium">
              Filtros activos
            </span>
          )}
        </div>

        {/* Tabla */}
        <div className="w-full">
          <Tabla
            columnas={columnas}
            datos={movimientosPaginados}
            renderFila={renderFila}
            columnasAcciones={columnasAcciones}
            mensajeVacio="No hay movimientos registrados"
          />
      </div>
      
        {/* Paginación */}
        {totalPaginas > 1 && (
          <div className="flex justify-center gap-2 mt-2 mb-4">
            <Button
              onClick={() => setPaginaActual((p) => Math.max(p - 1, 1))}
              disabled={paginaActual === 1}
              variant="outline"
              size="small"
            >
              Anterior
            </Button>
            <span className="px-3 py-1 text-xs text-blue-700 font-semibold">
              Página {paginaActual} de {totalPaginas}
            </span>
            <Button
              onClick={() => setPaginaActual((p) => Math.min(p + 1, totalPaginas))}
              disabled={paginaActual === totalPaginas}
              variant="outline"
              size="small"
            >
              Siguiente
            </Button>
      </div>
        )}
      </section>
    </div>
  );
};

export default Movements; 