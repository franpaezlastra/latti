# 🔴 PROBLEMAS CRÍTICOS EN VALIDACIONES DE EDICIÓN/ELIMINACIÓN Y FECHAS

**Fecha:** 2025-01-XX  
**Prioridad:** 🔴 CRÍTICA - Puede arruinar la aplicación  
**Objetivo:** Identificar y corregir TODAS las inconsistencias en validaciones de movimientos y fechas

---

## 📋 ÍNDICE DE PROBLEMAS ENCONTRADOS

1. [PROBLEMAS EN VALIDACIONES DE EDICIÓN/ELIMINACIÓN](#1-problemas-en-validaciones-de-edicióneliminación)
2. [PROBLEMAS EN VALIDACIONES DE FECHAS](#2-problemas-en-validaciones-de-fechas)
3. [CASOS EDGE NO CUBIERTOS](#3-casos-edge-no-cubiertos)
4. [SOLUCIONES PROPUESTAS](#4-soluciones-propuestas)

---

## 1. PROBLEMAS EN VALIDACIONES DE EDICIÓN/ELIMINACIÓN

### 🔴 CRÍTICO #1: `verificarUsoEnProduccionPosterior` NO valida producción en la MISMA fecha

**Ubicación:** `MovimientoInsumoLoteServiceImplements.java` línea 1186

**Problema:**
```java
// ❌ ACTUAL - Solo verifica producción DESPUÉS de la fecha
movimientoProducto.getFecha().isAfter(fechaMovimiento)
```

**Caso problemático:**
- Movimiento de entrada de insumo: `10/11/2025`
- Producción de producto que usa ese insumo: `10/11/2025` (misma fecha)
- **Resultado:** La validación NO detecta el problema porque solo busca `isAfter()`

**Impacto:** Se puede eliminar/editar un movimiento que fue usado en producción el mismo día.

**Solución:**
```java
// ✅ CORREGIDO - Verificar producción en la misma fecha O después
movimientoProducto.getFecha().isAfter(fechaMovimiento) ||
movimientoProducto.getFecha().isEqual(fechaMovimiento)
```

**Prioridad:** 🔴 CRÍTICA

---

### 🔴 CRÍTICO #2: No se valida producción ANTES de la fecha del movimiento

**Ubicación:** `MovimientoInsumoLoteServiceImplements.java` - `validarEdicionMovimiento` y `validarEliminacionMovimiento`

**Problema:** Si hay producción ANTES de la fecha del movimiento de entrada, significa que el stock histórico es incorrecto, pero la validación actual no lo detecta.

**Caso problemático:**
- Producción de producto: `10/11/2025` (usa insumo X)
- Movimiento de entrada de insumo X: `11/11/2025` (después de la producción)
- **Resultado:** La producción usó stock que no existía en esa fecha, pero la validación no lo detecta

**Nota:** Este caso debería ser imposible si las validaciones de creación están bien, pero hay que validarlo al editar/eliminar por seguridad.

**Solución:** Agregar validación adicional:
```java
// ✅ AGREGAR: Verificar si hay producción ANTES de la fecha del movimiento
private boolean verificarProduccionAnterior(Insumo insumo, LocalDate fechaMovimiento) {
    // Si hay producción ANTES de la fecha del movimiento, significa que el stock histórico es incorrecto
    // Esto no debería pasar, pero hay que validarlo
    List<Producto> productosQueUsanInsumo = productoRepository.findAll().stream()
            .filter(producto -> producto.getReceta() != null && 
                    producto.getReceta().getDetalles().stream()
                            .anyMatch(d -> d.getInsumo().getId().equals(insumo.getId())))
            .toList();

    for (Producto producto : productosQueUsanInsumo) {
        boolean tieneProduccionAnterior = producto.getMovimientos().stream()
                .anyMatch(detalleMovimiento -> {
                    MovimientoProductoLote movimientoProducto = detalleMovimiento.getMovimiento();
                    return movimientoProducto.getTipoMovimiento() == TipoMovimiento.ENTRADA &&
                           movimientoProducto.getFecha().isBefore(fechaMovimiento);
                });
        
        if (tieneProduccionAnterior) {
            return true; // Hay producción antes del movimiento - INCONSISTENCIA
        }
    }
    
    return false;
}
```

**Prioridad:** 🔴 CRÍTICA

---

### 🔴 CRÍTICO #3: Al editar fecha de movimiento, NO se revalida contra producción

**Ubicación:** `MovimientoInsumoLoteServiceImplements.java` línea 814 - `editarMovimientoInsumo`

**Problema:** Cuando se edita un movimiento, se valida al inicio con `validarEdicionMovimiento(dto.id())`, pero si se cambia la fecha en el DTO, la nueva fecha NO se valida contra las producciones.

**Caso problemático:**
1. Movimiento de entrada: `15/11/2025` (válido, no hay producción después)
2. Producción de producto: `20/11/2025` (usa el insumo)
3. Usuario edita el movimiento y cambia la fecha a `25/11/2025`
4. **Resultado:** La validación inicial pasa (porque valida con fecha original), pero la nueva fecha queda DESPUÉS de la producción, lo cual es incorrecto.

**Solución:** Después de validar, comparar la fecha original con la nueva fecha y revalidar:
```java
@Transactional
public MovimientoInsumoLote editarMovimientoInsumo(EditarMovimientoDeInsumoDTO dto) {
    // Validar que se puede editar (con fecha original)
    ValidacionEdicionDTO validacion = validarEdicionMovimiento(dto.id());
    if (!validacion.puedeEditar()) {
        throw new IllegalArgumentException("No se puede editar el movimiento: " + validacion.razon());
    }

    MovimientoInsumoLote movimiento = movimientoRepository.findById(dto.id())
            .orElseThrow(() -> new IllegalArgumentException("Movimiento no encontrado"));
    
    // ✅ AGREGAR: Si se cambió la fecha, revalidar con la nueva fecha
    LocalDate fechaOriginal = movimiento.getFecha();
    LocalDate fechaNueva = dto.fecha();
    
    if (!fechaOriginal.equals(fechaNueva)) {
        // La fecha cambió, revalidar contra producción con la nueva fecha
        for (DetalleMovimientoInsumo detalle : movimiento.getDetalles()) {
            Insumo insumo = detalle.getInsumo();
            
            // Verificar si hay producción DESPUÉS o EN LA MISMA fecha que la nueva fecha
            boolean hayProduccionPosterior = verificarUsoEnProduccionPosterior(insumo, fechaNueva);
            
            if (hayProduccionPosterior) {
                throw new IllegalArgumentException(
                    "No se puede cambiar la fecha del movimiento a " + fechaNueva + 
                    " porque el insumo '" + insumo.getNombre() + 
                    "' ya fue usado en producción en esa fecha o después."
                );
            }
            
            // Verificar si hay producción ANTES de la nueva fecha (inconsistencia histórica)
            boolean hayProduccionAnterior = verificarProduccionAnterior(insumo, fechaNueva);
            if (hayProduccionAnterior) {
                throw new IllegalArgumentException(
                    "No se puede cambiar la fecha del movimiento a " + fechaNueva + 
                    " porque hay producción de productos que usan el insumo '" + insumo.getNombre() + 
                    "' antes de esa fecha. Esto crearía una inconsistencia histórica."
                );
            }
        }
    }
    
    // ... resto del código
}
```

**Prioridad:** 🔴 CRÍTICA

---

### 🟡 MEDIO #4: `verificarSiHayProduccionConInsumo` solo se usa para insumos compuestos

**Ubicación:** `MovimientoInsumoLoteServiceImplements.java` línea 1158

**Problema:** Este método verifica si hay producción en CUALQUIER fecha (más estricto), pero solo se usa para insumos compuestos en ensambles. Para insumos simples, se usa `verificarUsoEnProduccionPosterior` que solo verifica producción DESPUÉS.

**Caso problemático:**
- Movimiento de entrada de insumo simple: `10/11/2025`
- Producción de producto: `05/11/2025` (usa el insumo, ANTES del movimiento)
- **Resultado:** `verificarUsoEnProduccionPosterior` no detecta esto porque solo busca `isAfter()`

**Solución:** Usar `verificarSiHayProduccionConInsumo` también para insumos simples, o crear una validación más completa.

**Prioridad:** 🟡 MEDIA

---

### 🟡 MEDIO #5: No se valida si al editar cantidad, el stock resultante sería negativo

**Ubicación:** `MovimientoInsumoLoteServiceImplements.java` línea 814 - `editarMovimientoInsumo`

**Problema:** Al editar la cantidad de un movimiento, se revierte el stock original y se aplica el nuevo, pero no se valida si el stock resultante sería suficiente para las producciones que ya usaron ese insumo.

**Caso problemático:**
1. Movimiento de entrada: 100 unidades
2. Producción usa 80 unidades
3. Usuario edita el movimiento a 50 unidades
4. **Resultado:** El stock quedaría en -30, pero la validación no lo detecta

**Solución:** Después de revertir stock, validar que el nuevo stock sea suficiente para todas las producciones que ya usaron el insumo.

**Prioridad:** 🟡 MEDIA

---

## 2. PROBLEMAS EN VALIDACIONES DE FECHAS

### 🔴 CRÍTICO #6: No hay validación de fechas extremas en creación de movimientos

**Ubicación:** 
- `MovimientoProductoLoteServiceImplements.java` línea 45 - `crearMovimientoProducto`
- `MovimientoInsumoLoteServiceImplements.java` línea 49 - `crearMovimientoInsumo`

**Problema:** No se valida que las fechas sean razonables (no muy antiguas ni muy futuras).

**Caso problemático:**
- Usuario crea movimiento con fecha: `01/01/1900` o `01/01/2100`
- **Resultado:** Se acepta, pero puede causar problemas en cálculos históricos

**Solución:**
```java
private void validarFecha(LocalDate fecha, String tipoMovimiento) {
    if (fecha == null) {
        throw new IllegalArgumentException("La fecha no puede ser nula para " + tipoMovimiento);
    }
    
    LocalDate hoy = LocalDate.now();
    LocalDate fechaMinima = hoy.minusYears(10); // No más de 10 años atrás
    LocalDate fechaMaxima = hoy.plusMonths(1);  // No más de 1 mes adelante
    
    if (fecha.isBefore(fechaMinima)) {
        throw new IllegalArgumentException(
            "La fecha no puede ser anterior a " + fechaMinima + 
            ". Por favor, verifica la fecha del movimiento."
        );
    }
    
    if (fecha.isAfter(fechaMaxima)) {
        throw new IllegalArgumentException(
            "La fecha no puede ser posterior a " + fechaMaxima + 
            ". Por favor, verifica la fecha del movimiento."
        );
    }
}

// Usar en crearMovimientoProducto y crearMovimientoInsumo:
validarFecha(dto.fecha(), "movimiento de " + dto.tipoMovimiento());
```

**Prioridad:** 🔴 CRÍTICA

---

### 🔴 CRÍTICO #7: No se valida fecha al editar movimiento de producto

**Ubicación:** `MovimientoProductoLoteServiceImplements.java` línea 197 - `editarMovimientoProducto`

**Problema:** Al editar un movimiento de producto, se puede cambiar la fecha sin validar:
1. Que la nueva fecha no sea extrema
2. Que la nueva fecha no rompa las validaciones históricas de insumos
3. Que la nueva fecha no sea antes de la primera producción (para SALIDA)

**Solución:** Agregar validaciones similares a las de creación, pero considerando la fecha original.

**Prioridad:** 🔴 CRÍTICA

---

### 🟡 MEDIO #8: Validación de fecha de vencimiento no valida que sea razonable

**Ubicación:** `MovimientoProductoLoteServiceImplements.java` línea 103

**Problema:** Se valida que la fecha de vencimiento sea futura, pero no que sea razonable (no 100 años en el futuro).

**Solución:**
```java
if (d.fechaVencimiento() != null) {
    LocalDate hoy = LocalDate.now();
    LocalDate fechaMaxima = dto.fecha().plusYears(10); // Máximo 10 años desde producción
    
    if (d.fechaVencimiento().isBefore(hoy)) {
        throw new IllegalArgumentException("La fecha de vencimiento debe ser futura");
    }
    if (d.fechaVencimiento().isAfter(fechaMaxima)) {
        throw new IllegalArgumentException("La fecha de vencimiento no puede ser más de 10 años después de la producción");
    }
}
```

**Prioridad:** 🟡 MEDIA

---

## 3. CASOS EDGE NO CUBIERTOS

### 🔴 CRÍTICO #9: Producción en la misma fecha que entrada de insumo

**Problema:** Si hay producción y entrada de insumo en la misma fecha, el orden importa. Si la producción es ANTES (en el día), usó stock que no existía.

**Caso problemático:**
- Entrada de insumo: `10/11/2025 14:00` (asumimos que es por la tarde)
- Producción de producto: `10/11/2025 10:00` (asumimos que es por la mañana)
- **Resultado:** La producción usó stock que no existía aún

**Solución:** Como no tenemos hora, debemos ser estrictos: si hay producción en la misma fecha que entrada de insumo, considerar que la producción es ANTES y bloquear.

**Implementación:**
```java
// En verificarUsoEnProduccionPosterior, cambiar:
movimientoProducto.getFecha().isAfter(fechaMovimiento) ||
movimientoProducto.getFecha().isEqual(fechaMovimiento) // ✅ AGREGAR esta línea
```

**Prioridad:** 🔴 CRÍTICA

---

### 🟡 MEDIO #10: Múltiples movimientos en la misma fecha

**Problema:** Si hay múltiples movimientos en la misma fecha, el orden de procesamiento puede afectar el stock histórico.

**Solución:** Considerar todos los movimientos de la misma fecha como un bloque y validar el stock resultante al final del día.

**Prioridad:** 🟡 MEDIA

---

### 🟡 MEDIO #11: Editar movimiento que ya fue parcialmente usado

**Problema:** Si un movimiento de entrada de 100 unidades ya fue usado parcialmente (ej: 30 unidades en producción), ¿se puede editar a 50 unidades?

**Solución:** Validar que la cantidad nueva sea suficiente para todas las producciones que ya usaron ese insumo.

**Prioridad:** 🟡 MEDIA

---

## 4. SOLUCIONES PROPUESTAS

### Resumen de Cambios Necesarios:

1. **Corregir `verificarUsoEnProduccionPosterior`** para incluir `isEqual()` (misma fecha)
2. **Agregar `verificarProduccionAnterior`** para detectar inconsistencias históricas
3. **Revalidar fecha al editar** movimiento de insumo
4. **Agregar validación de fechas extremas** en creación y edición
5. **Validar cantidad al editar** para asegurar stock suficiente
6. **Usar validación más estricta** (`verificarSiHayProduccionConInsumo`) para todos los casos

### Orden de Implementación:

1. 🔴 **PRIMERO:** Corregir `verificarUsoEnProduccionPosterior` (incluir `isEqual`)
2. 🔴 **SEGUNDO:** Agregar validación de fechas extremas
3. 🔴 **TERCERO:** Revalidar fecha al editar movimiento
4. 🟡 **CUARTO:** Agregar `verificarProduccionAnterior`
5. 🟡 **QUINTO:** Validar cantidad al editar

---

## 📝 NOTAS IMPORTANTES

- **Todas estas validaciones deben ser TRANSACCIONALES** para evitar race conditions
- **Los mensajes de error deben ser CLAROS** para que el usuario entienda por qué no puede editar/eliminar
- **Considerar agregar logging** para rastrear cuándo se bloquean operaciones por estas validaciones
- **Las validaciones deben ser CONSISTENTES** entre edición y eliminación

---

**¿Procedo a implementar estas correcciones?**

