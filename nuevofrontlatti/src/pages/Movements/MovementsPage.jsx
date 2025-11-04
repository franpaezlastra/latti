import React, { useState, useEffect } from "react";
import { FaPlus, FaBox, FaCog, FaFilter } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { loadMovimientosInsumo, deleteMovimientoInsumo, validarEdicionMovimiento } from "../../store/actions/movimientoInsumoActions";
import { loadMovimientosProducto, deleteMovimientoProducto } from "../../store/actions/movimientoProductoActions";
import { loadInsumos } from "../../store/actions/insumoActions";
import { loadProductos } from "../../store/actions/productosActions";
import { useGlobalUpdate } from "../../hooks/useGlobalUpdate";

// Componentes UI
import { 
  PageHeader, 
  Card, 
  Button, 
  Tabs, 
  DataTable, 
  FilterPanel, 
  StatCard, 
  Badge, 
  LoadingSpinner, 
  ErrorMessage, 
  DeleteConfirmationModal 
} from "../../components/ui";

// Modales
import MovimientoSeleccionModal from "../../components/features/movements/modals/MovimientoSeleccionModal";
import MovimientoInsumoModal from "../../components/features/movements/modals/MovimientoInsumoModal";
import MovimientoInsumoCompuestoModal from "../../components/features/movements/modals/MovimientoInsumoCompuestoModal";
import MovimientoProductoModal from "../../components/features/movements/modals/MovimientoProductoModal";
import MovimientoDetallesModal from "../../components/features/movements/modals/MovimientoDetallesModal";
import EditarMovimientoInsumoModal from "../../components/features/movements/modals/EditarMovimientoInsumoModal";

// Componentes de secciones
import InsumosMovementsSection from "./sections/InsumosMovementsSection";
import ProductosMovementsSection from "./sections/ProductosMovementsSection";

