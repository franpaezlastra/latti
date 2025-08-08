# Patrón de Manejo de Peticiones con Redux Toolkit

## 🏗️ Estructura Implementada

### 📁 Organización de Archivos

```
src/store/
├── actions/
│   ├── insumoActions.js
│   ├── movimientoInsumoActions.js
│   ├── movimientoProductoActions.js
│   └── productosActions.js
├── reducers/
│   ├── insumosReducer.js
│   ├── movimientoInsumoReducer.js
│   ├── movimientoProductoReducer.js
│   └── productosReducer.js
├── slices/
│   └── authSlice.js
└── index.js
```

## 🎯 Características del Patrón

### ✅ **Ventajas Implementadas:**

1. **Separación de Responsabilidades**
   - Actions: Lógica de peticiones HTTP
   - Reducers: Manejo de estado
   - Components: UI y dispatch

2. **Manejo Automático de Estados**
   - `pending`: Loading state
   - `fulfilled`: Success state
   - `rejected`: Error state

3. **Gestión de Errores Centralizada**
   - Errores manejados en `api.js`
   - Toast notifications automáticas
   - Estados de error en cada reducer

4. **Optimistic Updates**
   - Actualización inmediata del UI
   - Rollback automático en caso de error

## 📝 Ejemplo de Uso

### 🔧 **En un Componente:**

```jsx
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loadInsumos, createInsumo } from '../store/actions/insumoActions.js';

const InsumosComponent = () => {
  const dispatch = useDispatch();
  const { insumos, status, error, createStatus } = useSelector((state) => state.insumos);

  useEffect(() => {
    dispatch(loadInsumos());
  }, [dispatch]);

  const handleCreate = async (data) => {
    try {
      await dispatch(createInsumo(data)).unwrap();
      // Recargar lista después de crear
      dispatch(loadInsumos());
    } catch (error) {
      // Error manejado automáticamente por api.js
    }
  };

  if (status === 'loading') return <div>Cargando...</div>;
  if (status === 'failed') return <div>Error: {error}</div>;

  return (
    <div>
      {insumos.map(insumo => (
        <div key={insumo.id}>{insumo.nombre}</div>
      ))}
    </div>
  );
};
```

## 🚀 **Actions Disponibles**

### 📦 **Insumos:**
- `loadInsumos()` - Cargar todos los insumos
- `createInsumo(data)` - Crear nuevo insumo
- `deleteInsumo(id)` - Eliminar insumo
- `updateInsumo({id, data})` - Actualizar insumo

### 📦 **Productos:**
- `loadProductos()` - Cargar todos los productos
- `getProductoById(id)` - Obtener producto por ID
- `crearProducto(data)` - Crear nuevo producto
- `deleteProducto(id)` - Eliminar producto
- `updateProducto({id, data})` - Actualizar producto

### 📦 **Movimientos de Insumos:**
- `loadMovimientosInsumo()` - Cargar movimientos
- `createMovimientoInsumo(data)` - Crear movimiento
- `deleteMovimientoInsumo(id)` - Eliminar movimiento

### 📦 **Movimientos de Productos:**
- `loadMovimientosProducto()` - Cargar movimientos
- `createMovimientoProducto(data)` - Crear movimiento
- `deleteMovimientoProducto(id)` - Eliminar movimiento

## 🎨 **Estados Disponibles**

### 📊 **Estado de Insumos:**
```javascript
{
  insumos: [],
  status: "idle" | "loading" | "succeeded" | "failed",
  error: null | string,
  createStatus: "idle" | "loading" | "succeeded" | "failed",
  createError: null | string,
  deleteStatus: "idle" | "loading" | "succeeded" | "failed",
  deleteError: null | string,
  updateStatus: "idle" | "loading" | "succeeded" | "failed",
  updateError: null | string
}
```

### 📊 **Estado de Productos:**
```javascript
{
  productos: [],
  productoSeleccionado: null,
  status: "idle" | "loading" | "succeeded" | "failed",
  error: null | string,
  createStatus: "idle" | "loading" | "succeeded" | "failed",
  createError: null | string,
  deleteStatus: "idle" | "loading" | "succeeded" | "failed",
  deleteError: null | string,
  findStatus: "idle" | "loading" | "succeeded" | "failed",
  findError: null | string,
  updateStatus: "idle" | "loading" | "succeeded" | "failed",
  updateError: null | string
}
```

## 🔧 **Configuración de API**

### 🌐 **Base URL:**
- Configurada en `src/services/api.js`
- Interceptors automáticos para:
  - Agregar token de autenticación
  - Manejo de errores HTTP
  - Toast notifications
  - Logs en desarrollo

### 🛡️ **Manejo de Errores:**
- **400**: Validación fallida
- **401**: Token expirado (logout automático)
- **403**: Sin permisos
- **404**: Recurso no encontrado
- **422**: Errores de validación
- **429**: Demasiadas peticiones
- **500+**: Errores del servidor

## 📋 **Best Practices**

### ✅ **Recomendaciones:**

1. **Usar `.unwrap()` para manejar errores:**
   ```jsx
   try {
     await dispatch(createInsumo(data)).unwrap();
   } catch (error) {
     // Error manejado
   }
   ```

2. **Recargar datos después de crear:**
   ```jsx
   await dispatch(createInsumo(data)).unwrap();
   dispatch(loadInsumos()); // Recargar lista
   ```

3. **Usar estados de loading:**
   ```jsx
   {createStatus === 'loading' && <Spinner />}
   ```

4. **Manejar errores específicos:**
   ```jsx
   if (createStatus === 'failed') {
     return <div>Error: {createError}</div>;
   }
   ```

## 🎯 **Ventajas del Patrón**

1. **Consistencia**: Mismo patrón para todas las peticiones
2. **Mantenibilidad**: Código organizado y reutilizable
3. **Performance**: Optimistic updates y cache
4. **UX**: Loading states y error handling automático
5. **Debugging**: Logs detallados en desarrollo
6. **Escalabilidad**: Fácil agregar nuevas funcionalidades

## 🔄 **Migración desde el Patrón Anterior**

Si tienes componentes usando el patrón anterior:

```jsx
// ❌ Antes
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);

const handleSubmit = async () => {
  setLoading(true);
  try {
    const response = await api.post('/endpoint', data);
    // manejar respuesta
  } catch (error) {
    setError(error.message);
  } finally {
    setLoading(false);
  }
};

// ✅ Ahora
const { status, error } = useSelector(state => state.entidad);
const dispatch = useDispatch();

const handleSubmit = async () => {
  try {
    await dispatch(createEntidad(data)).unwrap();
  } catch (error) {
    // Error manejado automáticamente
  }
};
``` 