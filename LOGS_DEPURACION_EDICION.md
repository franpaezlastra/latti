# 🔍 Logs de Depuración para Edición de Movimientos

## 📋 Logs Implementados

He agregado logs detallados en todo el flujo de edición para identificar exactamente dónde está el problema de duplicación.

### 🎨 **Frontend (EditarMovimientoInsumoModal.jsx)**

#### Al abrir el modal:
```javascript
console.log('🔍 Movimiento recibido:', movimiento);
console.log('📦 Detalles del movimiento:', movimiento.detalles);
console.log('✅ Detalles formateados:', detallesFormateados);
```

#### Al enviar el formulario:
```javascript
console.log('🔍 === INICIO DE EDICIÓN ===');
console.log('📦 Movimiento original:', movimiento);
console.log('📝 Datos del formulario:');
console.log('  - Fecha:', fecha);
console.log('  - Descripción:', descripcion);
console.log('  - Tipo:', tipoMovimiento);
console.log('  - Detalles:', detalles);
console.log('📤 Objeto que se envía al backend:', movimientoData);
console.log('🔢 Detalles mapeados:', movimientoData.detalles);
console.log('🔑 Token de autenticación:', token ? 'Presente' : 'Ausente');
console.log('📡 Respuesta del servidor:', response.status, response.statusText);
console.log('✅ Respuesta exitosa:', responseData);
console.log('🔄 Recargando movimientos...');
console.log('🎉 Edición completada exitosamente');
```

### 🔧 **Backend (MovimientoInsumoController.java)**

#### Al recibir la petición:
```java
System.out.println("🔍 === BACKEND: INICIO DE EDICIÓN ===");
System.out.println("📦 ID del movimiento: " + id);
System.out.println("📝 DTO recibido: " + dto);
System.out.println("📅 Fecha: " + dto.fecha());
System.out.println("📄 Descripción: " + dto.descripcion());
System.out.println("🔄 Tipo: " + dto.tipoMovimiento());
System.out.println("📋 Detalles: " + dto.detalles());
System.out.println("✅ DTO con ID corregido: " + dtoConId);
System.out.println("🎉 Movimiento editado exitosamente: " + movimiento.getId());
```

### ⚙️ **Servicio (MovimientoInsumoLoteServiceImplements.java)**

#### Proceso de edición:
```java
System.out.println("🔍 === SERVICIO: INICIO DE EDICIÓN ===");
System.out.println("📦 ID del movimiento: " + dto.id());
System.out.println("📋 Detalles a editar: " + dto.detalles());
System.out.println("📦 Movimiento encontrado: " + movimiento.getId());
System.out.println("📋 Detalles actuales: " + movimiento.getDetalles().size());
System.out.println("🔄 Revirtiendo movimiento original...");
System.out.println("  - Revirtiendo insumo: " + insumo.getNombre() + " cantidad: " + detalle.getCantidad());
System.out.println("🗑️ Limpiando detalles existentes...");
System.out.println("📝 Actualizando datos básicos del movimiento...");
System.out.println("➕ Aplicando nuevos detalles...");
System.out.println("  - Procesando detalle: insumoId=" + detalleDto.insumoId() + 
                   ", cantidad=" + detalleDto.cantidad() + ", precio=" + detalleDto.precio());
System.out.println("    - Insumo encontrado: " + insumo.getNombre());
System.out.println("    - Aplicando cambios al stock...");
System.out.println("      - Stock actualizado: " + insumo.getStockActual());
System.out.println("    - Creando nuevo detalle...");
System.out.println("      - Detalle agregado al movimiento");
System.out.println("💾 Guardando movimiento actualizado...");
System.out.println("✅ Movimiento guardado con ID: " + movimientoActualizado.getId());
System.out.println("📋 Detalles finales: " + movimientoActualizado.getDetalles().size());
System.out.println("🔄 Recalculando precios de inversión...");
System.out.println("🎉 Edición completada exitosamente");
```

## 🚀 Cómo Usar los Logs

### 1. **Abrir DevTools del Navegador**
- F12 o clic derecho → "Inspeccionar"
- Ir a la pestaña "Console"

### 2. **Abrir el Modal de Edición**
- Hacer clic en "Editar" en un movimiento de insumo
- Ver los logs de inicialización

### 3. **Hacer una Edición**
- Modificar algún dato en el formulario
- Hacer clic en "Guardar Cambios"
- Observar todos los logs del proceso

### 4. **Revisar Logs del Backend**
- Los logs del backend aparecerán en la consola del servidor
- Si usas Spring Boot, aparecerán en la terminal donde ejecutas la aplicación

## 🔍 Qué Buscar en los Logs

### **Problemas Potenciales:**

1. **Detalles vacíos al cargar:**
   ```
   📦 Detalles del movimiento: []
   ```
   → El movimiento no tiene detalles cargados

2. **Mapeo incorrecto:**
   ```
   ✅ Detalles formateados: [{insumoId: undefined, ...}]
   ```
   → Los IDs de insumos no se están mapeando correctamente

3. **Duplicación en el backend:**
   ```
   📋 Detalles actuales: 5
   📋 Detalles finales: 10
   ```
   → Se están agregando detalles en lugar de reemplazarlos

4. **Problema de limpieza:**
   ```
   🗑️ Limpiando detalles existentes...
   📋 Detalles finales: 5
   ```
   → Los detalles no se están limpiando correctamente

## 📊 Información que Proporcionan los Logs

- **Estructura de datos** que llega del frontend
- **Mapeo correcto** de los detalles
- **Proceso de reversión** del movimiento original
- **Limpieza de detalles** existentes
- **Aplicación de nuevos detalles**
- **Guardado final** del movimiento

## 🎯 Próximos Pasos

1. **Ejecutar una edición** con los logs activados
2. **Revisar la consola** del navegador
3. **Revisar la consola** del servidor
4. **Identificar dónde** se está produciendo la duplicación
5. **Aplicar la corrección** específica

**¡Los logs están listos para identificar el problema de duplicación!** 🔍
