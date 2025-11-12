# 🔍 REVISIÓN DE ERRORES EN EL FRONTEND

**Fecha:** 2025-01-XX  
**Objetivo:** Identificar y corregir errores en el frontend, especialmente relacionados con filtrado de insumos

---

## 🔴 ERRORES ENCONTRADOS Y CORREGIDOS

### 1. ERROR #1: Filtrado de insumos en modal de edición (CORREGIDO)

**Problema:**
- Al **crear** un movimiento de insumo, solo aparecen insumos BASE (correcto)
- Al **editar** un movimiento de insumo, aparecen TODOS los insumos, incluyendo COMPUESTOS (incorrecto)

**Ubicación:**
- `EditarMovimientoInsumoModal.jsx` línea 464-472

**Código anterior (incorrecto):**
```javascript
{insumos && insumos.length > 0 ? (
  insumos.map((insumo) => {
    // ❌ No filtra, muestra TODOS los insumos
    const tipoTexto = insumo.tipo === 'COMPUESTO' ? ' (Compuesto)' : ' (Base)';
    return (
      <option key={insumo.id} value={insumo.id}>
        {insumo.nombre}{tipoTexto} ({insumo.unidadMedida})
      </option>
    );
  })
```

**Código corregido:**
```javascript
{insumos && insumos.length > 0 ? (
  insumos
    .filter(i => i.tipo === 'BASE' || !i.tipo) // ✅ Solo insumos base o sin tipo (compatibilidad)
    .map((insumo) => {
      const tipoTexto = insumo.tipo === 'COMPUESTO' ? ' (Compuesto)' : ' (Base)';
      return (
        <option key={insumo.id} value={insumo.id}>
          {insumo.nombre}{tipoTexto} ({insumo.unidadMedida})
        </option>
      );
    })
```

**Razón:**
- Los movimientos de insumos simples solo deben permitir insumos BASE
- Los insumos COMPUESTOS se manejan a través de "Ensamblar", no de movimientos simples
- Esto mantiene la consistencia con el modal de creación

**Estado:** ✅ CORREGIDO

---

### 2. ERROR #2: Tipo de movimiento editable (CORREGIDO)

**Problema:**
- El campo "Tipo de Movimiento" estaba habilitado para editar
- El backend NO permite cambiar el tipo de movimiento
- Esto causaba errores al intentar guardar

**Ubicación:**
- `EditarMovimientoInsumoModal.jsx` línea 385-394

**Corrección aplicada:**
- Campo deshabilitado permanentemente
- Validación adicional en `onChange` para prevenir cambios
- Mensaje informativo para el usuario

**Código corregido:**
```javascript
<select
  value={tipoMovimiento}
  onChange={(e) => {
    // ✅ CRÍTICO: No se puede cambiar el tipo de movimiento
    if (e.target.value !== movimiento.tipoMovimiento) {
      setError("No se puede cambiar el tipo de movimiento. El tipo debe permanecer igual.");
      return;
    }
    setTipoMovimiento(e.target.value);
  }}
  disabled={!validacion?.puedeEditar || true} // ✅ Siempre deshabilitado
>
```

**Estado:** ✅ CORREGIDO

---

### 3. ERROR #3: Filtrado de insumos en modal de edición de ensambles (CORREGIDO)

**Problema:**
- Al editar un movimiento de ensamble (insumo compuesto), el modal mostraba todos los insumos BASE
- Debería mostrar solo el insumo compuesto específico del ensamble
- No debería permitir agregar/eliminar detalles ni cambiar el insumo en movimientos de ensamble

**Ubicación:**
- `EditarMovimientoInsumoModal.jsx` líneas 29-55, 505-526, 447-460

**Corrección aplicada:**
1. **Detección de movimientos de ensamble:** Se agregó lógica para detectar si un movimiento es de ensamble verificando si algún detalle tiene `ensambleId`
2. **Filtrado inteligente:** Si es ensamble, muestra solo el insumo compuesto específico; si no, muestra solo insumos BASE
3. **Restricciones de edición:** En movimientos de ensamble:
   - No se puede agregar nuevos detalles
   - No se puede eliminar detalles existentes
   - No se puede cambiar el insumo (solo cantidad y precio)
   - Se muestra un indicador visual de que es un ensamble

**Código agregado:**
```javascript
// Detectar si es un movimiento de ensamble
const esMovimientoEnsamble = React.useMemo(() => {
  if (!movimiento || !movimiento.detalles) return false;
  return movimiento.detalles.some(detalle => 
    detalle.ensambleId != null && detalle.ensambleId.trim() !== ''
  );
}, [movimiento]);

// Obtener el insumo compuesto del ensamble
const insumoCompuestoEnsamble = React.useMemo(() => {
  // ... lógica para encontrar el insumo compuesto
}, [esMovimientoEnsamble, movimiento, insumos]);
```

**Estado:** ✅ CORREGIDO

---

### 4. ERROR #4: Modal único para editar movimientos simples y compuestos (CORREGIDO)

**Problema:**
- Se usaba el mismo modal (`EditarMovimientoInsumoModal`) para editar movimientos simples y movimientos de ensamble
- Al editar un movimiento de ensamble, aparecían insumos simples en el dropdown
- La estructura de edición de ensambles es diferente (solo cantidad, no se puede cambiar el insumo ni los componentes)

**Solución:**
- Se creó un modal separado `EditarMovimientoEnsambleModal.jsx` específico para ensambles
- Se modificó `MovementsPage.jsx` para detectar si es un movimiento de ensamble y usar el modal correcto
- El modal de ensamble solo permite editar cantidad, fecha y descripción
- El insumo compuesto se muestra como solo lectura
- Se muestra la receta del insumo compuesto para referencia

