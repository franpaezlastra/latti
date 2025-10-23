import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Package, 
  Box, 
  TrendingUp, 
  AlertTriangle,
  DollarSign,
  ShoppingCart,
  BarChart3
} from 'lucide-react';
import { loadProductos } from '../../store/actions/productosActions.js';
import { fetchInsumos } from '../../store/slices/insumoSlice.js';
import { loadMovimientosProducto } from '../../store/actions/movimientoProductoActions.js';
import { loadMovimientosInsumo } from '../../store/actions/movimientoInsumoActions.js';
import { Tabla } from 'src/components/ui';
import { formatPrice, formatNumber } from '../../utils/formatters.js';
import { getAbreviaturaByValue } from '../../constants/unidadesMedida.js';

const Dashboard = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [seccionActiva, setSeccionActiva] = useState('lotes'); // 'lotes', 'ventas', 'insumos'
  const [paginaActual, setPaginaActual] = useState(1);
  const lotesPorPagina = 10;
  
  // ✅ USAR LAS MISMAS ACCIONES QUE PRODUCTOSPAGE
  const { productos, status: productosStatus } = useSelector((state) => state.productos);
  const { insumos, status: insumosStatus } = useSelector((state) => state.insumos);
  const { movimientos: movimientosProductos, loading: movimientosProductosLoading } = useSelector((state) => state.movimientosProducto);
  const { movimientos: movimientosInsumos, loading: movimientosInsumosLoading } = useSelector((state) => state.movimientosInsumo);

  useEffect(() => {
    const loadData = async () => {
      try {
        // ✅ USAR LAS MISMAS ACCIONES PARA SINCRONIZACIÓN
        await Promise.all([
          dispatch(loadProductos()),           // Misma acción que ProductosPage
          dispatch(fetchInsumos()),            // Misma acción que ProductosPage
          dispatch(loadMovimientosProducto()), // Misma acción que ProductosPage
          dispatch(loadMovimientosInsumo())    // Misma acción que ProductosPage
        ]);
        setLoading(false);
      } catch (error) {
        console.error('Error cargando datos:', error);
        setLoading(false);
      }
    };
    loadData();
  }, [dispatch]);

  // Valores por defecto para evitar errores
  const productosList = productos || [];
  const insumosList = insumos || [];
  const movimientosProductosList = movimientosProductos || [];
  const movimientosInsumosList = movimientosInsumos || [];

  // Resetear página cuando cambien los movimientos
  useEffect(() => {
    setPaginaActual(1);
  }, [movimientosProductosList]);

  // Calcular estadísticas de ventas
  const calcularEstadisticasVentas = () => {
    const ventas = movimientosProductosList.filter(mov => mov.tipoMovimiento === 'SALIDA');
    const totalVentas = ventas.length;
    const ingresosTotales = ventas.reduce((total, venta) => {
      // Calcular el total de ventas sumando los detalles
      const totalVenta = venta.detalles?.reduce((sum, det) => {
        return sum + ((det.precioVenta || 0) * (det.cantidad || 0));
      }, 0) || 0;
      return total + totalVenta;
    }, 0);
    
    return { totalVentas, ingresosTotales };
  };

  // Calcular estadísticas generales
  const calcularEstadisticas = () => {
    // Usar el totalInvertido calculado en el backend
    const dineroInvertidoInsumos = insumosList.reduce((total, insumo) => {
      return total + (insumo.totalInvertido || 0);
    }, 0);

    const totalProductos = productosList.length;
    const totalInsumos = insumosList.length;
    const stockBajo = insumosList.filter(insumo => (insumo.stockActual || 0) < 10).length;
    const { totalVentas, ingresosTotales } = calcularEstadisticasVentas();

    return {
      dineroInvertidoInsumos,
      totalProductos,
      totalInsumos,
      stockBajo,
      totalVentas,
      ingresosTotales
    };
  };

  // Obtener lotes con stock actual
  const obtenerLotes = () => {
    const lotes = [];
    
    console.log("🔍 Debug: Productos disponibles:", productosList);
    console.log("🔍 Debug: Movimientos de productos:", movimientosProductosList);
    
    // Log detallado de la estructura de datos
    productosList.forEach(producto => {
      console.log(`🔍 Debug: Producto ${producto.nombre} - ID: ${producto.id} - Tipo: ${typeof producto.id}`);
    });
    
    movimientosProductosList.forEach(movimiento => {
      console.log(`🔍 Debug: Movimiento ID: ${movimiento.id} - Tipo: ${movimiento.tipoMovimiento}`);
      console.log(`🔍 Debug: Detalles del movimiento:`, movimiento.detalles);
      if (movimiento.detalles && movimiento.detalles.length > 0) {
        movimiento.detalles.forEach(detalle => {
          console.log(`🔍 Debug: Detalle - Producto ID: ${detalle.id} - Tipo: ${typeof detalle.id} - Lote: ${detalle.lote}`);
        });
      }
    });
    
    productosList.forEach(producto => {
      const movimientosProducto = movimientosProductosList.filter(m => {
        console.log(`🔍 Debug: Comparando movimiento ${m.id} con producto ${producto.id}`);
        console.log(`🔍 Debug: Movimiento tiene detalles:`, m.detalles);
        
        // Buscar si algún detalle del movimiento corresponde al producto
        const tieneProducto = m.detalles?.some(det => {
          console.log(`🔍 Debug: Comparando detalle ID ${det.id} con producto ID ${producto.id}`);
          return det.id === producto.id;
        });
        
        console.log(`🔍 Debug: Movimiento ${m.id} tiene producto ${producto.nombre}:`, tieneProducto);
        return tieneProducto;
      });
      
      console.log(`🔍 Debug: Movimientos para producto ${producto.nombre}:`, movimientosProducto);
      
      // Agrupar por lotes
      const lotesProducto = movimientosProducto.reduce((acc, movimiento) => {
        console.log(`🔍 Debug: Procesando movimiento ${movimiento.id}, tipo: ${movimiento.tipoMovimiento}`);
        console.log(`🔍 Debug: Detalles del movimiento:`, movimiento.detalles);
        
        if (movimiento.tipoMovimiento === 'ENTRADA') {
          // Buscar el detalle del movimiento que tenga lote
          const detalleConLote = movimiento.detalles?.find(det => det.lote);
          console.log(`🔍 Debug: Detalle con lote encontrado:`, detalleConLote);
          
          if (detalleConLote) {
            const lote = acc.find(l => l.numeroLote === detalleConLote.lote);
            if (lote) {
              lote.cantidadInicial += detalleConLote.cantidad || 0;
              lote.cantidadActual += detalleConLote.cantidad || 0;
              lote.precioInversion += (producto.precioInversion || 0) * (detalleConLote.cantidad || 0);
            } else {
              acc.push({
                numeroLote: detalleConLote.lote,
                producto: producto.nombre,
                cantidadInicial: detalleConLote.cantidad || 0,
                cantidadActual: detalleConLote.cantidad || 0,
                fechaProduccion: movimiento.fecha,
                precioInversion: (producto.precioInversion || 0) * (detalleConLote.cantidad || 0),
                productoId: producto.id,
                fechaVencimiento: detalleConLote.fechaVencimiento
              });
            }
          }
        } else if (movimiento.tipoMovimiento === 'SALIDA') {
          // Buscar el detalle del movimiento que tenga lote
          const detalleConLote = movimiento.detalles?.find(det => det.lote);
          console.log(`🔍 Debug: Detalle con lote para SALIDA:`, detalleConLote);
          
          if (detalleConLote) {
            const lote = acc.find(l => l.numeroLote === detalleConLote.lote);
            if (lote) {
              lote.cantidadActual -= detalleConLote.cantidad || 0;
            }
          }
        }
        return acc;
      }, []);
      
      console.log(`🔍 Debug: Lotes encontrados para ${producto.nombre}:`, lotesProducto);
      lotes.push(...lotesProducto);
    });
    
    const lotesFiltrados = lotes
      .filter(lote => lote.cantidadActual > 0)
      .sort((a, b) => new Date(b.fechaProduccion) - new Date(a.fechaProduccion));
    
    console.log("🔍 Debug: Lotes finales con stock:", lotesFiltrados);
    return lotesFiltrados;
  };

  // Calcular stock por producto
  const calcularStockPorProducto = () => {
    const stockPorProducto = {};
    
    productosList.forEach(producto => {
      const movimientosProducto = movimientosProductosList.filter(m => m.productoId === producto.id);
      let stockActual = 0;
      
      movimientosProducto.forEach(movimiento => {
        if (movimiento.tipoMovimiento === 'ENTRADA') {
          stockActual += movimiento.detalles?.reduce((sum, det) => sum + (det.cantidad || 0), 0) || 0;
        } else if (movimiento.tipoMovimiento === 'SALIDA') {
          stockActual -= movimiento.detalles?.reduce((sum, det) => sum + (det.cantidad || 0), 0) || 0;
        }
      });
      
      stockPorProducto[producto.nombre] = stockActual;
    });
    
    return stockPorProducto;
  };

  const lotes = obtenerLotes();
  const stockPorProducto = calcularStockPorProducto();
  const totalLotes = lotes.length;
  const totalPaginas = Math.ceil(totalLotes / lotesPorPagina);
  const lotesPaginados = lotes.slice(
    (paginaActual - 1) * lotesPorPagina,
    paginaActual * lotesPorPagina
  );

  const stats = calcularEstadisticas();

  const isLoading = productosStatus === 'loading' || insumosStatus === 'loading' || movimientosProductosLoading || movimientosInsumosLoading || loading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  // Componente para la tabla de lotes
  const TablaLotes = () => {
    const columnas = ["Lote", "Producto", "Cantidad Inicial", "Stock Actual", "Fecha de Producción", "Precio de Inversión", "Estado"];

  return (
      <div>
        <Tabla
          columnas={columnas}
          datos={lotesPaginados}
          renderFila={(lote) => {
            const porcentajeStock = (lote.cantidadActual / lote.cantidadInicial) * 100;
            const estadoStock = porcentajeStock > 50 ? 'Alto' : porcentajeStock > 20 ? 'Medio' : 'Bajo';
            
            return (
              <>
                <td className="px-4 py-2">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                    {lote.numeroLote}
                  </span>
                </td>
                <td className="px-4 py-2 font-medium">{lote.producto}</td>
                <td className="px-4 py-2 text-gray-600">{formatNumber(lote.cantidadInicial)}</td>
                <td className="px-4 py-2 font-semibold">{formatNumber(lote.cantidadActual)}</td>
                <td className="px-4 py-2">
                  {new Date(lote.fechaProduccion).toLocaleDateString()}
                </td>
                <td className="px-4 py-2">
                  {formatPrice(lote.precioInversion || 0)}
                </td>
                <td className="px-4 py-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    estadoStock === 'Alto' ? 'bg-green-100 text-green-700' :
                    estadoStock === 'Medio' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {estadoStock} ({porcentajeStock.toFixed(0)}%)
                  </span>
                </td>
              </>
            );
          }}
          mensajeVacio="No hay lotes con stock disponible"
        />
        
        {/* Paginador */}
        {totalPaginas > 1 && (
          <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200">
            <div className="flex items-center text-sm text-gray-700">
              <span>
                Mostrando {((paginaActual - 1) * lotesPorPagina) + 1} a {Math.min(paginaActual * lotesPorPagina, totalLotes)} de {totalLotes} lotes
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setPaginaActual(paginaActual - 1)}
                disabled={paginaActual === 1}
                className="px-3 py-1 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Anterior
              </button>
              
              {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((pagina) => (
                <button
                  key={pagina}
                  onClick={() => setPaginaActual(pagina)}
                  className={`px-3 py-1 text-sm font-medium rounded-md ${
                    pagina === paginaActual
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {pagina}
                </button>
              ))}
              
              <button
                onClick={() => setPaginaActual(paginaActual + 1)}
                disabled={paginaActual === totalPaginas}
                className="px-3 py-1 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Componente para la tabla de ventas
  const TablaVentas = () => {
    const ventas = movimientosProductosList
      .filter(mov => mov.tipoMovimiento === 'VENTA')
      .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

    const columnas = ["Fecha", "Producto", "Cantidad", "Precio Unitario", "Total"];

    return (
      <Tabla
        columnas={columnas}
        datos={ventas}
        renderFila={(venta) => (
          <>
            <td className="px-4 py-2">{new Date(venta.fecha).toLocaleDateString()}</td>
            <td className="px-4 py-2">{venta.producto?.nombre || 'N/A'}</td>
            <td className="px-4 py-2">{formatNumber(venta.cantidad || 0)}</td>
            <td className="px-4 py-2">{formatPrice(venta.precioVenta || 0)}</td>
            <td className="px-4 py-2">
              {formatPrice((venta.precioVenta || 0) * (venta.cantidad || 0))}
            </td>
          </>
        )}
        mensajeVacio="No hay ventas registradas"
      />
    );
  };

  // Componente para la tabla de insumos
  const TablaInsumos = () => {
    const columnas = ["Insumo", "Cantidad", "Precio Unitario", "Total Invertido", "Estado"];
    
    const insumosOrdenados = [...insumosList].sort((a, b) => 
      a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' })
    );

    return (
      <Tabla
        columnas={columnas}
        datos={insumosOrdenados}
        renderFila={(insumo) => {
          const stockBajo = (insumo.stockActual || 0) < 10;
          // ✅ CAMBIADO: Usar abreviatura de la unidad de medida
          const unidadAbreviatura = getAbreviaturaByValue(insumo.unidadMedida) || 'unidades';
          
          return (
            <>
              <td className="px-4 py-2">{insumo.nombre}</td>
              <td className="px-4 py-2">
                {formatNumber(insumo.stockActual || 0)} {unidadAbreviatura}
              </td>
              <td className="px-4 py-2">{formatPrice(insumo.precioDeCompra || 0)}</td>
              <td className="px-4 py-2">{formatPrice(insumo.totalInvertido || 0)}</td>
              <td className="px-4 py-2">
                <span className={`px-2 py-1 text-xs rounded-full ${
                  stockBajo ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                }`}>
                  {stockBajo ? 'Stock Bajo' : 'Stock OK'}
                </span>
              </td>
            </>
          );
        }}
        mensajeVacio="No hay insumos registrados"
      />
    );
  };

  return (
    <div className="h-full overflow-y-auto p-6 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-semibold text-gray-800 mb-6">Dashboard</h1>
        
        {/* Barra de resúmenes principal */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <DollarSign className="h-6 w-6 text-blue-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Dinero Invertido</p>
                <p className="text-xl font-bold text-gray-900">
                  {formatPrice(stats.dineroInvertidoInsumos)}
                </p>
              </div>
            </div>
      </div>

          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <div className="flex items-center">
              <ShoppingCart className="h-6 w-6 text-green-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Total Ventas</p>
                <p className="text-xl font-bold text-gray-900">{formatNumber(stats.totalVentas)}</p>
                </div>
              </div>
      </div>

          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                  <div className="flex items-center">
              <DollarSign className="h-6 w-6 text-green-500" />
                    <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Ingresos Totales</p>
                <p className="text-xl font-bold text-gray-900">
                  {formatPrice(stats.ingresosTotales)}
                      </p>
                    </div>
                  </div>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <AlertTriangle className="h-6 w-6 text-red-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Stock Bajo</p>
                <p className="text-xl font-bold text-gray-900">{formatNumber(stats.stockBajo)}</p>
              </div>
            </div>
                  </div>
                </div>

        {/* Navegación de secciones */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setSeccionActiva('lotes')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              seccionActiva === 'lotes'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Box className="inline w-4 h-4 mr-2" />
            Lotes ({formatNumber(totalLotes)})
          </button>
          <button
            onClick={() => setSeccionActiva('ventas')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              seccionActiva === 'ventas'
                ? 'bg-green-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <ShoppingCart className="inline w-4 h-4 mr-2" />
            Ventas ({formatNumber(stats.totalVentas)})
          </button>
          <button
            onClick={() => setSeccionActiva('insumos')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              seccionActiva === 'insumos'
                ? 'bg-orange-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <TrendingUp className="inline w-4 h-4 mr-2" />
            Insumos ({formatNumber(stats.totalInsumos)})
          </button>
        </div>

        {/* Contenido de secciones */}
        {seccionActiva === 'lotes' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-800">Lotes Activos</h2>
              <p className="text-sm text-gray-600 mt-1">
                Total de lotes: {formatNumber(totalLotes)} | Mostrando {formatNumber(lotesPorPagina)} por página
              </p>
              
              {/* Resumen de stock por producto */}
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Stock por Producto:</h3>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(stockPorProducto).map(([producto, stock]) => (
                    <span key={producto} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                      {producto}: {formatNumber(stock)} unidades
                    </span>
              ))}
            </div>
              </div>
            </div>
            <div className="p-4">
              <TablaLotes />
            </div>
          </div>
        )}

        {seccionActiva === 'ventas' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-800">Historial de Ventas</h2>
              <p className="text-sm text-gray-600 mt-1">
                Total de ventas: {formatNumber(stats.totalVentas)} | Ingresos: {formatPrice(stats.ingresosTotales)}
              </p>
            </div>
            <div className="p-4">
              <TablaVentas />
            </div>
          </div>
        )}

        {seccionActiva === 'insumos' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-800">Gestión de Insumos</h2>
              <p className="text-sm text-gray-600 mt-1">
                Total invertido: {formatPrice(stats.dineroInvertidoInsumos)}
              </p>
            </div>
            <div className="p-4">
              <TablaInsumos />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard; 