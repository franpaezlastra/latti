import React, { useState } from "react";
import { FaBox, FaCog, FaChartLine, FaSearch, FaFilter } from "react-icons/fa";
import { formatQuantity, formatPrice } from "../../../utils/formatters";
import { getAbreviaturaByValue } from "../../../constants/unidadesMedida";
import Input from "../../../components/ui/Input";
import Button from "../../../components/ui/Button";

const StockSummary = ({ insumos = [], productos = [] }) => {
  const [filtros, setFiltros] = useState({
    busqueda: "",
    tipo: "todos", // todos, insumos, productos
    stockBajo: false
  });

  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  // Filtrar datos
  const insumosFiltrados = insumos.filter(insumo => {
    const cumpleBusqueda = !filtros.busqueda || 
      insumo.nombre?.toLowerCase().includes(filtros.busqueda.toLowerCase());
    
    const cumpleTipo = filtros.tipo === "todos" || filtros.tipo === "insumos";
    
    const cumpleStockBajo = !filtros.stockBajo || insumo.stockActual <= 10; // Considerar stock bajo si es <= 10
    
    return cumpleBusqueda && cumpleTipo && cumpleStockBajo;
  });

  const productosFiltrados = productos.filter(producto => {
    const cumpleBusqueda = !filtros.busqueda || 
      producto.nombre?.toLowerCase().includes(filtros.busqueda.toLowerCase());
    
    const cumpleTipo = filtros.tipo === "todos" || filtros.tipo === "productos";
    
    const cumpleStockBajo = !filtros.stockBajo || producto.stockActual <= 5; // Considerar stock bajo si es <= 5
    
    return cumpleBusqueda && cumpleTipo && cumpleStockBajo;
  });

  // Calcular totales
  const totalInsumos = insumosFiltrados.length;
  const totalProductos = productosFiltrados.length;
  const totalValorInsumos = insumosFiltrados.reduce((sum, insumo) => 
    sum + (insumo.stockActual * insumo.precioDeCompra), 0);
  const totalValorProductos = productosFiltrados.reduce((sum, producto) => 
    sum + (producto.stockActual * producto.precioInversion), 0);

  const limpiarFiltros = () => {
    setFiltros({
      busqueda: "",
      tipo: "todos",
      stockBajo: false
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Resumen de Stock</h2>
          <p className="text-gray-600">Vista general del inventario actual</p>
        </div>
        
        <Button
          onClick={() => setMostrarFiltros(!mostrarFiltros)}
          variant="outline"
          className="flex items-center gap-2"
        >
          <FaFilter size={14} />
          Filtros
        </Button>
      </div>

      {/* Filtros */}
      {mostrarFiltros && (
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Buscar
              </label>
              <div className="relative">
                <FaSearch className="absolute left-3 top-2.5 text-gray-400" size={14} />
                <Input
                  type="text"
                  value={filtros.busqueda}
                  onChange={(e) => setFiltros(prev => ({ ...prev, busqueda: e.target.value }))}
                  placeholder="Buscar por nombre..."
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo
              </label>
              <select
                value={filtros.tipo}
                onChange={(e) => setFiltros(prev => ({ ...prev, tipo: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="todos">Todos</option>
                <option value="insumos">Solo Insumos</option>
                <option value="productos">Solo Productos</option>
              </select>
            </div>

            <div className="flex items-end">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={filtros.stockBajo}
                  onChange={(e) => setFiltros(prev => ({ ...prev, stockBajo: e.target.checked }))}
                  className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Solo stock bajo</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end mt-4">
            <Button
              onClick={limpiarFiltros}
              variant="outline"
            >
              Limpiar
            </Button>
          </div>
        </div>
      )}

      {/* Tarjetas de resumen */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FaBox className="text-blue-600" size={20} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Insumos</p>
              <p className="text-2xl font-bold text-gray-900">{totalInsumos}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <FaCog className="text-green-600" size={20} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Productos</p>
              <p className="text-2xl font-bold text-gray-900">{totalProductos}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <FaChartLine className="text-yellow-600" size={20} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Valor Insumos</p>
              <p className="text-2xl font-bold text-gray-900">{formatPrice(totalValorInsumos)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <FaChartLine className="text-purple-600" size={20} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Valor Productos</p>
              <p className="text-2xl font-bold text-gray-900">{formatPrice(totalValorProductos)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla de insumos */}
      {(filtros.tipo === "todos" || filtros.tipo === "insumos") && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <FaBox className="text-blue-600" size={16} />
              Insumos ({totalInsumos})
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nombre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Precio Unit.
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valor Total
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {insumosFiltrados.map((insumo) => (
                  <tr key={insumo.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{insumo.nombre}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        insumo.tipo === 'COMPUESTO' 
                          ? 'bg-purple-100 text-purple-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {insumo.tipo === 'COMPUESTO' ? 'Compuesto' : 'Base'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatQuantity(insumo.stockActual, getAbreviaturaByValue(insumo.unidadMedida))}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatPrice(insumo.precioDeCompra)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatPrice(insumo.stockActual * insumo.precioDeCompra)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tabla de productos */}
      {(filtros.tipo === "todos" || filtros.tipo === "productos") && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <FaCog className="text-green-600" size={16} />
              Productos ({totalProductos})
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nombre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Precio Inversión
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Precio Venta
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valor Total
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {productosFiltrados.map((producto) => (
                  <tr key={producto.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{producto.nombre}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatQuantity(producto.stockActual, 'unidades')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatPrice(producto.precioInversion)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatPrice(producto.precioVenta)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatPrice(producto.stockActual * producto.precioInversion)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Información adicional */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-2">
          <FaChartLine className="text-blue-600 mt-0.5" size={16} />
          <div className="text-sm text-blue-700">
            <p className="font-medium mb-1">💡 Información del Resumen de Stock</p>
            <ul className="space-y-1 text-xs">
              <li><strong>📊 Valores:</strong> Calculados como stock actual × precio unitario</li>
              <li><strong>🔍 Filtros:</strong> Puedes buscar por nombre y filtrar por tipo</li>
              <li><strong>⚠️ Stock Bajo:</strong> Insumos ≤ 10 unidades, Productos ≤ 5 unidades</li>
              <li><strong>🔄 Actualización:</strong> Los valores se actualizan automáticamente con cada movimiento</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockSummary;
