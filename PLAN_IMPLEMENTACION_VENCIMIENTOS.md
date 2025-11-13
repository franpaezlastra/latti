# 🎯 PLAN DE IMPLEMENTACIÓN: GESTIÓN DE PRODUCTOS VENCIDOS

**Enfoque:** Alertas visuales, reportes y mejoras UX (SIN descuentos automáticos)  
**Filosofía:** El admin decide el precio manualmente, el sistema solo informa y sugiere

---

## 📋 FUNCIONALIDADES A IMPLEMENTAR

### ✅ **FASE 1: Alertas Visuales y Mejoras UX** (Prioridad: ALTA)

#### 1.1 **Mejorar Selector de Lotes con Alertas Visuales**

**Objetivo:** Mostrar claramente qué lotes están próximos a vencer para que el admin pueda decidir el precio.

**Cambios en Frontend:**
- Agregar badges de alerta en cada lote según días hasta vencimiento
- Ordenar lotes por fecha de vencimiento (FIFO automático)
- Mostrar días restantes de forma prominente
- Colores según urgencia:
  - 🔴 Rojo: Vence en 1-2 días
  - 🟡 Amarillo: Vence en 3-5 días
  - 🟢 Verde: Vence en 6+ días
  - ⚫ Gris: Ya vencido (no debería aparecer, pero por si acaso)

**Archivo a modificar:**
- `nuevofrontlatti/src/components/features/movements/modals/MovimientoProductoModal.jsx`

**Código a agregar:**
```jsx
// Función para calcular días hasta vencimiento
const calcularDiasHastaVencimiento = (fechaVencimiento) => {
  if (!fechaVencimiento) return null;
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const vencimiento = new Date(fechaVencimiento);
  vencimiento.setHours(0, 0, 0, 0);
  const diffTime = vencimiento - hoy;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

// Función para obtener badge de alerta
const getAlertaVencimiento = (dias) => {
  if (dias < 0) return { color: 'bg-gray-100 text-gray-600', texto: 'Vencido', icon: '⚠️' };
  if (dias <= 2) return { color: 'bg-red-100 text-red-700', texto: `Vence en ${dias} día${dias !== 1 ? 's' : ''}`, icon: '🔴' };
  if (dias <= 5) return { color: 'bg-yellow-100 text-yellow-700', texto: `Vence en ${dias} días`, icon: '🟡' };
  return { color: 'bg-green-100 text-green-700', texto: `Vence en ${dias} días`, icon: '🟢' };
};
```

**Mejora en la visualización de lotes:**
```jsx
{getLotesDisponibles(producto.productoId)
  .sort((a, b) => {
    // Ordenar por fecha de vencimiento (más antiguos primero - FIFO)
    if (!a.fechaVencimiento) return 1;
    if (!b.fechaVencimiento) return -1;
    return new Date(a.fechaVencimiento) - new Date(b.fechaVencimiento);
  })
  .map((lote) => {
    const dias = calcularDiasHastaVencimiento(lote.fechaVencimiento);
    const alerta = dias !== null ? getAlertaVencimiento(dias) : null;
    
    return (
      <div key={lote.lote} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <div className="text-sm font-medium text-gray-700">
              Lote: {lote.lote}
            </div>
            {alerta && (
              <span className={`px-2 py-0.5 text-xs rounded-full ${alerta.color}`}>
                {alerta.icon} {alerta.texto}
              </span>
            )}
          </div>
          <div className="text-xs text-gray-500">
            Disponible: {lote.cantidadDisponible}
            {lote.fechaVencimiento && (
              <span className="ml-2">
                | Vence: {new Date(lote.fechaVencimiento).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
        {/* ... resto del código ... */}
      </div>
    );
  })}
```

---

#### 1.2 **Dashboard de Productos Próximos a Vencer**

**Objetivo:** Sección en el Dashboard principal que muestra productos que vencen pronto.

**Nuevo componente:**
- `nuevofrontlatti/src/components/dashboard/ProductosProximosVencer.jsx`

**Funcionalidad:**
- Lista de productos con lotes que vencen en los próximos 7 días
- Agrupado por producto
- Muestra: producto, lote, cantidad, días hasta vencimiento, valor de inversión
- Colores según urgencia
- Link directo a crear venta de ese producto

**Datos necesarios:**
- Obtener todos los lotes con stock > 0
- Filtrar por fechaVencimiento <= hoy + 7 días
- Ordenar por fecha de vencimiento

---

### ✅ **FASE 2: Backend - Endpoints de Reportes** (Prioridad: ALTA)

#### 2.1 **Endpoint: Productos Próximos a Vencer**