**Ubicación:**
- `EditarMovimientoEnsambleModal.jsx` (nuevo archivo)
- `MovementsPage.jsx` líneas 247-300

**Características del nuevo modal:**
1. **Diseño específico:** Tema púrpura/índigo para diferenciarlo de movimientos simples
2. **Campos editables:** Solo cantidad, fecha y descripción
3. **Insumo compuesto:** Mostrado como solo lectura (no se puede cambiar)
4. **Receta visible:** Muestra los componentes del ensamble para referencia
5. **Validación:** Usa la misma validación del backend que el modal de movimientos simples

**Código clave:**
```javascript
// Detección de ensamble en MovementsPage.jsx
const esEnsamble = (movimientoOriginal.detalles || movimientoOriginal.insumos || []).some(detalle => 
  detalle.ensambleId != null && detalle.ensambleId.trim() !== ''
);

// Usar el modal correcto
if (esEnsamble) {
  setMovimientoAEditarEnsamble(movimientoParaEditar);
  openModal('editEnsamble');
} else {
  setMovimientoAEditar(movimientoParaEditar);
  openModal('edit');
}
```

**Estado:** ✅ CORREGIDO

---

## 🔍 REVISIÓN ADICIONAL

### 2. Verificación de otros modales

**MovimientoInsumoModal.jsx (Crear):**
- ✅ **CORRECTO:** Filtra solo insumos BASE (línea 434)
```javascript
.filter(i => i.tipo === 'BASE' || !i.tipo)
```

**MovimientoInsumoCompuestoModal.jsx (Ensamble):**
- ✅ **CORRECTO:** Filtra solo insumos COMPUESTOS (línea 32)
```javascript
const insumosCompuestos = (insumos || []).filter(insumo => insumo.tipo === 'COMPUESTO');
```

**ProductoCreateModal.jsx:**
- ✅ **CORRECTO:** Tiene lógica compleja para filtrar componentes de compuestos (línea 18-46)
- Muestra insumos BASE y COMPUESTOS (correcto para recetas de productos)

**ProductoEditModal.jsx:**
- ✅ **CORRECTO:** Misma lógica que ProductoCreateModal (línea 18-46)

**EditarMovimientoProductoModal.jsx:**
- ✅ **CORRECTO:** No filtra productos (correcto, todos los productos pueden editarse)

---

## ⚠️ POSIBLES PROBLEMAS ADICIONALES A REVISAR

### 3. Validación de tipo de movimiento al editar

**Pregunta:** ¿Se puede cambiar el tipo de movimiento al editar?

**Revisión necesaria:**
- Verificar si el backend permite cambiar el tipo
- Verificar si el frontend bloquea el cambio

**Estado:** 🔍 PENDIENTE DE REVISIÓN

---

### 4. Validación de insumos duplicados

**Revisión:**
- ✅ MovimientoInsumoModal: Valida duplicados (línea 148-154)
- ✅ EditarMovimientoInsumoModal: Filtra duplicados antes de enviar (línea 210-212)

**Estado:** ✅ CORRECTO

---

### 5. Validación de cantidades y precios

**Revisión:**
- ✅ MovimientoInsumoModal: Valida cantidades > 0 (línea 139)
- ✅ MovimientoInsumoModal: Valida precio para ENTRADA (línea 159)
- ✅ EditarMovimientoInsumoModal: Usa Input type="number" con min="0"

**Estado:** ✅ CORRECTO

---

### 6. Manejo de errores

**Revisión:**
- ✅ MovimientoInsumoModal: Maneja errores correctamente (línea 218-244)
- ✅ EditarMovimientoInsumoModal: Muestra errores (línea 528-532)

**Estado:** ✅ CORRECTO

---

## 📊 RESUMEN

### ✅ CORREGIDO:
1. **Filtrado de insumos en modal de edición** - Ahora solo muestra insumos BASE (no compuestos)
2. **Tipo de movimiento editable** - Ahora está bloqueado para cambios
3. **Modal separado para ensambles** - Se creó `EditarMovimientoEnsambleModal.jsx` específico para movimientos de ensamble
4. **Detección automática de tipo** - El sistema detecta automáticamente si es ensamble y usa el modal correcto

### ✅ VERIFICADO Y CORRECTO:
1. Filtrado en modal de creación
2. Filtrado en modal de ensamble
3. Validación de duplicados
4. Validación de cantidades/precios
5. Manejo de errores

### ✅ TODOS LOS PROBLEMAS CORREGIDOS

---

## 🎯 RECOMENDACIONES

### 1. Agregar validación de tipo de movimiento

**Sugerencia:** Bloquear el cambio de tipo de movimiento en el frontend si el backend no lo permite.

**Ubicación:** `EditarMovimientoInsumoModal.jsx`

**Código sugerido:**
```javascript
<select
  value={tipoMovimiento}
  onChange={(e) => {
    // ✅ Validar que no se cambie el tipo
    if (e.target.value !== movimiento.tipoMovimiento) {
      setError("No se puede cambiar el tipo de movimiento");
      return;
    }
    setTipoMovimiento(e.target.value);
  }}
  disabled={!validacion?.puedeEditar || tipoMovimiento !== movimiento.tipoMovimiento}
>
```

**Prioridad:** 🟡 MEDIA

---

## ✅ CONCLUSIÓN

**Error principal encontrado y corregido:**
- ✅ Filtrado de insumos en modal de edición

**Otros aspectos verificados:**
- ✅ Filtrado en otros modales: Correcto
- ✅ Validaciones: Correctas
- ✅ Manejo de errores: Correcto

**El frontend está ahora consistente con el backend en cuanto a filtrado de insumos.**

