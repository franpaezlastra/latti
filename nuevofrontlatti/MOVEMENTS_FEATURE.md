# 📦 Funcionalidad de Movimientos - Sistema de Gestión de Stock

## 🎯 Descripción General

La funcionalidad de movimientos permite gestionar las entradas y salidas de insumos y productos en el sistema de stock. Esta funcionalidad es fundamental para mantener un control preciso del inventario y generar reportes financieros.

## 🏗️ Arquitectura Implementada

### **Estructura de Archivos**
```
src/
├── pages/Movements/
│   └── Movements.jsx              # Página principal de movimientos
├── components/features/movements/
│   └── modals/
│       ├── MovimientoSeleccionModal.jsx    # Modal de selección de tipo
│       ├── MovimientoInsumoModal.jsx       # Modal de movimiento de insumos
│       ├── MovimientoProductoModal.jsx     # Modal de movimiento de productos
│       └── MovimientoDetallesModal.jsx     # Modal de detalles de movimiento
```

### **Componentes Principales**

#### **1. Movements.jsx (Página Principal)**
- **Responsabilidades:**
  - Unificar movimientos de insumos y productos
  - Filtrar y paginar resultados
  - Gestionar estados de modales
  - Manejar eliminación de movimientos

- **Características:**
  - ✅ Filtros dinámicos por tipo y fecha
  - ✅ Paginación optimizada
  - ✅ Ordenamiento por fecha y descripción
  - ✅ Contador de resultados
  - ✅ Indicadores de filtros activos

#### **2. MovimientoSeleccionModal.jsx**
- **Responsabilidades:**
  - Permitir selección entre insumo y producto
  - Navegación a modales específicos

- **Características:**
  - ✅ Diseño limpio y intuitivo
  - ✅ Botones diferenciados por color
  - ✅ Integración con FormModal

#### **3. MovimientoInsumoModal.jsx**
- **Responsabilidades:**
  - Crear movimientos de insumos
  - Validar datos según tipo de movimiento
  - Manejar errores del backend

- **Características:**
  - ✅ Validación de campos obligatorios
  - ✅ Lógica "ya seleccionado" para evitar duplicados
  - ✅ Validaciones específicas por tipo (ENTRADA/SALIDA)
  - ✅ Manejo de errores unificado
  - ✅ Scroll interno para listas largas

#### **4. MovimientoProductoModal.jsx**
- **Responsabilidades:**
  - Crear movimientos de productos
  - Validar fechas de vencimiento
  - Calcular precios de venta

- **Características:**
  - ✅ Validación de fechas de vencimiento futuras
  - ✅ Campos dinámicos según tipo de movimiento
  - ✅ Validación de precios de venta
  - ✅ Lógica "ya seleccionado"
  - ✅ Manejo de errores robusto

#### **5. MovimientoDetallesModal.jsx**
- **Responsabilidades:**
  - Mostrar detalles completos del movimiento
  - Calcular totales financieros
  - Presentar información organizada

- **Características:**
  - ✅ Vista adaptativa según tipo de movimiento
  - ✅ Cálculos financieros automáticos
  - ✅ Ordenamiento alfabético de detalles
  - ✅ Diseño responsive

## 🔄 Flujo de Datos

### **1. Carga de Datos**
```
Movements.jsx → Redux Actions → Backend API → Store → Componentes
```

### **2. Creación de Movimiento**
```
Modal → Validación → Redux Action → Backend → Actualización Store → UI
```

### **3. Eliminación de Movimiento**
```
Tabla → Confirmación → Redux Action → Backend → Actualización Store → UI
```

## 🎨 Características de UX/UI

### **1. Filtros Inteligentes**
- **Filtro por tipo de ítem:** Insumo/Producto
- **Filtro por tipo de movimiento:** Entrada/Salida
- **Filtros de fecha dinámicos:**
  - Para insumos: Fecha del movimiento
  - Para productos: Fecha de vencimiento

### **2. Validaciones Avanzadas**
```javascript
// Validación de insumos duplicados
const insumoIds = formData.insumos.map(i => i.insumoId);
if (new Set(insumoIds).size !== insumoIds.length) {
  setError(true);
  setTextoError('No puede seleccionar el mismo insumo más de una vez');
}

// Validación de fechas de vencimiento futuras
const fechaVencimiento = new Date(producto.fechaVencimiento);
const hoy = new Date();
if (fechaVencimiento < hoy) {
  setError(true);
  setTextoError('La fecha de vencimiento debe ser futura');
}
```

### **3. Lógica "Ya Seleccionado"**
```javascript
// Verificar si este insumo está seleccionado en otra fila
const insumosSeleccionados = formData.insumos
  .map((item, idx) => ({ id: String(item.insumoId), index: idx }))
  .filter(item => item.id && item.id !== 'undefined' && item.index !== index);

const estaSeleccionadoEnOtra = insumoIdsSeleccionados.includes(String(i.id));
```

