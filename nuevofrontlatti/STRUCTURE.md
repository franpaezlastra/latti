# 📁 Estructura del Proyecto - Frontend React

## 🏗️ Organización de Carpetas

### `/src/components/`
```
components/
├── ui/                    # Componentes de UI reutilizables
│   ├── Button.jsx
│   ├── Input.jsx
│   ├── LoadingSpinner.jsx
│   ├── ErrorMessage.jsx
│   ├── SuccessToast.jsx
│   ├── PageHeader.jsx
│   ├── DataTable.jsx
│   ├── DeleteConfirmationModal.jsx
│   ├── ModalForm.jsx
│   ├── FormModal.jsx
│   └── DetallesProducto.jsx
│
├── layout/               # Componentes de layout
│   ├── Header/
│   │   ├── Header.jsx
│   │   ├── NavBar.jsx
│   │   └── NavItem.jsx
│   ├── Sidebar/
│   │   └── Sidebar.jsx
│   ├── MainLayout/
│   │   └── MainLayout.jsx
│   └── ProtectedRoute/
│       └── ProtectedRoute.jsx
│
├── features/            # Funcionalidades específicas
│   ├── auth/           # Autenticación
│   │   ├── components/
│   │   ├── hooks/
│   │   └── services/
│   │
│   ├── productos/      # Gestión de productos
│   │   ├── ProductosPage.jsx
│   │   ├── modals/
│   │   │   ├── ProductoCreateModal.jsx
│   │   │   ├── ProductoEditModal.jsx
│   │   │   ├── ProductoDetailsModal.jsx
│   │   │   └── InsumoCreateModal.jsx
│   │   └── sections/
│   │       ├── ProductosSection.jsx
│   │       └── InsumosSection.jsx
│   │
│   ├── insumos/        # Gestión de insumos
│   │   └── InsumosList.jsx
│   │
│   ├── lots/           # Gestión de lotes
│   ├── movements/      # Gestión de movimientos
│   └── dashboard/      # Dashboard principal
│
└── common/             # Componentes comunes
    ├── Badge/
    │   └── Badge.jsx
    ├── Button/
    │   └── Button.jsx
    ├── Input/
    │   └── Input.jsx
    ├── Loader/
    │   └── Loader.jsx
    ├── Modal/
    ├── Pagination/
    └── Table/
```

### `/src/`
```
src/
├── pages/              # Páginas principales
│   ├── Auth/
│   │   ├── Login.jsx
│   │   └── Register.jsx
│   ├── Dashboard/
│   │   └── Dashboard.jsx
│   ├── Products/
│   │   └── Products.jsx
│   ├── Insumos/
│   │   └── Insumos.jsx
│   ├── Lots/
│   │   └── Lots.jsx
│   └── Movements/
│       └── Movements.jsx
│
├── store/              # Redux Store
│   ├── index.js
│   ├── slices/
│   │   ├── authSlice.js
│   │   ├── insumoSlice.js
│   │   ├── movementSlice.js
│   │   └── productSlice.js
│   ├── actions/
│   │   ├── authActions.js
│   │   ├── insumoActions.js
│   │   ├── movimientoInsumoActions.js
│   │   ├── movimientoProductoActions.js
│   │   └── productosActions.js
│   ├── reducers/
│   │   ├── authReducer.js
│   │   ├── insumosReducer.js
│   │   ├── movimientoInsumoReducer.js
│   │   ├── movimientoProductoReducer.js
│   │   └── productosReducer.js
│   └── middleware/
│
├── services/           # Servicios API
│   └── api.js
│
├── hooks/              # Custom hooks
│   └── useAuth.js
│
├── constants/          # Constantes
│   ├── api.js
│   ├── messages.js
│   └── routes.js
│
├── utils/              # Utilidades
├── styles/             # Estilos globales
│   └── globals.css
├── assets/             # Recursos estáticos
│   ├── fonts/
│   │   ├── fonts.css
│   │   ├── Maderon-Italic.woff
│   │   ├── Maderon-Regular.woff
│   │   ├── TransformaSans_Trial-Bold.woff2
│   │   ├── TransformaSans_Trial-ExtraBlack.woff2
│   │   ├── TransformaSans_Trial-ExtraBold.woff2
│   │   ├── TransformaSans_Trial-Light.woff2
│   │   ├── TransformaSans_Trial-Medium.woff2
│   │   └── TransformaScript-Medium.woff
│   ├── logoazul.png
│   ├── logoblanco.png
│   └── logonegro.png
│
├── App.jsx
├── App.css
├── main.jsx
└── index.css
```

