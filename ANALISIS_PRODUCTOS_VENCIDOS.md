# 📊 ANÁLISIS PROFUNDO: GESTIÓN DE PRODUCTOS VENCIDOS

**Fecha:** 2025-01-XX  
**Contexto:** Sistema de gestión de stock con productos perecederos (cafés fríos)  
**Objetivo:** Analizar el manejo de productos vencidos y proponer soluciones

---

## 🔍 SITUACIÓN ACTUAL DEL SISTEMA

### ✅ Lo que YA está implementado:

1. **Validación de productos vencidos en ventas**
   - El sistema **bloquea** la venta de productos que ya vencieron
   - Validación en backend: `MovimientoProductoLoteServiceImplements.java` (líneas 126-133, 668-675)
   - No permite vender lotes con `fechaVencimiento < LocalDate.now()`

2. **Fechas de vencimiento obligatorias**
   - Cada movimiento de ENTRADA (producción) requiere fecha de vencimiento
   - Se almacena en `DetalleMovimientoProducto.fechaVencimiento`
   - Cada lote tiene su propia fecha de vencimiento

3. **Sistema de lotes**
   - Los productos se agrupan por lotes
   - Cada lote tiene fecha de producción y fecha de vencimiento
   - El stock se calcula por lote (entradas - salidas)

### ❌ Lo que FALTA implementar:

1. **Alertas proactivas de productos próximos a vencer**
   - No hay notificaciones cuando un producto está cerca de vencer
   - No hay dashboard de productos con vencimiento próximo

2. **Gestión de productos vencidos**
   - No hay forma de marcar productos como vencidos
   - No hay reportes de productos vencidos
   - No hay proceso para descartar productos vencidos

3. **Estrategia FIFO (First In, First Out)**
   - No hay priorización automática de productos más antiguos
   - No se sugiere qué lote vender primero

---

## 🎯 RECOMENDACIONES PARA PRODUCTOS VENCIDOS

### 1. 🚨 **ALERTAS PROACTIVAS** (Prioridad: ALTA)

**Problema:** Los cafés fríos se vencen sin ser vendidos porque no hay alertas tempranas.

**Solución:** Implementar sistema de alertas con diferentes niveles:

```java
// Backend: Endpoint para obtener productos próximos a vencer
@GetMapping("/productos/proximos-vencer")
public List<ProductoProximoVencerDTO> obtenerProductosProximosAVencer(
    @RequestParam(defaultValue = "7") int diasAnticipacion
) {
    LocalDate fechaLimite = LocalDate.now().plusDays(diasAnticipacion);
    // Retornar productos con fechaVencimiento <= fechaLimite y stock > 0
}
```

**Niveles de alerta:**
- 🔴 **CRÍTICO:** Vencen en 1-2 días
- 🟡 **ADVERTENCIA:** Vencen en 3-5 días  
- 🟢 **INFORMATIVO:** Vencen en 6-7 días

**Beneficios:**
- Permite tomar acciones preventivas (promociones, descuentos)
- Reduce pérdidas por productos vencidos
- Mejora la rotación de inventario

---

### 2. 📋 **REPORTE DE PRODUCTOS VENCIDOS** (Prioridad: ALTA)

**Problema:** No hay visibilidad de cuántos productos están vencidos.

**Solución:** Crear reporte y dashboard de productos vencidos:

```java
// Backend: Endpoint para productos vencidos
@GetMapping("/productos/vencidos")
public List<ProductoVencidoDTO> obtenerProductosVencidos() {
    LocalDate hoy = LocalDate.now();
    // Retornar lotes con fechaVencimiento < hoy y stock > 0
    // Incluir: producto, lote, cantidad vencida, días vencidos, valor de inversión
}
```

**Información a mostrar:**
- Producto y lote
- Cantidad vencida
- Días desde vencimiento
- Valor de inversión perdida
- Fecha de vencimiento

**Beneficios:**
- Visibilidad clara de pérdidas
- Permite tomar decisiones informadas
- Facilita la gestión de inventario

