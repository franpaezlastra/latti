# 🔍 REVISIÓN COMPLETA DE VALIDACIONES DE EDICIÓN/ELIMINACIÓN DE MOVIMIENTOS

**Fecha:** 2025-01-XX  
**Prioridad:** 🔴 CRÍTICA  
**Objetivo:** Identificar TODOS los casos donde debe bloquearse edición/eliminación de movimientos

---

## 📋 ÍNDICE DE TIPOS DE MOVIMIENTOS

1. [MOVIMIENTOS DE INSUMOS](#1-movimientos-de-insumos)
2. [MOVIMIENTOS DE PRODUCTOS](#2-movimientos-de-productos)
3. [MOVIMIENTOS DE ENSAMBLES](#3-movimientos-de-ensambles)
4. [VALIDACIONES CRUZADAS](#4-validaciones-cruzadas)

---

## 1. MOVIMIENTOS DE INSUMOS

### 1.1 MOVIMIENTO ENTRADA DE INSUMO (Simple)

#### ✅ VALIDACIONES ACTUALES (editarMovimientoInsumo):
- ✅ No hay movimientos posteriores del mismo insumo
- ✅ No se ha usado en producción de productos DESPUÉS
- ✅ No hay movimientos de salida posteriores
- ✅ No fue usado en un ensamble DESPUÉS
- ✅ Validación especial para movimientos de ensamble

#### ✅ VALIDACIONES ACTUALES (eliminarMovimientoInsumo):
- ✅ No hay movimientos posteriores del mismo insumo
- ✅ No se ha usado en producción de productos DESPUÉS o EN LA MISMA FECHA
- ✅ No fue usado en un ensamble DESPUÉS o EN LA MISMA FECHA
- ✅ Stock suficiente para revertir
- ✅ Validación especial para movimientos de ensamble

#### 🔴 PROBLEMA ENCONTRADO #1: Falta validar producción en la MISMA FECHA en edición
**Ubicación:** `validarEdicionMovimiento` línea 507

**Problema:** Solo verifica `isAfter()`, no `isEqual()`

**Solución:** Ya corregido en `verificarUsoEnProduccionPosterior` (incluye `isEqual()`)

#### 🟡 PROBLEMA ENCONTRADO #2: Falta validar producción ANTES de la fecha del movimiento
**Problema:** Si hay producción ANTES de la fecha del movimiento, significa inconsistencia histórica, pero no se valida.

**Solución:** Ya agregado método `verificarProduccionAnterior` pero NO se usa en validación de edición/eliminación.

**Acción:** Agregar validación de producción anterior.

---

### 1.2 MOVIMIENTO SALIDA DE INSUMO (Simple)

#### ❌ PROBLEMA CRÍTICO #3: NO HAY MÉTODO PARA EDITAR SALIDAS DE INSUMOS
**Problema:** El método `editarMovimientoInsumo` NO valida el tipo de movimiento. Solo valida si se puede editar, pero no distingue entre ENTRADA y SALIDA.

**Análisis:** Revisando el código, veo que `editarMovimientoInsumo` llama a `validarEdicionMovimiento` que valida ambos tipos. Pero necesito verificar si hay restricciones específicas para SALIDA.

#### ❌ PROBLEMA CRÍTICO #4: NO HAY VALIDACIÓN ESPECÍFICA PARA ELIMINAR SALIDAS DE INSUMOS
**Problema:** `eliminarMovimientoInsumo` NO tiene validaciones específicas para SALIDA. Solo valida para ENTRADA (stock suficiente para revertir).

**Caso problemático:**
- Movimiento SALIDA de insumo usado en producción
- Se elimina la SALIDA
- El stock del insumo aumenta, pero la producción ya usó ese insumo
- **Resultado:** Inconsistencia

**Solución:** Agregar validación para SALIDA:
- Verificar si hay producción que usó ese insumo DESPUÉS de la fecha de la salida
- Si la salida fue parte de un ensamble, ya está validado

---

## 2. MOVIMIENTOS DE PRODUCTOS

### 2.1 MOVIMIENTO ENTRADA DE PRODUCTO (Producción)

#### ✅ VALIDACIONES ACTUALES (editarMovimientoProducto):
- ✅ Solo permite editar ENTRADA (bloquea SALIDA)
- ✅ No hay movimientos de salida que usen los lotes (posteriores o misma fecha)
- ✅ Revalida stock histórico de insumos si cambia la fecha
- ✅ Valida fecha extrema

#### ✅ VALIDACIONES ACTUALES (eliminarMovimientoProducto):
- ✅ No hay movimientos de salida que usen los lotes (posteriores o misma fecha)
- ✅ Stock suficiente para revertir
- ✅ Restaura insumos correctamente

#### 🟡 PROBLEMA ENCONTRADO #5: No valida salidas SIN lote especificado
**Problema:** Si hay una salida genérica (sin lote) que usa stock del lote, no se detecta.

**Nota:** Esto es difícil de validar porque no hay relación directa. La validación de stock total debería ser suficiente.

---

### 2.2 MOVIMIENTO SALIDA DE PRODUCTO (Venta)

#### ❌ PROBLEMA CRÍTICO #6: NO SE PUEDE EDITAR SALIDAS DE PRODUCTOS
**Ubicación:** `editarMovimientoProducto` línea 262

**Código actual:**
```java
if (movimientoOriginal.getTipoMovimiento() != TipoMovimiento.ENTRADA) {
    throw new IllegalArgumentException("Solo se pueden editar movimientos de entrada (producción)");
}
```

**Análisis:** Esto está bien si es una decisión de negocio, pero debería documentarse.

#### ❌ PROBLEMA CRÍTICO #7: NO HAY VALIDACIONES AL ELIMINAR SALIDAS DE PRODUCTOS
**Ubicación:** `eliminarMovimientoProducto` línea 428

**Problema:** Al eliminar una SALIDA, solo se suma al stock, pero NO se valida:
- Si hay otras salidas posteriores que dependen de esta
- Si el lote ya no existe (si se eliminó la entrada)
- Si hay inconsistencias históricas

**Caso problemático:**
1. Entrada: 100 unidades lote LOTE-1
2. Salida 1: 50 unidades lote LOTE-1 (fecha 10/11)
3. Salida 2: 30 unidades lote LOTE-1 (fecha 15/11)
4. Se elimina Salida 1
5. **Resultado:** El stock del lote queda incorrecto

**Solución:** Agregar validación para SALIDA:
- Verificar que el lote aún exista
- Verificar que no haya inconsistencias en el stock del lote

---

## 3. MOVIMIENTOS DE ENSAMBLES

### 3.1 MOVIMIENTO ENTRADA DE INSUMO COMPUESTO (Resultado del Ensamble)

#### ✅ VALIDACIONES ACTUALES:
- ✅ No se puede editar/eliminar si se usó en producción
- ✅ Validación especial en `validarEdicionMovimiento` y `validarEliminacionMovimiento`

### 3.2 MOVIMIENTO SALIDA DE INSUMO SIMPLE (Usado en Ensamble)

#### ✅ VALIDACIONES ACTUALES:
- ✅ No se puede editar/eliminar directamente (debe hacerse desde el ensamble)
- ✅ Validación en `validarEdicionMovimiento` y `validarEliminacionMovimiento`

---

## 4. VALIDACIONES CRUZADAS

### 4.1 INSUMO → PRODUCTO

#### ✅ VALIDADO:
- ✅ No se puede editar/eliminar entrada de insumo si se usó en producción DESPUÉS o EN LA MISMA FECHA

#### 🟡 FALTA:
- ⚠️ No se valida si hay producción ANTES (inconsistencia histórica)

### 4.2 PRODUCTO → LOTE

#### ✅ VALIDADO:
- ✅ No se puede editar/eliminar entrada de producto si hay salidas del mismo lote

#### 🟡 FALTA:
- ⚠️ No se valida si la salida es genérica (sin lote)

### 4.3 ENSAMBLE → PRODUCCIÓN

#### ✅ VALIDADO:
- ✅ No se puede editar/eliminar ensamble si el insumo compuesto se usó en producción

---

## 📊 RESUMEN DE PROBLEMAS ENCONTRADOS

### 🔴 CRÍTICOS (Implementar inmediatamente):

1. **Falta validar producción ANTES en edición/eliminación de insumos**
   - Agregar `verificarProduccionAnterior` en validaciones

2. **Falta validar al eliminar SALIDAS de productos**
   - Verificar que el lote aún exista
   - Verificar consistencia de stock

3. **Falta validar al eliminar SALIDAS de insumos**
   - Verificar si hay producción que dependa de esa salida

### 🟡 MEDIOS (Implementar pronto):

4. **No se valida producción en la MISMA FECHA en algunas validaciones**
   - Ya corregido en `verificarUsoEnProduccionPosterior`, pero verificar que se use en todos lados

5. **No se valida salidas genéricas (sin lote) al editar/eliminar entradas**
   - Difícil de validar, pero considerar

---

## 🎯 PLAN DE ACCIÓN

### Fase 1: Correcciones Críticas
1. Agregar `verificarProduccionAnterior` en validaciones de edición/eliminación de insumos
2. Agregar validaciones al eliminar SALIDAS de productos
3. Agregar validaciones al eliminar SALIDAS de insumos

### Fase 2: Mejoras
4. Revisar todas las validaciones para incluir `isEqual()` donde falte
5. Documentar decisiones de negocio (por qué no se pueden editar SALIDAS de productos)

---

**¿Procedo a implementar las correcciones críticas?**