## 🎯 Principios de Organización

### 1. **Separación por Responsabilidad**
- **UI Components:** Componentes reutilizables de interfaz
- **Layout Components:** Estructura y navegación
- **Feature Components:** Funcionalidades específicas del negocio
- **Common Components:** Componentes compartidos entre features

### 2. **Estructura de Features**
Cada feature tiene su propia carpeta con:
- **Componentes específicos** de la feature
- **Modales** relacionados
- **Secciones** o subcomponentes
- **Hooks** específicos (si los hay)
- **Servicios** específicos (si los hay)

### 3. **Componentes UI Reutilizables**
- **Button.jsx:** Botones con diferentes variantes
- **Input.jsx:** Campos de entrada
- **ModalForm.jsx:** Base para modales
- **FormModal.jsx:** Modal con formulario
- **DetallesProducto.jsx:** Vista de detalles de producto

### 4. **Nomenclatura Consistente**
- **PascalCase** para componentes: `ProductoCreateModal.jsx`
- **camelCase** para archivos de utilidades: `api.js`
- **kebab-case** para CSS: `globals.css`

## 🔄 Flujo de Datos

### 1. **API → Redux → Componentes**
```
Backend API → Redux Actions → Redux Store → React Components
```

### 2. **Componentes → Modales**
```
ProductosPage → ProductoCreateModal → FormModal → ModalForm
```

### 3. **Estado Global vs Local**
- **Redux:** Estado global (productos, insumos, auth)
- **useState:** Estado local (formularios, modales)

## 📋 Convenciones de Código

### 1. **Imports Organizados**
```javascript
// React y librerías externas
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

// Componentes internos
import Button from '../../../ui/Button';
import FormModal from '../../../ui/FormModal';

// Hooks y servicios
import { useAuth } from '../../../hooks/useAuth';
import { api } from '../../../services/api';
```

### 2. **Estructura de Componentes**
```javascript
const ComponentName = ({ prop1, prop2 }) => {
  // 1. Hooks
  const [state, setState] = useState();
  
  // 2. Effects
  useEffect(() => {}, []);
  
  // 3. Handlers
  const handleSubmit = () => {};
  
  // 4. Render
  return <div>...</div>;
};
```

### 3. **Manejo de Errores**
- **Error states** en componentes de formulario
- **Error boundaries** para capturar errores
- **Toast notifications** para feedback

## 🚀 Mejoras Implementadas

### 1. **Modales Reutilizables**
- `ModalForm.jsx`: Base para todos los modales
- `FormModal.jsx`: Modal con formulario y manejo de errores
- **Consistencia** en todos los modales de la aplicación

### 2. **Manejo de Errores Unificado**
- **Boolean + String** para estados de error
- **Limpieza automática** al cambiar inputs
- **Mensajes claros** para el usuario

### 3. **Componentes UI Consistentes**
- **Tamaños uniformes** en inputs y botones
- **Estilos coherentes** en toda la aplicación
- **Responsive design** implementado

### 4. **Redux Toolkit Moderno**
- **Slices** en lugar de reducers tradicionales
- **Async thunks** para operaciones asíncronas
- **Estado optimizado** para performance

## 📝 Notas de Mantenimiento

### 1. **Agregar Nuevos Features**
1. Crear carpeta en `/features/`
2. Agregar componentes específicos
3. Crear modales si es necesario
4. Actualizar rutas en `App.jsx`

### 2. **Agregar Nuevos UI Components**
1. Crear en `/ui/`
2. Hacer reutilizable
3. Documentar props y uso
4. Agregar a esta documentación

### 3. **Modificar Backend Integration**
1. Actualizar DTOs si es necesario
2. Modificar actions en Redux
3. Actualizar componentes que usen esos datos
4. Probar integración completa

---

**Última actualización:** Enero 2025
**Versión:** 1.0.0 