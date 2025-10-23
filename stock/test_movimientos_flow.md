# 🧪 Test de Flujo de Movimientos

## **Escenario de Prueba:**

### **1. Movimiento de Entrada de Insumos (EDITABLE)**
```
Fecha: 2024-01-15
Tipo: ENTRADA
Insumos:
- Café: 2000g a $5000
- Edulcorante: 2000g a $3000  
- Vainilla: 100ml a $500
```

**✅ Debe ser EDITABLE** porque:
- No hay movimientos posteriores
- No se han usado en producción aún
- No es un movimiento de ensamble

### **2. Edición del Movimiento (DEBE FUNCIONAR)**
```
Cambios:
- Café: 3000g a $5500 (era 2000g a $5000)
- Vainilla: 150ml a $300 (era 100ml a $500)
```

**✅ Debe permitir editar** y actualizar:
- Stock de insumos
- Precios de compra
- Fecha y descripción

### **3. Movimiento de Entrada de Productos (USA INSUMOS)**
```
Fecha: 2024-01-20
Tipo: ENTRADA
Producto: Café Suave
Cantidad: 20 unidades
Receta por unidad:
- Café: 13g
- Edulcorante: 2g
- Vainilla: 5ml
```

**Efecto en insumos:**
- Café: 3000g - (20 × 13g) = 2740g
- Edulcorante: 2000g - (20 × 2g) = 1960g
- Vainilla: 150ml - (20 × 5ml) = 50ml

### **4. Intento de Editar Movimiento de Insumos (NO DEBE FUNCIONAR)**
```
Intento: Editar movimiento de entrada de insumos del paso 1
Resultado esperado: ❌ ERROR
Mensaje: "El insumo 'Café' ha sido usado en la producción de productos después de este movimiento"
```

### **5. Eliminación de Movimiento de Productos (DEBE RESTAURAR INSUMOS)**
```
Acción: Eliminar movimiento de entrada de productos del paso 3
Resultado esperado: ✅ ÉXITO
Efecto en insumos:
- Café: 2740g + (20 × 13g) = 3000g
- Edulcorante: 1960g + (20 × 2g) = 2000g  
- Vainilla: 50ml + (20 × 5ml) = 150ml
```

### **6. Después de Eliminar Productos (MOVIMIENTO DE INSUMOS DEBE SER EDITABLE)**
```
Acción: Intentar editar movimiento de entrada de insumos del paso 1
Resultado esperado: ✅ ÉXITO
Razón: Ya no se han usado en producción
```

## **🔍 Validaciones Implementadas:**

### **✅ Movimientos de Insumos EDITABLES cuando:**
- No hay movimientos posteriores del mismo insumo
- No se han usado en producción de productos después de la fecha
- No hay movimientos de salida posteriores
- No es un movimiento de ensamble

### **❌ Movimientos de Insumos NO EDITABLES cuando:**
- Hay movimientos posteriores del mismo insumo
- Se han usado en producción de productos después de la fecha
- Hay movimientos de salida posteriores
- Es un movimiento de ensamble

### **✅ Movimientos de Productos:**
- Se pueden eliminar siempre
- Al eliminar, restauran automáticamente los insumos usados
- No afectan la editabilidad de movimientos de insumos anteriores

## **🎯 Casos de Uso Cubiertos:**

1. **Edición de entrada de insumos** ✅
2. **Producción de productos** ✅  
3. **Protección contra edición después de uso** ✅
4. **Eliminación de productos con restauración** ✅
5. **Re-editabilidad después de eliminar productos** ✅
