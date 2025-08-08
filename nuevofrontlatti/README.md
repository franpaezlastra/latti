# 🏪 Sistema de Gestión de Stock - Frontend React

## 📋 Descripción

Sistema completo de gestión de inventario para el negocio Latti, desarrollado con React, Redux Toolkit y Spring Boot. Permite la gestión de productos, insumos, lotes y movimientos de stock.

## 🚀 Características Principales

### ✅ **Gestión de Productos**
- Crear, editar y eliminar productos
- Asignar recetas con insumos y cantidades
- Vista de detalles simplificada
- Validación de duplicados

### ✅ **Gestión de Insumos**
- CRUD completo de insumos
- Unidades de medida personalizables
- Integración con recetas de productos

### ✅ **Sistema de Modales Reutilizables**
- Componentes `ModalForm` y `FormModal`
- Manejo de errores unificado
- Experiencia de usuario consistente

### ✅ **Manejo de Errores Avanzado**
- Estados de error boolean + string
- Limpieza automática al cambiar inputs
- Mensajes claros para el usuario

### ✅ **UI/UX Optimizada**
- Diseño responsive con Tailwind CSS
- Componentes UI consistentes
- Scroll interno para listas largas
- Lógica "ya seleccionado" para evitar duplicados

## 🛠️ Tecnologías

### **Frontend**
- **React 18** - Biblioteca de UI
- **Redux Toolkit** - Gestión de estado
- **React Router DOM** - Navegación
- **Tailwind CSS** - Estilos
- **React Icons** - Iconografía

### **Backend**
- **Spring Boot** - Framework Java
- **Spring Data JPA** - Persistencia
- **Spring Security** - Autenticación
- **MySQL** - Base de datos

## 📁 Estructura del Proyecto

```
nuevofrontlatti/
├── src/
│   ├── components/
│   │   ├── ui/              # Componentes reutilizables
│   │   ├── layout/          # Layout y navegación
│   │   ├── features/        # Funcionalidades específicas
│   │   └── common/          # Componentes compartidos
│   ├── pages/               # Páginas principales
│   ├── store/               # Redux store y slices
│   ├── services/            # Servicios API
│   ├── hooks/               # Custom hooks
│   ├── constants/           # Constantes
│   └── assets/              # Recursos estáticos
├── STRUCTURE.md             # Documentación de estructura
├── IMPROVEMENTS.md          # Mejoras implementadas
└── README.md               # Este archivo
```

## 🚀 Instalación y Uso

### **Prerrequisitos**
- Node.js 16+
- npm o yarn
- Java 17+
- MySQL 8.0+

### **Instalación Frontend**
```bash
cd nuevofrontlatti
npm install
npm run dev
```

### **Instalación Backend**
```bash
cd stock
./gradlew bootRun
```

### **Variables de Entorno**
```env
# Frontend (.env)
VITE_API_URL=http://localhost:8080/api

# Backend (application.properties)
spring.datasource.url=jdbc:mysql://localhost:3306/latti_stock
spring.datasource.username=root
spring.datasource.password=password
```

## 🎯 Funcionalidades Implementadas

### **1. Sistema de Modales**
- ✅ `ModalForm.jsx` - Base para todos los modales
- ✅ `FormModal.jsx` - Modal con formulario y errores
- ✅ Manejo de errores consistente
- ✅ Layout optimizado con scroll interno

### **2. Gestión de Productos**
- ✅ Crear producto con receta
- ✅ Editar producto existente
- ✅ Ver detalles simplificados
- ✅ Validación de duplicados

### **3. Gestión de Insumos**
- ✅ CRUD completo
- ✅ Integración con productos
- ✅ Validación de nombres únicos

### **4. Manejo de Errores**
- ✅ Estados boolean + string
- ✅ Limpieza automática
- ✅ Mensajes claros
- ✅ UX mejorada

## 🔧 Componentes Principales

### **UI Components**
```jsx
// Botón reutilizable
<Button variant="primary" onClick={handleClick}>
  Guardar
</Button>

// Input consistente
<Input 
  label="Nombre"
  value={nombre}
  onChange={handleChange}
/>

// Modal con formulario
<FormModal
  isOpen={isOpen}
  onClose={onClose}
  onSubmit={handleSubmit}
  error={error}
  errorMessage={textoError}
>
  {/* Contenido del formulario */}
</FormModal>
```

### **Feature Components**
```jsx
// Página de productos
<ProductosPage />

// Modal de crear producto
<ProductoCreateModal />

// Modal de editar producto
<ProductoEditModal />

// Vista de detalles
<DetallesProducto producto={producto} />
```

## 📊 Estado del Proyecto

### **✅ Completado**
- [x] Sistema de modales reutilizables
- [x] Manejo de errores unificado
- [x] Componentes UI consistentes
- [x] Integración backend mejorada
- [x] Lógica "ya seleccionado"
- [x] Layout optimizado
- [x] Documentación completa

### **🔄 En Desarrollo**
- [ ] Testing unitario
- [ ] Testing de integración
- [ ] Optimización de performance
- [ ] Accesibilidad (ARIA)

### **📋 Pendiente**
- [ ] Gestión de lotes
- [ ] Movimientos de stock
- [ ] Reportes y analytics
- [ ] Exportación de datos

## 🐛 Solución de Problemas

### **Error: "Ya existe un producto con ese nombre"**
- **Causa:** Validación del backend
- **Solución:** Cambiar el nombre del producto

### **Error: "Objects are not valid as React child"**
- **Causa:** Estado de error incorrecto
- **Solución:** Usar boolean + string para errores

### **Modal no se cierra con errores**
- **Causa:** Configuración de backdrop
- **Solución:** `closeOnBackdropClick={!error}`

## 🤝 Contribución

### **Convenciones de Código**
- **PascalCase** para componentes
- **camelCase** para funciones y variables
- **kebab-case** para archivos CSS
- **Imports organizados** por tipo

### **Estructura de Commits**
```
feat: agregar nueva funcionalidad
fix: corregir bug
docs: actualizar documentación
style: cambios de estilo
refactor: refactorizar código
test: agregar tests
```

## 📝 Licencia

Este proyecto es privado para el negocio Latti.

## 👥 Equipo

- **Desarrollador Frontend:** [Tu nombre]
- **Desarrollador Backend:** [Tu nombre]
- **Diseñador UX/UI:** [Tu nombre]

---

**Versión:** 1.0.0  
**Última actualización:** Enero 2025  
**Estado:** En desarrollo activo
