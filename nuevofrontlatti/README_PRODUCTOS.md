# Gestión de Productos e Insumos - Documentación

## 🎯 Descripción General

Esta nueva funcionalidad proporciona una interfaz moderna y intuitiva para la gestión completa de productos e insumos en el sistema de inventario. Diseñada con principios de UX/UI modernos, ofrece una experiencia de usuario excepcional con componentes reutilizables y código limpio.

## 🏗️ Arquitectura del Código

### Estructura de Carpetas

```
src/
├── components/
│   ├── features/
│   │   └── productos/
│   │       ├── ProductosPage.jsx          # Página principal
│   │       ├── sections/
│   │       │   ├── ProductosSection.jsx   # Sección de productos
│   │       │   └── InsumosSection.jsx     # Sección de insumos
│   │       └── modals/
│   │           ├── ProductoCreateModal.jsx # Modal crear producto
│   │           ├── ProductoEditModal.jsx   # Modal editar producto
│   │           ├── ProductoDetailsModal.jsx # Modal detalles producto
│   │           └── InsumoCreateModal.jsx   # Modal crear insumo
│   └── ui/
│       ├── Button.jsx                     # Botón reutilizable
│       ├── Input.jsx                      # Input reutilizable
│       ├── DataTable.jsx                  # Tabla de datos avanzada
│       ├── LoadingSpinner.jsx             # Spinner de carga
│       ├── SuccessToast.jsx               # Notificaciones toast
│       ├── ErrorMessage.jsx               # Mensajes de error
│       ├── DeleteConfirmationModal.jsx    # Modal de confirmación
│       └── PageHeader.jsx                 # Header de página
```

## 🎨 Componentes UI Reutilizables

### Button Component
- **Variantes**: primary, secondary, outline, danger, success, ghost
- **Tamaños**: small, medium, large
- **Estados**: loading, disabled
- **Características**: Accesibilidad completa, focus states, transiciones suaves

### Input Component
- **Tipos**: text, number, email, password
- **Estados**: error, disabled, required
- **Características**: Validación visual, labels accesibles, focus rings

### DataTable Component
- **Funcionalidades**: Búsqueda, ordenamiento, paginación
- **Características**: Responsive, accesible, personalizable
- **Acciones**: Botones de acción configurables por fila

### Modal Components
- **Tipos**: Create, Edit, Details, Delete Confirmation
- **Características**: Backdrop blur, animaciones suaves, responsive
- **Accesibilidad**: Focus trap, escape key, screen reader support

## 🚀 Funcionalidades Principales

### Gestión de Productos
- ✅ **Crear productos** con recetas de insumos
- ✅ **Editar productos** existentes
- ✅ **Ver detalles** completos de productos
- ✅ **Eliminar productos** con confirmación
- ✅ **Búsqueda y filtrado** avanzado
- ✅ **Ordenamiento** por columnas
- ✅ **Paginación** automática

### Gestión de Insumos
- ✅ **Crear insumos** con unidad de medida
- ✅ **Eliminar insumos** con confirmación
- ✅ **Búsqueda y filtrado** avanzado
- ✅ **Visualización** de stock disponible

### Características UX/UI
- ✅ **Diseño responsive** para todos los dispositivos
- ✅ **Animaciones suaves** y transiciones
- ✅ **Estados de carga** con spinners
- ✅ **Notificaciones toast** para feedback
- ✅ **Validación en tiempo real** de formularios
- ✅ **Accesibilidad completa** (WCAG 2.1)
- ✅ **Modo oscuro** preparado (futuro)

## 🎯 Mejoras de UX Implementadas

### 1. **Feedback Visual Inmediato**
- Toast notifications para todas las acciones
- Estados de loading en botones
- Validación visual en formularios
- Mensajes de error contextuales

### 2. **Navegación Intuitiva**
- Breadcrumbs automáticos
- Botones de acción claramente identificados
- Modales con jerarquía visual clara
- Confirmaciones para acciones destructivas

### 3. **Diseño Responsive**
- Mobile-first approach
- Tablas con scroll horizontal en móviles
- Modales adaptables a pantallas pequeñas
- Botones con tamaños táctiles apropiados

### 4. **Accesibilidad**
- Navegación por teclado completa
- Screen reader support
- Contraste de colores adecuado
- Focus management en modales

## 🔧 Configuración y Uso

### Instalación de Dependencias
```bash
npm install react-icons
```

### Uso del Componente Principal
```jsx
import ProductosPage from './components/features/productos/ProductosPage';

// En tu router
<Route path="/admin/productos" element={<ProductosPage />} />
```

### Personalización de Estilos
Los componentes utilizan Tailwind CSS con clases personalizadas definidas en `src/index.css`.

## 🎨 Paleta de Colores

```css
/* Colores principales */
--blue-50: #eff6ff
--blue-100: #dbeafe
--blue-600: #2563eb
--blue-700: #1d4ed8

/* Estados */
--success: #10b981
--warning: #f59e0b
--error: #ef4444
--info: #3b82f6
```

## 📱 Responsive Breakpoints

- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

## 🔄 Flujo de Datos

1. **Carga inicial**: Redux actions cargan productos e insumos
2. **Creación**: Modal → Validación → API → Toast → Actualización
3. **Edición**: Modal con datos pre-cargados → Validación → API → Toast
4. **Eliminación**: Confirmación → API → Toast → Actualización
5. **Visualización**: Modal con información detallada y estadísticas

## 🚀 Próximas Mejoras

- [ ] **Filtros avanzados** por categorías
- [ ] **Exportación** a PDF/Excel
- [ ] **Bulk actions** para múltiples elementos
- [ ] **Drag & drop** para reordenar insumos
- [ ] **Autocompletado** en formularios
- [ ] **Undo/Redo** para acciones
- [ ] **Keyboard shortcuts** para power users

## 🐛 Solución de Problemas

### Error: "Component not found"
- Verificar que todos los imports estén correctos
- Asegurar que los archivos existan en las rutas especificadas

### Error: "Redux action not found"
- Verificar que las actions estén exportadas correctamente
- Comprobar que el store esté configurado

### Problemas de Estilos
- Verificar que Tailwind CSS esté configurado
- Comprobar que las clases personalizadas estén en `index.css`

## 📞 Soporte

Para reportar bugs o solicitar nuevas funcionalidades, crear un issue en el repositorio con:

1. Descripción del problema
2. Pasos para reproducir
3. Comportamiento esperado vs actual
4. Información del navegador/sistema
5. Capturas de pantalla (si aplica) 