const MovementsPage = () => {
  const dispatch = useDispatch();
  const { updateAfterDeletion } = useGlobalUpdate();
  
  // Estados de Redux
  const {
    movimientos: movimientosInsumo,
    loading: loadingInsumos,
    error: errorInsumos
  } = useSelector((state) => state.movimientosInsumo);

  const {
    movimientos: movimientosProducto,
    loading: loadingProductos,
    error: errorProductos
  } = useSelector((state) => state.movimientosProducto);

  const {
    insumos,
    loading: loadingInsumosData
  } = useSelector((state) => state.insumos);

  const {
    productos,
    loading: loadingProductosData
  } = useSelector((state) => state.productos);

  // Estados locales
  const [activeTab, setActiveTab] = useState("insumos");
  const [showSeleccionModal, setShowSeleccionModal] = useState(false);
  const [showInsumoModal, setShowInsumoModal] = useState(false);
  const [showInsumoCompuestoModal, setShowInsumoCompuestoModal] = useState(false);
  const [showProductoModal, setShowProductoModal] = useState(false);
  const [showDetallesModal, setShowDetallesModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  const [movimientoSeleccionado, setMovimientoSeleccionado] = useState(null);
  const [movimientoAEliminar, setMovimientoAEliminar] = useState(null);
  const [movimientoAEditar, setMovimientoAEditar] = useState(null);
  const [eliminando, setEliminando] = useState(false);
  
  // Estados de error
  const [errorEliminacion, setErrorEliminacion] = useState("");
  const [mostrarError, setMostrarError] = useState(false);

  // Cargar datos al montar el componente
  useEffect(() => {
    dispatch(loadMovimientosInsumo());
    dispatch(loadMovimientosProducto());
    dispatch(loadInsumos());
    dispatch(loadProductos());
  }, [dispatch]);

  // Configuración de tabs
  const tabs = [
    {
      id: "insumos",
      label: "Insumos",
      icon: <FaBox size={14} />,
      badge: movimientosInsumo?.length || 0
    },
    {
      id: "productos", 
      label: "Productos",
      icon: <FaCog size={14} />,
      badge: movimientosProducto?.length || 0
    }
  ];

  // Handlers de modales
  const openModal = (modalName) => {
    setErrorEliminacion("");
    setMostrarError(false);
    
    switch (modalName) {
      case 'seleccion':
        setShowSeleccionModal(true);
        break;
      case 'insumo':
        setShowInsumoModal(true);
        break;
      case 'insumoCompuesto':
        setShowInsumoCompuestoModal(true);
        break;
      case 'producto':
        setShowProductoModal(true);
        break;
      case 'detalles':
        setShowDetallesModal(true);
        break;
      case 'edit':
        setShowEditModal(true);
        break;
      case 'delete':
        setShowDeleteModal(true);
        break;
      default:
        break;
    }
  };

  const closeModal = (modalName) => {
    switch (modalName) {
      case 'seleccion':
        setShowSeleccionModal(false);
        break;
      case 'insumo':
        setShowInsumoModal(false);
        break;
      case 'insumoCompuesto':
        setShowInsumoCompuestoModal(false);
        break;
      case 'producto':
        setShowProductoModal(false);
        break;
      case 'detalles':
        setShowDetallesModal(false);
        setMovimientoSeleccionado(null);
        break;
      case 'edit':
        setShowEditModal(false);
        setMovimientoAEditar(null);
        break;
      case 'delete':
        setShowDeleteModal(false);
        setMovimientoAEliminar(null);
        setErrorEliminacion("");
        setMostrarError(false);
        break;
      default:
        break;
    }
  };

  // Handlers de acciones
  const handleVerDetalles = (movimiento) => {
    setMovimientoSeleccionado(movimiento);
    openModal('detalles');
  };

  const handleEliminarMovimiento = (movimiento) => {
    setMovimientoAEliminar(movimiento);
    setErrorEliminacion("");
    setMostrarError(false);
    openModal('delete');
  };

  const handleEditarMovimiento = async (movimiento) => {
    // Buscar el movimiento original en los movimientos cargados
    // porque el movimiento formateado puede no tener todos los datos
    const movimientoOriginal = movimientosInsumo.find(m => m.id === movimiento.id);
    
    if (!movimientoOriginal) {
      return;
    }

    // Validar si el movimiento puede ser editado antes de abrir el modal
    try {
      const validacion = await dispatch(validarEdicionMovimiento(movimiento.id)).unwrap();
      
      // Si NO puede editarse, no abrir el modal
      if (!validacion.puedeEditar) {
        // El botón ya está deshabilitado visualmente, solo evitamos abrir el modal
        return;
      }
    } catch (error) {
      // Si hay error en la validación, por seguridad no abrir el modal
      console.error('Error al validar edición:', error);
      return;
    }
    
    // Reconstruir el movimiento con la estructura que espera el modal
    const fechaMovimiento = movimientoOriginal.fecha 
      ? (movimientoOriginal.fecha instanceof Date 
          ? movimientoOriginal.fecha 
          : new Date(movimientoOriginal.fecha))
      : new Date();
    
    const movimientoParaEditar = {
      id: movimientoOriginal.id,
      fecha: fechaMovimiento,
      descripcion: movimientoOriginal.descripcion || '',
      tipoMovimiento: movimientoOriginal.tipoMovimiento,
      // Convertir insumos a detalles (formato que espera el modal)
      // El backend devuelve los detalles como 'detalles' o 'insumos'
      detalles: (movimientoOriginal.detalles || movimientoOriginal.insumos || []).map(detalle => ({
        id: detalle.insumoId || detalle.id || detalle.insumo?.id,
        insumoId: detalle.insumoId || detalle.id || detalle.insumo?.id,
        nombre: detalle.nombreInsumo || detalle.nombre || detalle.insumo?.nombre,
        nombreInsumo: detalle.nombreInsumo || detalle.nombre || detalle.insumo?.nombre,
        cantidad: detalle.cantidad || 0,
        precioTotal: detalle.precioTotal || detalle.precio || 0,
        precio: detalle.precio || detalle.precioTotal || 0
      }))
    };
    
    setMovimientoAEditar(movimientoParaEditar);
      openModal('edit');
  };

  const handleConfirmarEliminacion = async () => {
    if (!movimientoAEliminar) return;

    setEliminando(true);
    setErrorEliminacion("");
    setMostrarError(false);
    
    try {
      if (movimientoAEliminar.tipo === "Insumo") {
        await dispatch(deleteMovimientoInsumo(movimientoAEliminar.id)).unwrap();
        await updateAfterDeletion('movimientoInsumo');
      } else {
        await dispatch(deleteMovimientoProducto(movimientoAEliminar.id)).unwrap();
        await updateAfterDeletion('movimientoProducto');
      }

      closeModal('delete');
    } catch (error) {
      console.error("Error al eliminar movimiento:", error);
      const errorMessage = error.message || "Error inesperado al eliminar el movimiento";
      setErrorEliminacion(errorMessage);
      setMostrarError(true);
    } finally {
      setEliminando(false);
    }
  };

  // Loading state
  if (loadingInsumos || loadingProductos || loadingInsumosData || loadingProductosData) {
    return <LoadingSpinner />;
  }

  // Error state
  if (errorInsumos || errorProductos) {
    return (
      <ErrorMessage 
        message={errorInsumos || errorProductos} 
        onRetry={() => {
          dispatch(loadMovimientosInsumo());
          dispatch(loadMovimientosProducto());
        }}
      />
    );
  }

  return (
    <div className="h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex flex-col">
      {/* Header fijo */}
      <div className="px-6 py-4 bg-white border-b border-gray-200 shadow-sm flex-shrink-0">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-1">Gestión de Movimientos</h1>
          <p className="text-sm text-gray-600">Administra entradas y salidas de stock de insumos y productos</p>
        </div>
      </div>

      {/* Contenido principal con scroll */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-6 py-4">
        {/* Tabs */}
        <div className="mb-6">
          <Tabs
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            variant="default"
            className="bg-gradient-to-r from-gray-50 to-gray-100 p-1.5 rounded-xl shadow-sm border border-gray-200"
          />
        </div>

        {/* Contenido de tabs */}
        {activeTab === "insumos" && (
          <InsumosMovementsSection
            movimientos={movimientosInsumo || []}
            insumos={insumos || []}
            onVerDetalles={handleVerDetalles}
            onEliminar={handleEliminarMovimiento}
            onEditar={handleEditarMovimiento}
            onNuevoInsumo={() => openModal('insumo')}
            onNuevoInsumoCompuesto={() => openModal('insumoCompuesto')}
          />
        )}

        {activeTab === "productos" && (
          <ProductosMovementsSection
            movimientos={movimientosProducto || []}
            productos={productos || []}
            onVerDetalles={handleVerDetalles}
            onEliminar={handleEliminarMovimiento}
            onNuevoProducto={() => openModal('producto')}
          />
        )}

        </div>
      </div>

      {/* Modales */}
      <MovimientoSeleccionModal
        isOpen={showSeleccionModal}
        onClose={() => closeModal('seleccion')}
        onSeleccionarInsumo={() => {
          closeModal('seleccion');
          openModal('insumo');
        }}
        onSeleccionarInsumoCompuesto={() => {
          closeModal('seleccion');
          openModal('insumoCompuesto');
        }}
        onSeleccionarProducto={() => {
          closeModal('seleccion');
          openModal('producto');
        }}
      />

      <MovimientoInsumoModal
        isOpen={showInsumoModal}
        onClose={() => closeModal('insumo')}
        onSuccess={() => {
          closeModal('insumo');
          dispatch(loadMovimientosInsumo());
        }}
      />

      <MovimientoInsumoCompuestoModal
        isOpen={showInsumoCompuestoModal}
        onClose={() => closeModal('insumoCompuesto')}
        onSuccess={() => {
          closeModal('insumoCompuesto');
          dispatch(loadMovimientosInsumo());
        }}
      />

      <MovimientoProductoModal
        isOpen={showProductoModal}
        onClose={() => closeModal('producto')}
        onSuccess={() => {
          closeModal('producto');
          dispatch(loadMovimientosProducto());
        }}
      />

      <MovimientoDetallesModal
        isOpen={showDetallesModal}
        onClose={() => closeModal('detalles')}
        movimiento={movimientoSeleccionado}
      />

      <EditarMovimientoInsumoModal
        isOpen={showEditModal}
        onClose={() => {
          closeModal('edit');
          // Recargar movimientos después de cerrar el modal para asegurar que la lista esté actualizada
          dispatch(loadMovimientosInsumo());
        }}
        movimiento={movimientoAEditar}
        onSuccess={() => {
          // El modal ya recarga los movimientos internamente, pero por si acaso lo hacemos aquí también
          dispatch(loadMovimientosInsumo());
        }}
      />

      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => closeModal('delete')}
        onConfirm={handleConfirmarEliminacion}
        title="Eliminar Movimiento"
        message={`¿Estás seguro de que quieres eliminar este movimiento de ${movimientoAEliminar?.tipo?.toLowerCase()}? Esta acción revertirá todos los cambios de stock y no se puede deshacer.`}
        loading={eliminando}
        error={mostrarError}
        errorMessage={errorEliminacion}
      />
    </div>
  );
};

export default MovementsPage;