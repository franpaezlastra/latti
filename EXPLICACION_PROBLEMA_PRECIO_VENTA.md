# 🔴 EXPLICACIÓN: Problema con Precio de Venta por Movimiento

## 📋 **EL PROBLEMA EN SIMPLE:**

Cuando vendes un producto, el precio que usaste en esa venta **NO SE GUARDA**. Solo se guarda el precio ACTUAL del producto. Entonces, si después cambias el precio del producto, **TODAS las ventas históricas mostrarán el precio nuevo**, perdiendo el precio real que se usó en cada venta.

---

## 🔍 **ANÁLISIS DEL CÓDIGO:**

### **1. La Entidad NO tiene el campo `precioVenta`**

```java
// ❌ stock/src/main/java/com/Latti/stock/modules/DetalleMovimientoProducto.java
@Entity
public class DetalleMovimientoProducto {
    @Id
    private Long id;
    private double cantidad;              // ✅ Se guarda
    private LocalDate fechaVencimiento;   // ✅ Se guarda
    private String lote;                  // ✅ Se guarda
    // ❌ FALTA: private Double precioVenta;  ← NO EXISTE
    
    @ManyToOne
    private Producto producto;            // ✅ Se guarda relación
}
```

**Problema:** No hay campo para guardar el precio de venta del movimiento.

---

### **2. Al Crear Movimiento: Se SOBRESCRIBE el precio del producto**

```java
// stock/src/main/java/com/Latti/stock/service/impl/MovimientoProductoLoteServiceImplements.java
// Líneas 187-194

if (dto.tipoMovimiento() == TipoMovimiento.SALIDA) {
    producto.setPrecioVenta(d.precioVenta());  // ❌ SOBRESCRIBE el precio del producto
}

productoRepository.save(producto);  // ❌ Guarda el producto con el precio nuevo

// Crear el detalle
DetalleMovimientoProducto detalle = new DetalleMovimientoProducto(
    d.cantidad(),
    producto
);
detalle.setFechaVencimiento(d.fechaVencimiento());
// ❌ NO se guarda detalle.setPrecioVenta(d.precioVenta()); porque no existe el campo
```

**Problema:** 
- El precio de venta se envía en el DTO (`d.precioVenta()`)
- Pero solo se usa para **actualizar el precio del producto**
- **NO se guarda en el detalle del movimiento**
- Si ya había ventas anteriores, pierden su precio original

---

### **3. Al Consultar Movimientos: Se usa el precio ACTUAL del producto**

```java
// stock/src/main/java/com/Latti/stock/service/impl/MovimientoProductoLoteServiceImplements.java
// Líneas 246-255

mov.getDetalles().stream().map(det ->
    new ResponseDetalleMovimientoProductoDTO(
        det.getProducto().getId(),
        det.getProducto().getNombre(),
        det.getCantidad(),
        det.getProducto().getPrecioInversion(),
        det.getProducto().getPrecioVenta(),  // ❌ PROBLEMA: Usa precio ACTUAL del producto
        det.getFechaVencimiento(),
        det.getLote()
    )
)
```

**Problema:** 
- Siempre devuelve `det.getProducto().getPrecioVenta()`
- Esto es el precio **ACTUAL** del producto, no el precio que se usó en esa venta

---

## 💥 **EJEMPLO REAL DEL PROBLEMA:**

### **Escenario:**

**1 de Noviembre 2025:**
- Creas producto "Café Frío" con precio de venta: **$500**
- Vendes 10 unidades a **$500 cada una** = $5,000 total
- ✅ Movimiento guardado correctamente

**5 de Noviembre 2025:**
- Cambias el precio del producto a **$600** (subió de precio)
- Vendes 5 unidades a **$600 cada una** = $3,000 total
- ✅ Movimiento guardado correctamente

**10 de Noviembre 2025:**
- Consultas el historial de ventas

### **¿Qué Debería Mostrar?**

