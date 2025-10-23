import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { FaPlus, FaBox } from "react-icons/fa";
import { 
  loadProductos, 
  deleteProducto, 
  crearProducto, 
  updateProducto 
} from "../../../store/actions/productosActions";
import { 
  fetchInsumos, 
  createInsumo, 
  deleteInsumo,
  clearCreateError
} from "../../../store/slices/insumoSlice";
import { useGlobalUpdate } from "../../../hooks/useGlobalUpdate";

// Componentes de UI
import PageHeader from "../../ui/PageHeader";
import LoadingSpinner from "../../ui/LoadingSpinner";
import ErrorMessage from "../../ui/ErrorMessage";
import SuccessToast from "../../ui/SuccessToast";

// Componentes de productos
import ProductosSection from "./sections/ProductosSection";
import InsumosSection from "./sections/InsumosSection";

// Modales
import ProductoCreateModal from "./modals/ProductoCreateModal";
import ProductoEditModal from "./modals/ProductoEditModal";
import ProductoDetailsModal from "./modals/ProductoDetailsModal";
import InsumoCreateModal from "./modals/InsumoCreateModal";
import EditarInsumoModal from "../insumos/modals/EditarInsumoModal";
import EditarInsumoCompuestoModal from "../insumos/modals/EditarInsumoCompuestoModal";
import DetallesInsumoModal from "../insumos/modals/DetallesInsumoModal";
import EnsamblarInsumoCompuestoModal from "../insumos/modals/EnsamblarInsumoCompuestoModal";
import DeleteConfirmationModal from "../../ui/DeleteConfirmationModal";