**Archivo:** `stock/src/main/java/com/Latti/stock/controllers/ProductoController.java`

**Nuevo método:**
```java
@GetMapping("/productos/proximos-vencer")
public ResponseEntity<List<ProductoProximoVencerDTO>> obtenerProductosProximosAVencer(
    @RequestParam(defaultValue = "7") int diasAnticipacion
) {
    LocalDate fechaLimite = LocalDate.now().plusDays(diasAnticipacion);
    
    // Obtener todos los productos
    List<Producto> productos = productoRepository.findAll();
    
    List<ProductoProximoVencerDTO> resultado = new ArrayList<>();
    
    for (Producto producto : productos) {
        // Obtener stock por lotes
        List<StockPorLoteDTO> lotes = movimientoProductoLoteService.obtenerStockPorLotes(producto.getId());
        
        for (StockPorLoteDTO lote : lotes) {
            if (lote.fechaVencimiento() != null && 
                !lote.fechaVencimiento().isAfter(fechaLimite) &&
                lote.cantidadDisponible() > 0) {
                
                long diasHastaVencimiento = ChronoUnit.DAYS.between(LocalDate.now(), lote.fechaVencimiento());
                
                resultado.add(new ProductoProximoVencerDTO(
                    producto.getId(),
                    producto.getNombre(),
                    lote.lote(),
                    lote.cantidadDisponible(),
                    lote.fechaVencimiento(),
                    (int) diasHastaVencimiento,
                    producto.getPrecioInversion() * lote.cantidadDisponible()
                ));
            }
        }
    }
    
    // Ordenar por fecha de vencimiento (más urgentes primero)
    resultado.sort(Comparator.comparing(ProductoProximoVencerDTO::fechaVencimiento));
    
    return ResponseEntity.ok(resultado);
}
```

**Nuevo DTO:**
```java
// stock/src/main/java/com/Latti/stock/dtos/ProductoProximoVencerDTO.java
public record ProductoProximoVencerDTO(
    Long productoId,
    String nombreProducto,
    String lote,
    double cantidadDisponible,
    LocalDate fechaVencimiento,
    int diasHastaVencimiento,
    double valorInversion
) {}
```

---

#### 2.2 **Endpoint: Productos Vencidos**

**Archivo:** `stock/src/main/java/com/Latti/stock/controllers/ProductoController.java`

**Nuevo método:**
```java
@GetMapping("/productos/vencidos")
public ResponseEntity<List<ProductoVencidoDTO>> obtenerProductosVencidos() {
    LocalDate hoy = LocalDate.now();
    
    List<Producto> productos = productoRepository.findAll();
    List<ProductoVencidoDTO> resultado = new ArrayList<>();
    
    for (Producto producto : productos) {
        List<StockPorLoteDTO> lotes = movimientoProductoLoteService.obtenerStockPorLotes(producto.getId());
        
        for (StockPorLoteDTO lote : lotes) {
            if (lote.fechaVencimiento() != null && 
                lote.fechaVencimiento().isBefore(hoy) &&
                lote.cantidadDisponible() > 0) {
                
                long diasVencidos = ChronoUnit.DAYS.between(lote.fechaVencimiento(), hoy);
                
                resultado.add(new ProductoVencidoDTO(
                    producto.getId(),
                    producto.getNombre(),
                    lote.lote(),
                    lote.cantidadDisponible(),
                    lote.fechaVencimiento(),
                    (int) diasVencidos,
                    producto.getPrecioInversion() * lote.cantidadDisponible()
                ));
            }
        }
    }
    
    // Ordenar por días vencidos (más vencidos primero)
    resultado.sort(Comparator.comparing(ProductoVencidoDTO::diasVencidos).reversed());
    
    return ResponseEntity.ok(resultado);
}
```

**Nuevo DTO:**
```java
// stock/src/main/java/com/Latti/stock/dtos/ProductoVencidoDTO.java
public record ProductoVencidoDTO(
    Long productoId,
    String nombreProducto,
    String lote,
    double cantidadDisponible,
    LocalDate fechaVencimiento,
    int diasVencidos,
    double valorPerdido
) {}
```

---

### ✅ **FASE 3: Proceso de Descarte** (Prioridad: MEDIA)

#### 3.1 **Usar SALIDA con Precio $0 para Descartos**

**Enfoque:** No crear nuevo tipo de movimiento, usar SALIDA existente con:
- Precio de venta: $0
- Descripción: "DESCARTO - [Motivo]" (ej: "DESCARTO - Producto vencido")