```
Venta del 1 de Nov:
- Producto: Café Frío
- Cantidad: 10
- Precio Unitario: $500  ← Precio que se usó ese día
- Total: $5,000

Venta del 5 de Nov:
- Producto: Café Frío
- Cantidad: 5
- Precio Unitario: $600  ← Precio que se usó ese día
- Total: $3,000
```

### **¿Qué Muestra ACTUALMENTE? (INCORRECTO)**

```
Venta del 1 de Nov:
- Producto: Café Frío
- Cantidad: 10
- Precio Unitario: $600  ❌ INCORRECTO: Muestra precio ACTUAL, no el de ese día
- Total: $6,000          ❌ INCORRECTO: Cálculo incorrecto

Venta del 5 de Nov:
- Producto: Café Frío
- Cantidad: 5
- Precio Unitario: $600  ✅ Correcto (coincide con precio actual)
- Total: $3,000
```

### **Problemas:**

1. ❌ **Reporte financiero incorrecto:** Muestra que ganaste $6,000 en vez de $5,000 el 1 de Nov
2. ❌ **Pérdida de historial:** No puedes ver qué precio se usó realmente en cada venta
3. ❌ **Análisis imposible:** No puedes analizar cambios de precio a lo largo del tiempo
4. ❌ **Auditoría corrupta:** No hay trazabilidad real de precios

---

## 🔧 **LA SOLUCIÓN:**

### **1. Agregar campo `precioVenta` a la entidad**

```java
@Entity
public class DetalleMovimientoProducto {
    @Id
    private Long id;
    private double cantidad;
    private LocalDate fechaVencimiento;
    private String lote;
    private Double precioVenta;  // ✅ NUEVO: Guardar precio por movimiento
    
    @ManyToOne
    private Producto producto;
    
    // Getters y setters
    public Double getPrecioVenta() { return precioVenta; }
    public void setPrecioVenta(Double precioVenta) { this.precioVenta = precioVenta; }
}
```

### **2. Guardar `precioVenta` al crear movimiento**

```java
// En crearMovimientoProducto()

DetalleMovimientoProducto detalle = new DetalleMovimientoProducto(
    d.cantidad(),
    producto
);
detalle.setFechaVencimiento(d.fechaVencimiento());

// ✅ CORREGIDO: Guardar precio de venta SOLO si es SALIDA
if (dto.tipoMovimiento() == TipoMovimiento.SALIDA) {
    detalle.setPrecioVenta(d.precioVenta());  // ✅ Guardar precio del movimiento
    // Opcional: Actualizar también el precio del producto (para futuras ventas)
    producto.setPrecioVenta(d.precioVenta());
}
```

### **3. Usar precio del detalle al consultar**

```java
// En obtenerMovimientosDTO()

mov.getDetalles().stream().map(det ->
    new ResponseDetalleMovimientoProductoDTO(
        det.getProducto().getId(),
        det.getProducto().getNombre(),
        det.getCantidad(),
        det.getProducto().getPrecioInversion(),
        // ✅ CORREGIDO: Usar precio del detalle si existe, sino el del producto
        det.getPrecioVenta() != null ? det.getPrecioVenta() : det.getProducto().getPrecioVenta(),
        det.getFechaVencimiento(),
        det.getLote()
    )
)
```

---

## 📊 **IMPACTO:**

### **Sin la corrección:**
- ❌ Reportes financieros incorrectos
- ❌ Imposible analizar cambios de precios
- ❌ Pérdida de trazabilidad
- ❌ Auditoría corrupta

### **Con la corrección:**
- ✅ Historial de precios preservado
- ✅ Reportes financieros precisos
- ✅ Análisis de precios históricos posible
- ✅ Auditoría completa y correcta

---

## 🎯 **CONCLUSIÓN:**

El problema es que **el precio de venta NO se está guardando en el detalle del movimiento**. Solo se actualiza el precio del producto, pero esto afecta a todas las ventas históricas porque cuando consultas, siempre usa el precio actual del producto.

**Esto es CRÍTICO porque afecta la integridad de los datos históricos y los reportes financieros.**

¿Quieres que implemente la solución ahora?

