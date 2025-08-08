import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loadInsumos } from '../store/actions/insumoActions';
import { loadProductos } from '../store/actions/productosActions';

export const useCriticalData = () => {
  const dispatch = useDispatch();
  
  // Estados de los datos críticos
  const insumos = useSelector((state) => state.insumos.insumos);
  const insumosLoading = useSelector((state) => state.insumos.loading);
  const productos = useSelector((state) => state.productos.productos);
  const productosLoading = useSelector((state) => state.productos.loading);

  // Verificar si los datos críticos están cargados
  const isCriticalDataLoaded = () => {
    return insumos && insumos.length > 0 && productos && productos.length > 0;
  };

  // Cargar datos críticos si no están disponibles
  const ensureCriticalData = () => {
    if (!insumos || insumos.length === 0) {
      dispatch(loadInsumos());
    }
    if (!productos || productos.length === 0) {
      dispatch(loadProductos());
    }
  };

  // Hook para cargar datos críticos automáticamente
  useEffect(() => {
    ensureCriticalData();
  }, []);

  return {
    insumos,
    productos,
    insumosLoading,
    productosLoading,
    isCriticalDataLoaded: isCriticalDataLoaded(),
    ensureCriticalData
  };
}; 