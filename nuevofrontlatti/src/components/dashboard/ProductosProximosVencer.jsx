import React, { useState, useMemo } from 'react';
import { AlertTriangle, Clock, Package, DollarSign, ArrowUpDown, Trash2, ShoppingCart } from 'lucide-react';
import { formatPrice, formatNumber, getTodayLocalString, formatDateToDisplay } from '../../utils/formatters';
import { useDispatch } from 'react-redux';
import { createVentaPorLotes } from '../../store/actions/movimientoProductoActions';
import { useGlobalUpdate } from '../../hooks/useGlobalUpdate';
import DeleteConfirmationModal from '../ui/DeleteConfirmationModal';
import SuccessToast from '../ui/SuccessToast';

const ProductosProximosVencer = ({ productos, onCrearVenta, onRecargarDatos }) => {
  const dispatch = useDispatch();
  const { updateAfterProductoMovement } = useGlobalUpdate();
  const [ordenamiento, setOrdenamiento] = useState('urgencia');
  const [descartando, setDescartando] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productoADescartar, setProductoADescartar] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [deleteError, setDeleteError] = useState('');
  
  // Opciones de ordenamiento
  const opcionesOrdenamiento = [
    { value: 'urgencia', label: '🔴 Por Urgencia (más urgentes primero)' },
    { value: 'antiguos', label: '📅 Más Antiguos Primero' },
    { value: 'nuevos', label: '📅 Más Nuevos Primero' },
    { value: 'producto', label: '📦 Por Producto (A-Z)' },
    { value: 'cantidad', label: '📊 Por Cantidad (mayor primero)' }
  ];

  // Función para mostrar toast
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  // Función de ordenamiento
  const productosOrdenados = useMemo(() => {
    if (!productos || productos.length === 0) return [];
    
    const productosCopy = [...productos];
    
    switch (ordenamiento) {
      case 'urgencia':
        // Ordenar por días hasta vencimiento (menos días = más urgente)
        return productosCopy.sort((a, b) => {
          // Los vencidos primero (días negativos)
          if (a.diasHastaVencimiento < 0 && b.diasHastaVencimiento >= 0) return -1;
          if (a.diasHastaVencimiento >= 0 && b.diasHastaVencimiento < 0) return 1;
          // Luego por días hasta vencimiento (menos días primero)
          return a.diasHastaVencimiento - b.diasHastaVencimiento;
        });
      
      case 'antiguos':
        // Ordenar por fecha de vencimiento (más antiguos primero)
        return productosCopy.sort((a, b) => 
          new Date(a.fechaVencimiento) - new Date(b.fechaVencimiento)
        );
      
      case 'nuevos':
        // Ordenar por fecha de vencimiento (más nuevos primero)
        return productosCopy.sort((a, b) => 
          new Date(b.fechaVencimiento) - new Date(a.fechaVencimiento)
        );
      
      case 'producto':
        // Ordenar alfabéticamente por nombre de producto
        return productosCopy.sort((a, b) => 
          a.nombreProducto.localeCompare(b.nombreProducto, 'es', { sensitivity: 'base' })
        );
      
      case 'cantidad':
        // Ordenar por cantidad (mayor primero)
        return productosCopy.sort((a, b) => b.cantidadDisponible - a.cantidadDisponible);
      
      default:
        return productosCopy;
    }
  }, [productos, ordenamiento]);

  // Separar productos vencidos de los próximos a vencer
  const productosVencidos = productosOrdenados.filter(p => p.diasHastaVencimiento < 0);
  const productosProximos = productosOrdenados.filter(p => p.diasHastaVencimiento >= 0);

  // Agrupar productos próximos por nivel de urgencia
  const criticos = productosProximos.filter(p => p.diasHastaVencimiento <= 2);
  const advertencia = productosProximos.filter(p => p.diasHastaVencimiento > 2 && p.diasHastaVencimiento <= 5);
  const informativo = productosProximos.filter(p => p.diasHastaVencimiento > 5);

  // Función para abrir modal de confirmación de descarte
  const handleDescartar = (producto) => {
    setProductoADescartar(producto);
    setShowDeleteModal(true);
    setDeleteError('');
  };

  // Función para confirmar descarte
  const handleConfirmarDescarte = async () => {
    if (!productoADescartar) return;
    
    setDescartando(productoADescartar.productoId);
    setDeleteError('');
    
    try {
      // Crear venta por lotes con precio $0 para el lote específico
      const ventaData = {
        fecha: getTodayLocalString(),
        descripcion: `DESCARTO - Producto vencido (${productoADescartar.nombreProducto}, Lote: ${productoADescartar.lote})`,
        ventasPorLotes: [{
          productoId: productoADescartar.productoId,
          lote: productoADescartar.lote,
          cantidad: productoADescartar.cantidadDisponible,
          precioVenta: 0 // Precio $0 para descartes
        }]
      };
      
      await dispatch(createVentaPorLotes(ventaData)).unwrap();
      
      // Guardar información antes de limpiar
      const valorPerdido = productoADescartar.valorInversion;
      
      // Actualizar datos globalmente
      await updateAfterProductoMovement();
      
      // Recargar datos de vencimientos y pérdidas
      if (onRecargarDatos) {
        await onRecargarDatos();
      }
      
      // Cerrar modal y mostrar mensaje de éxito
      setShowDeleteModal(false);
      setProductoADescartar(null);
      setDescartando(null);
      showToast(`Producto descartado correctamente. Pérdida registrada: ${formatPrice(valorPerdido)}`, 'success');
    } catch (error) {
      console.error('Error al descartar producto:', error);
      const errorMsg = typeof error === 'string' ? error : error?.response?.data?.error || error?.message || 'Error desconocido al descartar el producto';
      setDeleteError(errorMsg);
      setDescartando(null);
    }
  };

  if (!productos || productos.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-800 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Productos Próximos a Vencer
          </h2>
        </div>
        <div className="p-6 text-center text-gray-500">
          <Package className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-sm font-medium">No hay productos próximos a vencer</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-medium text-gray-800 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Productos Próximos a Vencer
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {productos.length} lote{productos.length !== 1 ? 's' : ''} con vencimiento próximo
              {productosVencidos.length > 0 && (
                <span className="ml-2 text-red-600 font-medium">
                  ({productosVencidos.length} vencido{productosVencidos.length !== 1 ? 's' : ''})
                </span>
              )}
            </p>
          </div>
          
          {/* Selector de ordenamiento */}
          <div className="flex items-center gap-2">
            <ArrowUpDown className="h-4 w-4 text-gray-500" />
            <select
              value={ordenamiento}
              onChange={(e) => setOrdenamiento(e.target.value)}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            >
              {opcionesOrdenamiento.map(opcion => (
                <option key={opcion.value} value={opcion.value}>
                  {opcion.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      <div className="p-6">
        <div className="space-y-6">
          {/* PRODUCTOS VENCIDOS - Siempre al principio si hay */}
          {productosVencidos.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <span className="w-2 h-2 bg-gray-500 rounded-full"></span>
                ⚠️ Productos Vencidos ({productosVencidos.length})
              </h3>
              <div className="space-y-2">
                {productosVencidos.map((producto, idx) => (
                  <ProductoVencimientoCard 
                    key={`vencido-${idx}`}
                    producto={producto} 
                    onCrearVenta={onCrearVenta}
                    onDescartar={handleDescartar}
                    esVencido={true}
                  />
                ))}
              </div>
            </div>
          )}
          
          {/* PRODUCTOS PRÓXIMOS A VENCER */}
          {ordenamiento === 'urgencia' ? (
            // Mostrar agrupados por urgencia solo si el ordenamiento es por urgencia
            <>
              {/* Críticos */}
              {criticos.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-red-700 mb-2 flex items-center gap-2">
                    <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                    Urgente - Vencen en 1-2 días ({criticos.length})
                  </h3>
                  <div className="space-y-2">
                    {criticos.map((producto, idx) => (
                      <ProductoVencimientoCard 
                        key={`critico-${idx}`}
                        producto={producto} 
                        onCrearVenta={onCrearVenta}
                        onDescartar={handleDescartar}
                      />
                    ))}
                  </div>
                </div>
              )}
              
              {/* Advertencia */}
              {advertencia.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-yellow-700 mb-2 flex items-center gap-2">
                    <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                    Advertencia - Vencen en 3-5 días ({advertencia.length})
                  </h3>
                  <div className="space-y-2">
                    {advertencia.map((producto, idx) => (
                      <ProductoVencimientoCard 
                        key={`advertencia-${idx}`}
                        producto={producto} 
                        onCrearVenta={onCrearVenta}
                        onDescartar={handleDescartar}
                      />
                    ))}
                  </div>
                </div>
              )}
              
              {/* Informativo */}
              {informativo.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-green-700 mb-2 flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    Informativo - Vencen en 6-7 días ({informativo.length})
                  </h3>
                  <div className="space-y-2">
                    {informativo.map((producto, idx) => (
                      <ProductoVencimientoCard 
                        key={`informativo-${idx}`}
                        producto={producto} 
                        onCrearVenta={onCrearVenta}
                        onDescartar={handleDescartar}
                      />
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            // Mostrar todos juntos si el ordenamiento no es por urgencia
            <div className="space-y-2">
              {productosProximos.map((producto, idx) => (
                <ProductoVencimientoCard 
                  key={`proximo-${idx}`}
                  producto={producto} 
                  onCrearVenta={onCrearVenta}
                  onDescartar={handleDescartar}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal de confirmación de descarte */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setProductoADescartar(null);
          setDeleteError('');
        }}
        onConfirm={handleConfirmarDescarte}
        title="Descartar Producto Vencido"
        message={
          productoADescartar
            ? `¿Estás seguro de descartar ${formatNumber(productoADescartar.cantidadDisponible)} unidades del producto "${productoADescartar.nombreProducto}" (Lote: ${productoADescartar.lote})?

Este producto venció hace ${Math.abs(productoADescartar.diasHastaVencimiento)} día(s).
Valor de pérdida: ${formatPrice(productoADescartar.valorInversion)}

⚠️ Esta acción no se puede deshacer.`
            : ''
        }
        confirmText="Descartar"
        cancelText="Cancelar"
        loading={descartando !== null}
        error={!!deleteError}
        errorMessage={deleteError}
        variant="danger"
      />

      {/* Toast de notificaciones */}
      <SuccessToast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ show: false, message: '', type: 'success' })}
      />
    </div>
  );
};

const ProductoVencimientoCard = ({ producto, onCrearVenta, onDescartar, esVencido = false }) => {
  const getColorBadge = (dias) => {
    if (dias < 0) return 'bg-gray-100 text-gray-700 border-gray-300';
    if (dias <= 2) return 'bg-red-100 text-red-700 border-red-300';
    if (dias <= 5) return 'bg-yellow-100 text-yellow-700 border-yellow-300';
    return 'bg-green-100 text-green-700 border-green-300';
  };

  const getTextoBadge = (dias) => {
    if (dias < 0) return `Vencido hace ${Math.abs(dias)} día${Math.abs(dias) !== 1 ? 's' : ''}`;
    return `${dias} día${dias !== 1 ? 's' : ''} restante${dias !== 1 ? 's' : ''}`;
  };

  return (
    <div className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${
      esVencido 
        ? 'bg-red-50 border-red-200 hover:bg-red-100' 
        : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
    }`}>
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-2">
          <h4 className="text-sm font-medium text-gray-900">{producto.nombreProducto}</h4>
          <span className={`px-2 py-0.5 text-xs rounded-full border ${getColorBadge(producto.diasHastaVencimiento)}`}>
            {getTextoBadge(producto.diasHastaVencimiento)}
          </span>
        </div>
        <div className="flex items-center gap-4 text-xs text-gray-600">
          <span className="flex items-center gap-1">
            <Package className="h-3 w-3" />
            Lote: {producto.lote}
          </span>
          <span className="flex items-center gap-1">
            <Package className="h-3 w-3" />
            Cantidad: {formatNumber(producto.cantidadDisponible)}
          </span>
          <span className="flex items-center gap-1">
            <DollarSign className="h-3 w-3" />
            Valor: {formatPrice(producto.valorInversion)}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Vence: {formatDateToDisplay(producto.fechaVencimiento)}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2 ml-4">
        {esVencido && (
          <button
            onClick={() => onDescartar && onDescartar(producto)}
            className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
            title="Descartar producto vencido"
          >
            <Trash2 className="h-4 w-4" />
            Descartar
          </button>
        )}
        <button
          onClick={() => onCrearVenta && onCrearVenta(producto.productoId, producto.lote)}
          className={`px-4 py-2 text-sm rounded-lg transition-colors flex items-center gap-2 ${
            esVencido
              ? 'bg-orange-600 text-white hover:bg-orange-700'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          <ShoppingCart className="h-4 w-4" />
          {esVencido ? 'Intentar Vender' : 'Crear Venta'}
        </button>
      </div>
    </div>
  );
};

export default ProductosProximosVencer;

