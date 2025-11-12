# 🔴 PROBLEMA CRÍTICO: Falta Validación de Lotes en Edición/Eliminación

**Problema:** Actualmente NO se valida si hay movimientos de salida que usan el mismo lote antes de editar/eliminar un movimiento de entrada.

**Impacto:** Si hay una salida de un lote específico, se puede eliminar/editar el movimiento de entrada que creó ese lote, rompiendo la integridad de los datos.

**Solución:** Agregar validaciones que verifiquen si hay salidas posteriores que usan el mismo lote.