---

### 3. 🗑️ **PROCESO DE DESCARTO DE PRODUCTOS VENCIDOS** (Prioridad: MEDIA)

**Problema:** No hay forma de registrar que un producto vencido fue descartado.

**Solución:** Crear tipo de movimiento "DESCARTO" o "AJUSTE":

**Opción A: Movimiento de SALIDA especial**
```java
// Usar SALIDA con descripción "DESCARTO - Producto vencido"
// Registrar como venta con precio $0
```

**Opción B: Nuevo tipo de movimiento (recomendado)**
```java
public enum TipoMovimiento {
    ENTRADA,
    SALIDA,
    DESCARTO,  // Nuevo tipo
    AJUSTE     // Para correcciones
}
```

**Campos adicionales:**
- Motivo del descarte (vencido, dañado, etc.)
- Responsable del descarte
- Fecha de descarte
- Valor de pérdida

**Beneficios:**
- Trazabilidad completa
- Reportes de pérdidas
- Control de inventario preciso

---

### 4. 💰 **ESTRATEGIAS DE PREVENCIÓN** (Prioridad: ALTA)

#### A. **Sistema FIFO (First In, First Out)**

**Implementación:** Al seleccionar productos para venta, sugerir lotes más antiguos primero:

```java
// Backend: Ordenar lotes por fecha de vencimiento (más antiguos primero)
public List<StockPorLoteDTO> obtenerStockPorLotes(Long productoId) {
    // ... código existente ...
    .sorted(Comparator.comparing(StockPorLoteDTO::fechaVencimiento))  // Ya está implementado
    .collect(Collectors.toList());
}
```

**Frontend:** Mostrar alerta visual en lotes próximos a vencer:
- Badge rojo: "Vence pronto"
- Badge amarillo: "Vence en X días"
- Ordenar por fecha de vencimiento en el selector

#### B. **Promociones Automáticas**

**Sugerencia:** Cuando un producto está próximo a vencer (3-5 días), sugerir:
- Descuento del 20-30%
- Promoción "2x1"
- Oferta especial

**Implementación:** Campo opcional en producto:
```java
private boolean aplicarDescuentoPorVencimiento = false;
private double porcentajeDescuento = 0.20; // 20%
```

#### C. **Producción Just-in-Time**

**Recomendación:** Analizar patrones de venta y ajustar producción:
- Producir menos cantidad si hay tendencia a vencimiento
- Producir más frecuentemente en lotes pequeños
- Usar datos históricos para predecir demanda

---

### 5. 📊 **DASHBOARD DE VENCIMIENTOS** (Prioridad: MEDIA)

**Componente nuevo:** Sección en Dashboard para productos próximos a vencer:

```jsx
// Frontend: Componente ProductosProximosVencer.jsx
const ProductosProximosVencer = ({ productos, movimientos }) => {
  // Calcular productos que vencen en los próximos 7 días
  // Mostrar en tabla con colores según urgencia
  // Incluir acciones: "Aplicar descuento", "Descartar"
}
```

**Información a mostrar:**
- Lista de productos próximos a vencer
- Días restantes hasta vencimiento
- Cantidad disponible
- Valor de inversión
- Acciones rápidas

---

### 6. 🔔 **NOTIFICACIONES AUTOMÁTICAS** (Prioridad: BAJA)

**Sugerencia:** Sistema de notificaciones diarias:

```java
// Backend: Tarea programada (Cron Job)
@Scheduled(cron = "0 0 9 * * ?") // Todos los días a las 9 AM
public void enviarAlertasVencimiento() {
    // Buscar productos que vencen en 1-3 días
    // Enviar email/notificación al administrador
}
```

**Contenido de notificación:**
- Lista de productos próximos a vencer
- Cantidad y valor
- Recomendaciones de acción

---

## 💡 RECOMENDACIONES ESPECÍFICAS PARA CAFÉS FRÍOS