const ProductosPage = () => {
  const dispatch = useDispatch();
  const { updateAfterInsumoCreation, updateAfterProductoCreation, updateAfterDeletion } = useGlobalUpdate();

  // Estados de Redux
  const {
    productos,
    status: productoStatus,
    error: productoError,
    createError,
    deleteStatus
  } = useSelector((state) => state.productos);

  const {
    insumos,
    loading: insumoLoading,
    error: insumoError
  } = useSelector((state) => state.insumos);

  // Estados locales
  const [modals, setModals] = useState({
    productoCreate: false,
    productoEdit: false,
    productoDetails: false,
    insumoCreate: false,
    insumoEdit: false,
    insumoCompuestoEdit: false,
    insumoDetails: false,
    ensamblarInsumo: false,
    deleteProducto: false,
    deleteInsumo: false
  });

  const [selectedItem, setSelectedItem] = useState(null);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  // Cargar datos al montar el componente
  useEffect(() => {
    dispatch(loadProductos());
    dispatch(fetchInsumos());
  }, [dispatch]);

  // Handlers para modales
  const openModal = (modalName) => {
    // Limpiar errores cuando se abre un modal
    if (modalName === 'insumoCreate') {
      dispatch(clearCreateError());
    }
    setModals(prev => ({ ...prev, [modalName]: true }));
  };

  const closeModal = (modalName) => {
    setModals(prev => ({ ...prev, [modalName]: false }));
    setSelectedItem(null);
  };

  // Handlers para productos
  const handleCreateProducto = async (productoData) => {
    try {
      const result = await dispatch(crearProducto(productoData));
      if (crearProducto.fulfilled.match(result)) {
        // Actualizar datos globalmente después del éxito
        await updateAfterProductoCreation();
        closeModal('productoCreate');
        showToast("Producto creado exitosamente", "success");
      } else {
        // Extraer el error del backend
        const errorMessage = result.payload?.error || "Error al crear producto";
        return { error: errorMessage };
      }
    } catch (error) {
      return { error: "Error inesperado al crear producto" };
    }
  };

  const handleEditProducto = (producto) => {
    setSelectedItem(producto);
    openModal('productoEdit');
  };

  const handleUpdateProducto = async (productoData) => {
    try {
      const result = await dispatch(updateProducto({
        id: selectedItem.id,
        data: productoData
      }));
      if (updateProducto.fulfilled.match(result)) {
        await dispatch(loadProductos());
        closeModal('productoEdit');
        showToast("Producto actualizado exitosamente", "success");
      } else {
        showToast(result.payload?.error || "Error al actualizar producto", "error");
      }
    } catch (error) {
      showToast("Error inesperado al actualizar producto", "error");
    }
  };

  const handleDeleteProducto = (producto) => {
    setSelectedItem(producto);
    openModal('deleteProducto');
  };

  const confirmDeleteProducto = async () => {
    try {
      const result = await dispatch(deleteProducto(selectedItem.id));
      if (deleteProducto.fulfilled.match(result)) {
        // Actualizar datos globalmente después del éxito
        await updateAfterDeletion('producto');
        closeModal('deleteProducto');
        showToast("Producto eliminado exitosamente", "success");
      } else {
        showToast(result.payload?.error || "Error al eliminar producto", "error");
      }
    } catch (error) {
      showToast("Error inesperado al eliminar producto", "error");
    }
  };

  const handleViewProducto = (producto) => {
    setSelectedItem(producto);
    openModal('productoDetails');
  };

  const handleViewInsumo = (insumo) => {
    setSelectedItem(insumo);
    openModal('insumoDetails');
  };

  // Handlers para insumos
  const handleCreateInsumo = async (insumoData) => {
    try {
      const result = await dispatch(createInsumo(insumoData));
      console.log('handleCreateInsumo - result:', result);
      if (createInsumo.fulfilled.match(result)) {
        // Actualizar datos globalmente después del éxito
        await updateAfterInsumoCreation();
        closeModal('insumoCreate');
        showToast("Insumo creado exitosamente", "success");
      } else {
        // Extraer el error del backend - usar el payload directamente
        const errorMessage = result.payload || "Error al crear insumo";
        console.log('handleCreateInsumo - errorMessage:', errorMessage);
        // No cerrar el modal, dejar que se muestre el error en el formulario
        return { error: errorMessage };
      }
    } catch (error) {
      console.log('handleCreateInsumo - catch error:', error);
      return { error: "Error inesperado al crear insumo" };
    }
  };

  const handleDeleteInsumo = (insumo) => {
    setSelectedItem(insumo);
    openModal('deleteInsumo');
  };

  const handleEditInsumo = (insumo) => {
    setSelectedItem(insumo);
    // Abrir modal diferente según el tipo de insumo
    // Usar tipoOriginal que preserva el valor original del tipo
    if (insumo.tipoOriginal === 'COMPUESTO') {
      openModal('insumoCompuestoEdit');
    } else {
      openModal('insumoEdit');
    }
  };

  const confirmDeleteInsumo = async () => {
    try {
      const result = await dispatch(deleteInsumo(selectedItem.id));
      if (deleteInsumo.fulfilled.match(result)) {
        // Actualizar datos globalmente después del éxito
        await updateAfterDeletion('insumo');
        closeModal('deleteInsumo');
        showToast("Insumo eliminado exitosamente", "success");
      } else {
        // Extraer el error del backend
        const errorMessage = result.payload?.error || "Error al eliminar insumo";
        showToast(errorMessage, "error");
      }
    } catch (error) {
      showToast("Error inesperado al eliminar insumo", "error");
    }
  };

  // Handler para ensamblar insumos compuestos
  const handleEnsamblarInsumo = (insumo) => {
    setSelectedItem(insumo);
    openModal('ensamblarInsumo');
  };

  const handleEditInsumoSubmit = async (insumoData) => {
    try {
      // Actualizar datos globalmente después del éxito
      await updateAfterInsumoCreation();
      closeModal('insumoEdit');
      closeModal('insumoCompuestoEdit');
      showToast("Insumo actualizado exitosamente", "success");
    } catch (error) {
      console.error("Error al editar insumo:", error);
      showToast(error.message || "Error inesperado al editar insumo", "error");
      throw error; // Re-lanzar para que el modal maneje el error
    }
  };

  const handleEnsamblarSubmit = async (insumoId, ensambleData) => {
    try {
      // Actualizar datos globalmente después del éxito
      await updateAfterInsumoCreation();
      closeModal('ensamblarInsumo');
      showToast("Insumo compuesto ensamblado exitosamente", "success");
    } catch (error) {
      console.error("Error al ensamblar insumo:", error);
      showToast(error.message || "Error inesperado al ensamblar insumo", "error");
      throw error; // Re-lanzar para que el modal maneje el error
    }
  };

  // Toast helper
  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3000);
  };

  // Loading state - solo mostrar spinner para carga inicial, no para operaciones de modales
  if (productoStatus === "loading" || deleteStatus === "loading") {
    return <LoadingSpinner />;
  }

  return (
    <div className="h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex flex-col">
      {/* Header fijo */}
      <div className="px-6 py-4 bg-white border-b border-gray-200 shadow-sm flex-shrink-0">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-1">Gestión de Productos e Insumos</h1>
          <p className="text-sm text-gray-600">Administra tu inventario de productos y materias primas</p>
        </div>
      </div>

      {/* Contenido principal con scroll */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-6 py-4">
        {/* Sección de Productos */}
        <div className="mb-4">
          <ProductosSection
            productos={productos}
            onCreate={() => openModal('productoCreate')}
            onEdit={handleEditProducto}
            onDelete={handleDeleteProducto}
            onDetails={(producto) => {
              setSelectedItem(producto);
              openModal('productoDetails');
            }}
          />
        </div>

        {/* Sección de Insumos */}
        <div>
          <InsumosSection
            insumos={insumos}
            onCreate={() => openModal('insumoCreate')}
            onDelete={handleDeleteInsumo}
            onEdit={handleEditInsumo}
            onDetails={handleViewInsumo}
          />
        </div>
        </div>
      </div>

      {/* Modales */}
      <ProductoCreateModal
        isOpen={modals.productoCreate}
        onClose={() => closeModal('productoCreate')}
        onSubmit={handleCreateProducto}
        insumos={insumos}
      />

      <ProductoEditModal
        isOpen={modals.productoEdit}
        onClose={() => closeModal('productoEdit')}
        onSubmit={handleUpdateProducto}
        producto={selectedItem}
        insumos={insumos}
      />

      <ProductoDetailsModal
        isOpen={modals.productoDetails}
        onClose={() => closeModal('productoDetails')}
        producto={selectedItem}
      />

      <InsumoCreateModal
        isOpen={modals.insumoCreate}
        onClose={() => closeModal('insumoCreate')}
        onSubmit={handleCreateInsumo}
        onRefresh={updateAfterInsumoCreation}
      />

      <EditarInsumoModal
        isOpen={modals.insumoEdit}
        onClose={() => closeModal('insumoEdit')}
        insumo={selectedItem}
        onSubmit={handleEditInsumoSubmit}
      />

      <EditarInsumoCompuestoModal
        isOpen={modals.insumoCompuestoEdit}
        onClose={() => closeModal('insumoCompuestoEdit')}
        insumo={selectedItem}
        onSubmit={handleEditInsumoSubmit}
      />

      <EnsamblarInsumoCompuestoModal
        isOpen={modals.ensamblarInsumo}
        onClose={() => closeModal('ensamblarInsumo')}
        insumoCompuesto={selectedItem}
        onSubmit={handleEnsamblarSubmit}
      />

      <DeleteConfirmationModal
        isOpen={modals.deleteProducto}
        onClose={() => closeModal('deleteProducto')}
        onConfirm={confirmDeleteProducto}
        title="Eliminar Producto"
        message={`¿Estás seguro de que quieres eliminar "${selectedItem?.nombre}"? Esta acción no se puede deshacer.`}
      />

      <DeleteConfirmationModal
        isOpen={modals.deleteInsumo}
        onClose={() => closeModal('deleteInsumo')}
        onConfirm={confirmDeleteInsumo}
        title="Eliminar Insumo"
        message={`¿Estás seguro de que quieres eliminar "${selectedItem?.nombre || 'este insumo'}"? Esta acción no se puede deshacer.`}
      />

      <DetallesInsumoModal
        isOpen={modals.insumoDetails}
        onClose={() => closeModal('insumoDetails')}
        insumo={selectedItem}
      />

      {/* Toast de notificaciones */}
      <SuccessToast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ show: false, message: "", type: "success" })}
      />
    </div>
  );
};

export default ProductosPage; 