## 📊 Funcionalidades Específicas

### **Movimientos de Insumos**

#### **Entrada de Insumos**
- ✅ Selección de insumos disponibles
- ✅ Cantidad y precio de compra obligatorios
- ✅ Cálculo automático de totales
- ✅ Validación de datos completos

#### **Salida de Insumos**
- ✅ Selección de insumos con stock disponible
- ✅ Cantidad obligatoria
- ✅ No requiere precio (se usa para consumo)

### **Movimientos de Productos**

#### **Entrada de Productos (Producción)**
- ✅ Selección de productos disponibles
- ✅ Cantidad y fecha de vencimiento obligatorios
- ✅ Validación de fecha de vencimiento futura
- ✅ Cálculo automático de precio de inversión

#### **Salida de Productos (Venta)**
- ✅ Selección de productos con stock disponible
- ✅ Cantidad y precio de venta obligatorios
- ✅ Cálculo de ganancia automático
- ✅ Validación de stock suficiente

## 🛡️ Manejo de Errores

### **1. Estados de Error Unificados**
```javascript
const [error, setError] = useState(false);
const [textoError, setTextoError] = useState('');
const [isSubmitting, setIsSubmitting] = useState(false);
```

### **2. Limpieza Automática**
```javascript
const handleInputChange = (field, value) => {
  setFormData(prev => ({ ...prev, [field]: value }));
  if (error) {
    setError(false);
    setTextoError('');
  }
};
```

### **3. Validaciones Específicas**
- **Campos obligatorios:** Tipo, fecha, cantidades
- **Validaciones de negocio:** Fechas futuras, precios positivos
- **Validaciones de integridad:** Sin duplicados, stock suficiente

## 🔧 Integración con Backend

### **Endpoints Utilizados**
- `POST /api/movimientos-insumo` - Crear movimiento de insumo
- `POST /api/movimientos-producto` - Crear movimiento de producto
- `GET /api/movimientos-insumo` - Obtener movimientos de insumos
- `GET /api/movimientos-producto` - Obtener movimientos de productos
- `DELETE /api/movimientos-insumo/{id}` - Eliminar movimiento de insumo
- `DELETE /api/movimientos-producto/{id}` - Eliminar movimiento de producto

### **Estructura de Datos**
```javascript
// Movimiento de Insumo
{
  fecha: "2025-01-15",
  descripcion: "Compra semanal",
  tipoMovimiento: "ENTRADA",
  insumos: [
    {
      insumoId: 1,
      cantidad: 10.5,
      precioDeCompra: 25.00
    }
  ]
}

// Movimiento de Producto
{
  fecha: "2025-01-15",
  descripcion: "Producción semanal",
  tipoMovimiento: "ENTRADA",
  productos: [
    {
      productoId: 1,
      cantidad: 50,
      fechaVencimiento: "2025-02-15"
    }
  ]
}
```

## 📈 Métricas y Reportes

### **Cálculos Automáticos**
- **Total de cantidades** por movimiento
- **Total gastado** en insumos
- **Total de ventas** en productos
- **Ganancia neta** en ventas
- **Total de inversión** en producción

### **Filtros Disponibles**
- Por tipo de ítem (Insumo/Producto)
- Por tipo de movimiento (Entrada/Salida)
- Por rango de fechas
- Por fecha de vencimiento (productos)

## 🚀 Mejoras Implementadas

### **1. UX Optimizada**
- ✅ Modales reutilizables con FormModal
- ✅ Manejo de errores consistente
- ✅ Validaciones en tiempo real
- ✅ Feedback visual claro

### **2. Performance**
- ✅ Paginación eficiente
- ✅ Filtros optimizados
- ✅ Carga lazy de datos
- ✅ Estados de loading

### **3. Mantenibilidad**
- ✅ Código modular y reutilizable
- ✅ Separación de responsabilidades
- ✅ Documentación completa
- ✅ Convenciones consistentes

## 🔮 Próximas Mejoras

### **1. Funcionalidades Adicionales**
- [ ] Edición de movimientos
- [ ] Exportación a Excel/PDF
- [ ] Reportes avanzados
- [ ] Notificaciones de vencimiento

### **2. Optimizaciones**
- [ ] Caché de datos
- [ ] Búsqueda avanzada
- [ ] Filtros guardados
- [ ] Dashboard de movimientos

### **3. Integración**
- [ ] Webhooks para notificaciones
- [ ] API para terceros
- [ ] Sincronización en tiempo real
- [ ] Backup automático

---

**Estado:** ✅ Completado  
**Versión:** 1.0.0  
**Última actualización:** Enero 2025 