### **Problema Identificado:**
Los cafés fríos se producen pero a veces no se venden antes de vencer.

### **Soluciones Prácticas:**

#### 1. **Ajustar Volumen de Producción**
- **Análisis:** Revisar historial de ventas vs productos vencidos
- **Acción:** Reducir cantidad de producción si hay tendencia a vencimiento
- **Herramienta:** Reporte de "Tasa de vencimiento por producto"

#### 2. **Rotación de Inventario**
- **Implementar FIFO:** Vender siempre los lotes más antiguos primero
- **Visualización:** Mostrar fecha de vencimiento prominente en selector de lotes
- **Alerta:** Badge visual cuando se selecciona un lote próximo a vencer

#### 3. **Promociones Preventivas**
- **3 días antes:** Aplicar descuento del 15%
- **2 días antes:** Aumentar descuento al 25%
- **1 día antes:** Descuento del 40% o promoción especial

#### 4. **Producción por Demanda**
- **Análisis:** Identificar días/horarios de mayor demanda
- **Estrategia:** Producir más en días de alta demanda, menos en días bajos
- **Herramienta:** Dashboard de "Demanda por día de la semana"

#### 5. **Sistema de Reservas**
- **Opción:** Permitir reservas de productos próximos a vencer
- **Beneficio:** Garantiza venta antes del vencimiento
- **Implementación:** Campo "Reservado" en lotes

---

## 🛠️ PLAN DE IMPLEMENTACIÓN SUGERIDO

### **Fase 1: Alertas y Reportes** (1-2 semanas)
1. ✅ Endpoint backend: Productos próximos a vencer
2. ✅ Endpoint backend: Productos vencidos
3. ✅ Componente frontend: Dashboard de vencimientos
4. ✅ Integración en Dashboard principal

### **Fase 2: Gestión de Descartos** (1 semana)
1. ✅ Tipo de movimiento DESCARTO (o usar SALIDA con flag)
2. ✅ Formulario de descarte con motivo
3. ✅ Reporte de productos descartados

### **Fase 3: Mejoras FIFO y Promociones** (1-2 semanas)
1. ✅ Mejorar selector de lotes con ordenamiento por vencimiento
2. ✅ Alertas visuales en selector
3. ✅ Sistema de descuentos automáticos (opcional)

### **Fase 4: Análisis y Optimización** (Ongoing)
1. ✅ Reportes de tasa de vencimiento
2. ✅ Análisis de demanda
3. ✅ Recomendaciones automáticas de producción

---

## 📈 MÉTRICAS DE ÉXITO

**KPIs a monitorear:**
1. **Tasa de vencimiento:** % de productos que se vencen sin vender
2. **Días promedio hasta vencimiento:** Tiempo promedio de rotación
3. **Valor de pérdidas:** Valor total de productos vencidos/descartados
4. **Efectividad de alertas:** % de productos salvados por alertas tempranas
5. **Rotación de inventario:** Veces que se renueva el stock en un período

**Objetivos:**
- Reducir tasa de vencimiento a < 5%
- Aumentar rotación de inventario
- Minimizar pérdidas por productos vencidos

---

## 🎯 CONCLUSIÓN

**Estado Actual:**
- ✅ Sistema bien protegido contra venta de productos vencidos
- ❌ Falta visibilidad y gestión proactiva de productos próximos a vencer

**Recomendación Principal:**
Implementar **alertas proactivas** y **reportes de productos vencidos** como primera prioridad. Esto permitirá:
- Tomar acciones preventivas antes del vencimiento
- Reducir pérdidas por productos vencidos
- Mejorar la gestión de inventario

**Próximos Pasos:**
1. Implementar endpoints de productos próximos a vencer y vencidos
2. Crear componente de dashboard para visualización
3. Implementar proceso de descarte de productos vencidos
4. Mejorar selector de lotes con ordenamiento FIFO

---

**¿Quieres que implemente alguna de estas funcionalidades?** Puedo empezar con las alertas y reportes de productos vencidos.

