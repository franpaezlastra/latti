import React, { useState, useEffect } from "react";
import { FaPlus, FaBox, FaCog, FaChartLine } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { loadMovimientosInsumo, deleteMovimientoInsumo } from "../../store/actions/movimientoInsumoActions";
import { loadMovimientosProducto, deleteMovimientoProducto } from "../../store/actions/movimientoProductoActions";
import { loadInsumos } from "../../store/actions/insumoActions";
import { loadProductos } from "../../store/actions/productosActions";
import { useGlobalUpdate } from "../../hooks/useGlobalUpdate";

// Componentes UI
import PageHeader from "../../components/ui/PageHeader";
import Tabla from "../../components/ui/Tabla";
import DeleteConfirmationModal from "../../components/ui/DeleteConfirmationModal";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import ErrorMessage from "../../components/ui/ErrorMessage";

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
import StockSummary from "./components/StockSummary";

const MovementsPage = () => {
  const dispatch = useDispatch();
  const { updateAfterDeletion } = useGlobalUpdate();
  
  // Estados de Redux
  const {
    movimientosInsumo,
    loading: loadingInsumos,
    error: errorInsumos
  } = useSelector((state) => state.movimientosInsumo);

  const {
    movimientosProducto,
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

  const handleEditarMovimiento = (movimiento) => {
    if (movimiento.tipo === "Insumo") {
      setMovimientoAEditar(movimiento);
      openModal('edit');
    }
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
    <div className="flex flex-col bg-gradient-to-br from-blue-50 via-white to-blue-100 min-h-screen">
      {/* Header */}
      <PageHeader
        title="Gestión de Movimientos"
        subtitle="Administra entradas y salidas de stock de insumos y productos"
        actionButton={{
          icon: <FaPlus size={16} />,
          onClick: () => openModal('seleccion'),
          label: "Nuevo movimiento"
        }}
      />

      {/* Tabs */}
      <div className="px-4 pt-2">
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
          <button
            onClick={() => setActiveTab("insumos")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === "insumos"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <FaBox className="inline mr-2" size={14} />
            Insumos
          </button>
          <button
            onClick={() => setActiveTab("productos")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === "productos"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <FaCog className="inline mr-2" size={14} />
            Productos
          </button>
          <button
            onClick={() => setActiveTab("stock")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === "stock"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <FaChartLine className="inline mr-2" size={14} />
            Resumen de Stock
          </button>
        </div>
      </div>

      {/* Contenido */}
      <div className="flex-1 p-4">
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

        {activeTab === "stock" && (
          <StockSummary
            insumos={insumos || []}
            productos={productos || []}
          />
        )}
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
        onClose={() => closeModal('edit')}
        movimiento={movimientoAEditar}
        onSuccess={() => {
          closeModal('edit');
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
