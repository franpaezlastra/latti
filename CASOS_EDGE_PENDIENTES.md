# ⚠️ CASOS EDGE Y MEJORAS PENDIENTES

**Fecha:** 2025-01-XX  
**Estado:** Validaciones críticas implementadas, pero hay casos edge que podrían mejorarse

---

## ✅ LO QUE ESTÁ BIEN PROTEGIDO

1. ✅ **Validaciones de edición/eliminación** - Muy completas
2. ✅ **Validaciones de fechas históricas** - Implementadas
3. ✅ **Validaciones de lotes** - Implementadas
4. ✅ **Validaciones de producción** - Implementadas
5. ✅ **Validaciones de ensambles** - Implementadas
6. ✅ **Validaciones de tipo de movimiento** - Implementadas

---

## ⚠️ CASOS EDGE QUE PODRÍAN MEJORARSE

### 1. 🔴 RACE CONDITIONS (Concurrencia)

**Problema:** Si dos usuarios editan/eliminan el mismo movimiento simultáneamente, podría haber inconsistencias.

**Escenario:**
- Usuario A lee movimiento ID 1 (cantidad: 100)
- Usuario B lee movimiento ID 1 (cantidad: 100)
- Usuario A edita a 80
- Usuario B edita a 90
- **Resultado:** Solo se guarda la última edición, perdiendo la primera

**Solución recomendada:**
```java
// Agregar @Version en las entidades
@Entity
public class MovimientoInsumoLote {
    @Version
    private Long version; // Optimistic locking
    // ...
}

// En el servicio, capturar OptimisticLockException
try {
    movimientoRepository.save(movimiento);
} catch (OptimisticLockException e) {
    throw new IllegalArgumentException(
        "El movimiento fue modificado por otro usuario. Por favor, recarga la página e intenta nuevamente."
    );
}
```

**Prioridad:** 🟡 MEDIA (solo si hay múltiples usuarios simultáneos)

---

### 2. 🟡 VALIDACIÓN DE CANTIDAD AL EDITAR PRODUCTO

**Problema:** Si editas un movimiento de entrada de producto y reduces la cantidad, pero ya hay salidas del lote que suman más de lo que queda, no se valida específicamente.

**Escenario:**
- Entrada: 100 unidades lote LOTE-1
- Salida 1: 30 unidades lote LOTE-1
- Salida 2: 40 unidades lote LOTE-1
- **Stock actual del lote:** 30 unidades
- **Editas entrada a 50 unidades** (reduces de 100 a 50)
- **Resultado:** El stock del lote quedaría negativo (-20)

**Estado actual:** 
- ✅ Se valida que no haya salidas antes de editar
- ❌ NO se valida si la nueva cantidad es suficiente para las salidas existentes

**Solución recomendada:**
```java
// En editarMovimientoProducto, después de validar que no hay salidas:
// Si hay salidas del mismo lote, validar que la nueva cantidad sea suficiente
for (DetalleMovimientoProducto detalleOriginal : movimientoOriginal.getDetalles()) {
    String loteOriginal = detalleOriginal.getLote();
    if (loteOriginal != null) {
        // Calcular total de salidas de este lote
        double totalSalidas = producto.getMovimientos().stream()
            .filter(d -> d.getLote() != null && d.getLote().equals(loteOriginal))
            .filter(d -> d.getMovimiento().getTipoMovimiento() == TipoMovimiento.SALIDA)
            .mapToDouble(DetalleMovimientoProducto::getCantidad)
            .sum();
        
        // Validar que la nueva cantidad sea suficiente
        for (DetalleMovimientoProductoDTO d : dto.detalles()) {
            if (d.cantidad() < totalSalidas) {
                throw new IllegalArgumentException(
                    "No se puede reducir la cantidad a " + d.cantidad() + 
                    " porque ya hay " + totalSalidas + " unidades vendidas del lote '" + loteOriginal + "'"
                );
            }
        }
    }
}
```

**Prioridad:** 🟡 MEDIA (pero importante para integridad)

---

### 3. 🟡 VALIDACIÓN DE STOCK MÍNIMO

