# 🔴 PROBLEMAS EN MOVIMIENTOS DE SALIDA DE PRODUCTOS

**Fecha:** 2025-01-XX  
**Prioridad:** 🔴 CRÍTICA  
**Objetivo:** Identificar y corregir problemas en la lógica de ventas/salidas de productos

---

## 📋 PROBLEMAS ENCONTRADOS

### 🔴 CRÍTICO #1: `crearMovimientoProducto` para SALIDA NO usa el campo `lote` del DTO

**Ubicación:** `MovimientoProductoLoteServiceImplements.java` línea 137-140

**Problema:**
- El DTO `DetalleMovimientoProductoDTO` tiene un campo `lote` (línea 10)
- Pero en `crearMovimientoProducto` para SALIDA, NO se está usando ese campo
- El detalle se crea sin asignar el lote
- Solo resta del stock total, no de lotes específicos

**Código actual:**
```java
// Crear el detalle
DetalleMovimientoProducto detalle = new DetalleMovimientoProducto(
        d.cantidad(),
        producto
);
detalle.setFechaVencimiento(d.fechaVencimiento());
// ❌ FALTA: detalle.setLote(d.lote());
```

**Impacto:** Si el frontend envía un lote específico, se ignora y no se valida ni se asigna.

**Solución:** 
1. Si se especifica un lote, validar que exista y tenga stock suficiente
2. Asignar el lote al detalle
3. Validar fecha de creación del lote vs fecha de venta

---

### 🔴 CRÍTICO #2: No se valida stock por lote en `crearMovimientoProducto` para SALIDA

**Ubicación:** `MovimientoProductoLoteServiceImplements.java` línea 86-95

**Problema:**
- Solo se valida stock total con `calcularStockDisponibleEnFecha`
- NO se valida stock por lote específico
- Si se especifica un lote, debería validar stock en ese lote

**Solución:**
```java
if (dto.tipoMovimiento() == TipoMovimiento.SALIDA) {
    // ... validaciones existentes ...
    
    // ✅ AGREGAR: Si se especifica un lote, validar stock en ese lote
    if (d.lote() != null && !d.lote().trim().isEmpty()) {
        double stockDisponibleEnLote = obtenerStockDisponibleEnLote(producto, d.lote());
        if (stockDisponibleEnLote < d.cantidad()) {
            throw new IllegalArgumentException(
                "Stock insuficiente en el lote '" + d.lote() + "' para el producto '" + producto.getNombre() + 
                "'. Stock disponible en lote: " + stockDisponibleEnLote + 
                ", Cantidad solicitada: " + d.cantidad()
            );
        }
        
        // Validar fecha de creación del lote
        LocalDate fechaCreacionLote = producto.getMovimientos().stream()
                .filter(detalle -> detalle.getMovimiento().getTipoMovimiento() == TipoMovimiento.ENTRADA)
                .filter(detalle -> d.lote().equals(detalle.getLote()))
                .map(detalle -> detalle.getMovimiento().getFecha())
                .min(LocalDate::compareTo)
                .orElse(null);
        
        if (fechaCreacionLote == null) {
            throw new IllegalArgumentException(
                "No se encontró la producción (lote '" + d.lote() + "') del producto '" + producto.getNombre() +
                "'. Verifica que el lote exista antes de registrar la venta."
            );
        }
        
        if (dto.fecha().isBefore(fechaCreacionLote)) {
            throw new IllegalArgumentException(
                "No se puede vender unidades del lote '" + d.lote() + "' del producto '" + producto.getNombre() +
                "' en la fecha " + dto.fecha() + " porque el lote se produjo el " + fechaCreacionLote + "."
            );
        }
    }
}
```

---

### 🟡 MEDIO #3: No se valida fecha extrema en `crearVentaPorLotes`

**Ubicación:** `MovimientoProductoLoteServiceImplements.java` línea 403

**Problema:** No se llama a `validarFecha()` antes de crear la venta por lotes.

**Solución:** Agregar al inicio del método:
```java
@Transactional
public MovimientoProductoLote crearVentaPorLotes(CrearVentaPorLotesDTO dto) {
    try {
        // ✅ AGREGAR
        validarFecha(dto.fecha(), "venta por lotes");
        
        MovimientoProductoLote movimiento = new MovimientoProductoLote(
                dto.fecha(),
                dto.descripcion(),
                TipoMovimiento.SALIDA
        );
        // ... resto del código
```

---

### 🟡 MEDIO #4: No se valida que el lote no esté vencido

**Ubicación:** `MovimientoProductoLoteServiceImplements.java` - `crearVentaPorLotes` y `crearMovimientoProducto`

**Problema:** Si un lote tiene fecha de vencimiento y ya venció, se puede vender igual.

**Solución:** Agregar validación:
```java
// Validar que el lote no esté vencido
LocalDate fechaVencimientoLote = obtenerFechaVencimientoLote(producto, venta.lote());
if (fechaVencimientoLote != null && fechaVencimientoLote.isBefore(LocalDate.now())) {
    throw new IllegalArgumentException(
        "No se puede vender unidades del lote '" + venta.lote() + "' del producto '" + producto.getNombre() +
        "' porque el lote venció el " + fechaVencimientoLote + "."
    );
}
```

---

### 🟡 MEDIO #5: No se valida productos duplicados en `crearVentaPorLotes`

**Ubicación:** `MovimientoProductoLoteServiceImplements.java` línea 411

**Problema:** Se puede vender el mismo producto múltiples veces en el mismo movimiento (aunque de lotes diferentes), lo cual es válido, pero debería validarse que no haya duplicados exactos (mismo producto + mismo lote).

**Solución:** Agregar validación:
```java
// Validar que no haya ventas duplicadas (mismo producto + mismo lote)
Set<String> ventasUnicas = new HashSet<>();
for (VentaPorLoteDTO venta : dto.ventasPorLotes()) {
    String clave = venta.productoId() + "|" + venta.lote();
    if (ventasUnicas.contains(clave)) {
        throw new IllegalArgumentException(
            "No se puede vender el mismo producto ('" + venta.productoId() + 
            "') del mismo lote ('" + venta.lote() + "') más de una vez en el mismo movimiento."
        );
    }
    ventasUnicas.add(clave);
}
```

---

### 🟢 BAJO #6: No se valida que la suma de cantidades de lotes diferentes no exceda el stock total

**Problema:** Si se vende de múltiples lotes del mismo producto, no se valida que la suma no exceda el stock total disponible.

**Nota:** Esto podría ser válido si se quiere vender de lotes diferentes, pero debería validarse.

---

## 📝 RESUMEN DE CORRECCIONES NECESARIAS

1. ✅ **Usar campo `lote` del DTO en `crearMovimientoProducto` para SALIDA**
2. ✅ **Validar stock por lote si se especifica un lote**
3. ✅ **Validar fecha de creación del lote vs fecha de venta**
4. ✅ **Agregar validación de fecha extrema en `crearVentaPorLotes`**
5. ✅ **Validar que el lote no esté vencido**
6. ✅ **Validar productos/lotes duplicados en `crearVentaPorLotes`**

---

**¿Procedo a implementar estas correcciones?**

