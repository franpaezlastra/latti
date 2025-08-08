# Sistema de Navegación - Latti

## 🏗️ **Estructura de Rutas**

### 📁 **Rutas Públicas:**
```
/                    → Login (página principal)
/register           → Registro de usuarios
```

### 📁 **Rutas Protegidas (con layout admin):**
```
/admin/dashboard    → Dashboard principal
/admin/productos    → Gestión de productos
/admin/insumos      → Gestión de insumos
/admin/movimientos  → Gestión de movimientos
/admin/lots         → Gestión de lotes
```

## 🎯 **Flujo de Navegación**

### 📊 **Proceso de Login:**

1. **Usuario accede a `/`** → Ve el formulario de login
2. **Usuario llena credenciales** → Sin validaciones frontend
3. **Usuario envía formulario** → Petición al backend
4. **Backend valida** → Tu lógica de validación
5. **Si es exitoso** → Navega a `/admin/dashboard`
6. **Si hay error** → Muestra mensaje de error

### 🔄 **Protección de Rutas:**

```jsx
// Rutas protegidas con MainLayout
<Route path="/admin" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
  <Route path="dashboard" element={<Dashboard />} />
  <Route path="productos" element={<Products />} />
  <Route path="insumos" element={<Insumos />} />
  <Route path="movimientos" element={<Movements />} />
  <Route path="lots" element={<Lots />} />
</Route>
```

## 🚀 **Componentes Actualizados**

### 📝 **App.jsx:**
- ✅ Rutas anidadas con layout admin
- ✅ Protección de rutas con `ProtectedRoute`
- ✅ Redirección automática después del login
- ✅ Loading state durante verificación de auth

### 📝 **Login.jsx:**
- ✅ Navegación directa a `/admin/dashboard`
- ✅ Manejo de errores del backend
- ✅ Toast notifications
- ✅ Sin validaciones frontend

### 📝 **MainLayout.jsx:**
- ✅ Usa `Outlet` para rutas anidadas
- ✅ Sidebar y Header integrados
- ✅ Responsive design

## 🎨 **Estructura de Archivos**

### 📁 **Frontend:**
```
src/
├── pages/
│   ├── Auth/
│   │   ├── Login.jsx          # Página de login
│   │   └── Register.jsx       # Página de registro
│   └── Dashboard/
│       └── Dashboard.jsx      # Dashboard principal
├── components/layout/
│   ├── MainLayout/
│   │   └── MainLayout.jsx     # Layout principal
│   ├── Header/
│   │   └── Header.jsx         # Header con logout
│   ├── Sidebar/
│   │   └── Sidebar.jsx        # Navegación lateral
│   └── ProtectedRoute/
│       └── ProtectedRoute.jsx # Protección de rutas
└── constants/
    └── routes.js              # Definición de rutas
```

## 🔧 **Configuración de Rutas**

### 📝 **Constants (routes.js):**
```javascript
export const ROUTES = {
  // Rutas públicas
  LOGIN: '/',
  REGISTER: '/register',
  
  // Rutas protegidas (con layout admin)
  DASHBOARD: '/admin/dashboard',
  PRODUCTS: '/admin/productos',
  INSUMOS: '/admin/insumos',
  MOVEMENTS: '/admin/movimientos',
  LOTS: '/admin/lots',
};
```

### 📝 **App.jsx:**
```jsx
<Routes>
  {/* Login (página principal) */}
  <Route path="/" element={<Login />} />
  
  {/* Layout Admin con rutas protegidas */}
  <Route path="/admin" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
    <Route path="dashboard" element={<Dashboard />} />
    <Route path="productos" element={<Products />} />
    <Route path="insumos" element={<Insumos />} />
    <Route path="movimientos" element={<Movements />} />
    <Route path="lots" element={<Lots />} />
  </Route>
</Routes>
```

## 🎯 **Navegación Automática**

### ✅ **Después del Login:**
```jsx
// En Login.jsx
const onSubmit = async (data) => {
  try {
    await dispatch(loginUser(credentials)).unwrap();
    toast.success('Login exitoso');
    navigate(ROUTES.DASHBOARD, { replace: true }); // → /admin/dashboard
  } catch (error) {
    toast.error(error);
  }
};
```

### ✅ **Protección de Rutas:**
```jsx
// En ProtectedRoute.jsx
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  
  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }
  
  return children;
};
```

## 🚀 **Ventajas del Sistema**

### ✅ **Seguridad:**
- Rutas protegidas automáticamente
- Redirección a login si no autenticado
- Token JWT en localStorage

### ✅ **UX:**
- Navegación fluida después del login
- Layout consistente en todas las páginas
- Sidebar con navegación lateral

### ✅ **Mantenibilidad:**
- Rutas centralizadas en constants
- Componentes reutilizables
- Estructura clara y organizada

## 🔄 **Flujo Completo**

### 📊 **1. Acceso Inicial:**
```
Usuario accede a / → Ve login → Llena credenciales → Envía
```

### 📊 **2. Validación Backend:**
```
Backend recibe → Valida credenciales → Retorna token o error
```

### 📊 **3. Navegación:**
```
Si éxito → Navega a /admin/dashboard → Ve dashboard
Si error → Muestra mensaje de error → Permanece en login
```

### 📊 **4. Navegación Protegida:**
```
Usuario navega → ProtectedRoute verifica → Si autenticado → Acceso
Si no autenticado → Redirige a login
```

## 🎯 **Próximos Pasos**

1. **Probar el login** con los usuarios de prueba
2. **Verificar navegación** entre páginas
3. **Implementar componentes** específicos
4. **Agregar funcionalidades** según necesites

¿Te gustaría que implemente alguna funcionalidad específica o necesitas ayuda con algún aspecto del sistema de navegación? 