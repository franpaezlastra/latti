import { useDispatch } from 'react-redux';
import { fetchInsumos } from '../store/slices/insumoSlice';
import { loadProductos } from '../store/actions/productosActions';
import { loadMovimientosInsumo } from '../store/actions/movimientoInsumoActions';
import { loadMovimientosProducto } from '../store/actions/movimientoProductoActions';

export const useGlobalUpdate = () => {
  const dispatch = useDispatch();

  // Actualización completa del sistema
  const updateAllData = async () => {
    try {
      // Cargar todos los datos críticos en paralelo
      const promises = [
        dispatch(fetchInsumos()),
        dispatch(loadProductos()),
        dispatch(loadMovimientosInsumo()),
        dispatch(loadMovimientosProducto())
      ];
      
      await Promise.all(promises);
      console.log('✅ Datos actualizados globalmente');
    } catch (error) {
      console.error('❌ Error al actualizar datos globalmente:', error);
    }
  };

  // Actualización específica después de crear insumo
  const updateAfterInsumoCreation = async () => {
    try {
      // Solo recargar insumos y movimientos de insumos
      const promises = [
        dispatch(fetchInsumos()),
        dispatch(loadMovimientosInsumo())
      ];
      
      await Promise.all(promises);
      console.log('✅ Datos actualizados después de crear insumo');
    } catch (error) {
      console.error('❌ Error al actualizar después de crear insumo:', error);
    }
  };

  // Actualización específica después de crear producto
  const updateAfterProductoCreation = async () => {
    try {
      // Solo recargar productos y movimientos de productos
      const promises = [
        dispatch(loadProductos()),
        dispatch(loadMovimientosProducto())
      ];
      
      await Promise.all(promises);
      console.log('✅ Datos actualizados después de crear producto');
    } catch (error) {
      console.error('❌ Error al actualizar después de crear producto:', error);
    }
  };

  // Actualización específica después de crear movimiento de insumo
  const updateAfterInsumoMovement = async () => {
    try {
      console.log('🔄 updateAfterInsumoMovement - Iniciando actualización...');
      // Recargar insumos (para actualizar stock) y movimientos
      const promises = [
        dispatch(fetchInsumos()),
        dispatch(loadMovimientosInsumo())
      ];
      
      console.log('🔄 updateAfterInsumoMovement - Ejecutando promesas...');
      await Promise.all(promises);
      console.log('✅ updateAfterInsumoMovement - Datos actualizados correctamente');
    } catch (error) {
      console.error('❌ updateAfterInsumoMovement - Error al actualizar:', error);
    }
  };

  // Actualización específica después de crear movimiento de producto
  const updateAfterProductoMovement = async () => {
    try {
      // Recargar productos (para actualizar stock) y movimientos
      const promises = [
        dispatch(loadProductos()),
        dispatch(loadMovimientosProducto())
      ];
      
      await Promise.all(promises);
      console.log('✅ Datos actualizados después de movimiento de producto');
    } catch (error) {
      console.error('❌ Error al actualizar después de movimiento de producto:', error);
    }
  };

  // Actualización después de eliminar cualquier elemento
  const updateAfterDeletion = async (type) => {
    try {
      switch (type) {
        case 'insumo':
          await updateAfterInsumoCreation();
          break;
        case 'producto':
          await updateAfterProductoCreation();
          break;
        case 'movimientoInsumo':
          await updateAfterInsumoMovement();
          break;
        case 'movimientoProducto':
          await updateAfterProductoMovement();
          break;
        default:
          await updateAllData();
      }
    } catch (error) {
      console.error('❌ Error al actualizar después de eliminación:', error);
    }
  };

  return {
    updateAllData,
    updateAfterInsumoCreation,
    updateAfterProductoCreation,
    updateAfterInsumoMovement,
    updateAfterProductoMovement,
    updateAfterDeletion
  };
}; 