**Mejora opcional:** Agregar campo "Motivo" en el formulario de salida (opcional):
- Dropdown: "Venta normal", "Descarto - Vencido", "Descarto - Dañado", "Descarto - Otro"

**Beneficios:**
- No requiere cambios en backend
- Trazabilidad completa
- Reportes fáciles (filtrar por precio = 0 o descripción contiene "DESCARTO")

---

### ✅ **FASE 4: Integración en Dashboard** (Prioridad: ALTA)

#### 4.1 **Agregar Sección de Alertas de Vencimiento**

**Archivo:** `nuevofrontlatti/src/pages/Dashboard/Dashboard.jsx`

**Nuevo componente:**
```jsx
import ProductosProximosVencer from '../../components/dashboard/ProductosProximosVencer';

// En el render:
{productosProximosVencer.length > 0 && (
  <div className="mb-6">
    <ProductosProximosVencer 
      productos={productosProximosVencer}
      onCrearVenta={(productoId) => {
        // Abrir modal de venta con ese producto pre-seleccionado
      }}
    />
  </div>
)}
```

---

## 🎨 DISEÑO DE COMPONENTES

### **Componente: ProductosProximosVencer.jsx**

```jsx
import React, { useState, useMemo } from 'react';
import { AlertTriangle, Clock, Package, DollarSign, ArrowUpDown, Trash2 } from 'lucide-react';
import { formatPrice, formatNumber } from '../../utils/formatters';

const ProductosProximosVencer = ({ productos, onCrearVenta, onDescartar }) => {
  const [ordenamiento, setOrdenamiento] = useState('urgencia'); // 'urgencia', 'antiguos', 'nuevos', 'producto', 'cantidad'
  
  // Opciones de ordenamiento
  const opcionesOrdenamiento = [
    { value: 'urgencia', label: '🔴 Por Urgencia (más urgentes primero)' },
    { value: 'antiguos', label: '📅 Más Antiguos Primero' },
    { value: 'nuevos', label: '📅 Más Nuevos Primero' },
    { value: 'producto', label: '📦 Por Producto (A-Z)' },
    { value: 'cantidad', label: '📊 Por Cantidad (mayor primero)' }
  ];

  // Función de ordenamiento
  const productosOrdenados = useMemo(() => {
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

  const getColorBadge = (dias) => {
    if (dias < 0) return 'bg-gray-100 text-gray-700 border-gray-300';
    if (dias <= 2) return 'bg-red-100 text-red-700 border-red-300';
    if (dias <= 5) return 'bg-yellow-100 text-yellow-700 border-yellow-300';
    return 'bg-green-100 text-green-700 border-green-300';
  };

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
        {productos.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Package className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm font-medium">No hay productos próximos a vencer</p>
          </div>
        ) : (
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
                      key={idx} 
                      producto={producto} 
                      onCrearVenta={onCrearVenta}
                      onDescartar={onDescartar}
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
                          key={idx} 
                          producto={producto} 
                          onCrearVenta={onCrearVenta}
                          onDescartar={onDescartar}
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
                          key={idx} 
                          producto={producto} 
                          onCrearVenta={onCrearVenta}
                          onDescartar={onDescartar}
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
                          key={idx} 
                          producto={producto} 
                          onCrearVenta={onCrearVenta}
                          onDescartar={onDescartar}
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
                    key={idx} 
                    producto={producto} 
                    onCrearVenta={onCrearVenta}
                    onDescartar={onDescartar}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
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
            Vence: {new Date(producto.fechaVencimiento).toLocaleDateString()}
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
          {esVencido ? 'Intentar Vender' : 'Crear Venta'}
        </button>
      </div>
    </div>
  );
};

export default ProductosProximosVencer;
```

---

## 📊 ORDEN DE IMPLEMENTACIÓN RECOMENDADO

### **Semana 1: Mejoras UX en Selector de Lotes**
1. ✅ Agregar función de cálculo de días hasta vencimiento
2. ✅ Agregar badges de alerta en lotes
3. ✅ Ordenar lotes por fecha de vencimiento (FIFO)
4. ✅ Mejorar visualización de fechas

### **Semana 2: Backend - Endpoints**
1. ✅ Crear DTOs (ProductoProximoVencerDTO, ProductoVencidoDTO)
2. ✅ Implementar endpoint `/productos/proximos-vencer`
3. ✅ Implementar endpoint `/productos/vencidos`
4. ✅ Probar endpoints con Postman/Thunder Client

### **Semana 3: Frontend - Componentes y Dashboard**
1. ✅ Crear componente ProductosProximosVencer
2. ✅ Integrar en Dashboard
3. ✅ Agregar acciones (crear venta, ver detalles)
4. ✅ Crear página/reporte de productos vencidos