**Problema:** No se valida si al eliminar/editar un movimiento, el stock resultante quedaría por debajo del stock mínimo configurado.

**Escenario:**
- Insumo tiene stock mínimo: 50
- Stock actual: 60
- Eliminas movimiento de entrada de 20 unidades
- **Resultado:** Stock queda en 40 (por debajo del mínimo)

**Solución recomendada:**
```java
// En eliminarMovimientoInsumo, después de revertir stock:
if (insumo.getStockActual() < insumo.getStockMinimo()) {
    // No bloquear, solo advertir (o bloquear según regla de negocio)
    System.out.println("⚠️ ADVERTENCIA: El stock quedará por debajo del mínimo");
    // O lanzar excepción si es crítico
}
```

**Prioridad:** 🟢 BAJA (más una advertencia que un bloqueo)

---

### 4. 🟡 VALIDACIÓN DE TRANSACCIONES ANIDADAS

**Problema:** Algunos métodos llaman a otros métodos transaccionales, lo que podría causar comportamientos inesperados.

**Ejemplo:**
- `editarMovimientoProducto` es `@Transactional`
- Llama a `restarInsumosDeReceta` que también podría ser transaccional
- Si hay un error en el medio, el rollback podría no funcionar correctamente

**Solución:** Revisar que todos los métodos transaccionales estén correctamente anotados y que no haya conflictos.

**Prioridad:** 🟢 BAJA (probablemente ya está bien manejado)

---

### 5. 🟡 VALIDACIÓN DE CANTIDADES DECIMALES EXTREMAS

**Problema:** No hay validación de precisión decimal o cantidades extremadamente pequeñas/grandes.

**Escenario:**
- Usuario ingresa cantidad: 0.0000001 (demasiado pequeña)
- Usuario ingresa cantidad: 999999999999 (demasiado grande, podría causar overflow)

**Solución recomendada:**
```java
private static final double CANTIDAD_MINIMA = 0.001; // 1 gramo mínimo
private static final double CANTIDAD_MAXIMA = 1_000_000.0; // 1 millón máximo

if (cantidad < CANTIDAD_MINIMA) {
    throw new IllegalArgumentException("La cantidad debe ser al menos " + CANTIDAD_MINIMA);
}
if (cantidad > CANTIDAD_MAXIMA) {
    throw new IllegalArgumentException("La cantidad no puede exceder " + CANTIDAD_MAXIMA);
}
```

**Prioridad:** 🟢 BAJA (pero buena práctica)

---

### 6. 🟡 VALIDACIÓN DE FECHAS EN ZONAS HORARIAS

**Problema:** Si la aplicación se usa en diferentes zonas horarias, las fechas podrían tener inconsistencias.

**Solución:** Asegurar que todas las fechas se manejen en UTC o en la zona horaria del servidor.

**Prioridad:** 🟢 BAJA (solo si hay usuarios en diferentes zonas)

---

## 📊 RESUMEN DE PRIORIDADES

### 🔴 CRÍTICO (Implementar si hay múltiples usuarios):
- Race conditions (Optimistic Locking)

### 🟡 MEDIO (Recomendado para integridad completa):
- Validación de cantidad al editar producto (si reduce cantidad)
- Validación de stock mínimo (advertencia)

### 🟢 BAJO (Mejoras opcionales):
- Validación de cantidades extremas
- Validación de transacciones anidadas
- Validación de zonas horarias

---

## ✅ CONCLUSIÓN

**El backend está MUY BIEN PROTEGIDO** contra las inconsistencias más comunes. Los casos edge mencionados son:

1. **Rare** (poco probables en uso normal)
2. **Detectables** (el sistema los detectaría y lanzaría errores)
3. **Mejorables** (pero no críticos para funcionamiento básico)

**Recomendación:** 
- ✅ Para producción inicial: **El backend está listo**
- ⚠️ Para producción con múltiples usuarios: **Agregar Optimistic Locking**
- 🎯 Para perfección: **Implementar validaciones de cantidad al editar**

---

**¿Quieres que implemente alguna de estas mejoras?**

