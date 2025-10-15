import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
      {/* Header */}
      <PageHeader 
        title="Gestión de Productos e Insumos"
        subtitle="Administra tu inventario de productos y materias primas"
      />

      {/* Contenido principal - Layout dinámico */}
      <div className="h-[calc(100vh-120px)] flex flex-col">
        {/* Sección de Productos - Ocupa solo su contenido hasta máximo 50% */}
        <div className="flex-shrink-0 p-4 pb-2">
          <ProductosSection
            productos={productos}
            onCreate={() => openModal('productoCreate')}
            onEdit={handleEditProducto}
            onDelete={handleDeleteProducto}
            onView={handleViewProducto}
          />
        </div>

        {/* Sección de Insumos - Ocupa el resto del espacio disponible */}
        <div className="flex-1 p-4 pt-2">
          <InsumosSection
            insumos={insumos}
            onCreate={() => openModal('insumoCreate')}
            onDelete={handleDeleteInsumo}
          />
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
        message={`¿Estás seguro de que quieres eliminar "${selectedItem?.nombre}"? Esta acción no se puede deshacer.`}
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