### **Semana 4: Proceso de Descarte**
1. ✅ Implementar función `onDescartar` que crea SALIDA con precio $0
2. ✅ Modal de confirmación para descartes
3. ✅ Agregar campo "Motivo" opcional en descripción (ej: "DESCARTO - Producto vencido")
4. ✅ Crear reporte de descartes (filtrar movimientos con precio = 0)

---

## 🗑️ FUNCIONALIDAD DE DESCARTE

### **Implementación del Botón "Descartar"**

**Funcionalidad:**
- Solo aparece en productos vencidos
- Crea una SALIDA con precio $0
- Descripción automática: "DESCARTO - Producto vencido"
- Modal de confirmación antes de descartar

**Código de ejemplo para Dashboard:**
```jsx
// En Dashboard.jsx
const handleDescartar = async (producto) => {
  // Confirmar descarte
  const confirmar = window.confirm(
    `¿Estás seguro de descartar ${producto.cantidadDisponible} unidades del producto "${producto.nombreProducto}" (Lote: ${producto.lote})?\n\n` +
    `Este producto venció hace ${Math.abs(producto.diasHastaVencimiento)} día(s).\n` +
    `Valor de pérdida: ${formatPrice(producto.valorInversion)}`
  );
  
  if (!confirmar) return;
  
  try {
    // Crear movimiento de SALIDA con precio $0
    const movimientoData = {
      fecha: new Date().toISOString().split('T')[0],
      descripcion: `DESCARTO - Producto vencido (${producto.nombreProducto}, Lote: ${producto.lote})`,
      tipoMovimiento: 'SALIDA',
      productos: [{
        productoId: producto.productoId,
        cantidad: producto.cantidadDisponible,
        precioVenta: 0, // Precio $0 para descartes
        lote: producto.lote
      }]
    };
    
    // Llamar a la acción de Redux para crear el movimiento
    await dispatch(createMovimientoProducto(movimientoData)).unwrap();
    
    // Actualizar datos
    await updateAfterProductoMovement();
    
    // Mostrar mensaje de éxito
    toast.success(`Producto descartado correctamente`);
  } catch (error) {
    console.error('Error al descartar producto:', error);
    toast.error('Error al descartar el producto. Por favor, intenta nuevamente.');
  }
};

// Pasar la función al componente
<ProductosProximosVencer 
  productos={productosProximosVencer}
  onCrearVenta={handleCrearVenta}
  onDescartar={handleDescartar}
/>
```

**Mejora opcional - Modal de descarte más elaborado:**
```jsx
// Componente ModalDescartar.jsx
import React, { useState } from 'react';
import { Trash2, AlertTriangle } from 'lucide-react';

const ModalDescartar = ({ producto, onConfirmar, onCancelar }) => {
  const [motivo, setMotivo] = useState('Producto vencido');
  
  const motivos = [
    'Producto vencido',
    'Producto dañado',
    'Producto defectuoso',
    'Otro'
  ];
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-red-100 rounded-full">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Confirmar Descarte</h3>
        </div>
        
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">
            Estás a punto de descartar:
          </p>
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="font-medium text-gray-900">{producto.nombreProducto}</p>
            <p className="text-sm text-gray-600">Lote: {producto.lote}</p>
            <p className="text-sm text-gray-600">Cantidad: {formatNumber(producto.cantidadDisponible)}</p>
            <p className="text-sm text-red-600 font-medium">
              Valor de pérdida: {formatPrice(producto.valorInversion)}
            </p>
          </div>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Motivo del descarte:
          </label>
          <select
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
          >
            {motivos.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={onCancelar}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            onClick={() => onConfirmar(motivo)}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center justify-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Confirmar Descarte
          </button>
        </div>
      </div>
    </div>
  );
};
```

---

## 🎯 BENEFICIOS ESPERADOS

1. **Visibilidad clara** de productos próximos a vencer
2. **Decisiones informadas** del admin sobre precios
3. **Reducción de pérdidas** por productos vencidos
4. **Mejor rotación** de inventario (FIFO automático)
5. **Trazabilidad completa** de descartes

---

## ✅ CONCLUSIÓN

**Enfoque sin descuentos automáticos:**
- ✅ El sistema **informa** y **sugiere** (alertas visuales)
- ✅ El admin **decide** el precio manualmente
- ✅ Mejor control y flexibilidad
- ✅ Menos complejidad en el código

**¿Empezamos con la Fase 1 (Mejoras UX en Selector de Lotes)?**

