# Layout Personalizado - Latti

## 🎨 **Diseño Implementado**

### 📁 **Estructura del Layout:**
```
┌─────────────────────────────────────┐
│  Header (15%) │  Contenido (85%)  │
│  ┌─────────┐  │  ┌──────────────┐  │
│  │  Logo   │  │  │              │  │
│  │         │  │  │   Outlet     │  │
│  │ NavBar  │  │  │              │  │
│  │         │  │  │              │  │
│  │ Logout  │  │  │              │  │
│  └─────────┘  │  └──────────────┘  │
└─────────────────────────────────────┘
```

## 🏗️ **Componentes del Layout**

### 📝 **MainLayout.jsx:**
```jsx
const MainLayout = () => {
  return (
    <div className="flex h-screen">
      <div className="w-[15%] h-full">
        <Header />
      </div>
      <div className="w-[85%] bg-gray-50 overflow-hidden h-full">
        <Outlet />
      </div>
    </div>
  );
};
```

### 📝 **Header.jsx:**
```jsx
const Header = () => {
  return (
    <header className="bg-[#2536dd] flex flex-col h-full">
      <div className="flex justify-center py-2">
        <img src={logo} alt="Logo" className="w-[150px] object-contain" />
      </div>
      <div className="flex-1 flex flex-col">
        <NavBar />
      </div>
    </header>
  );
};
```

### 📝 **NavBar.jsx:**
```jsx
const NavBar = () => {
  return (
    <nav className="h-full flex flex-col px-2 py-4">
      <div className="flex flex-col justify-between h-full">
        <div className="flex flex-col gap-2 text-white">
          <NavItem to={ROUTES.DASHBOARD} icon={Home} text="Dashboard" />
          <NavItem to={ROUTES.PRODUCTS} icon={ShoppingCart} text="Productos e insumos" />
          <NavItem to={ROUTES.MOVEMENTS} icon={BarChart3} text="Movimientos" />
        </div>
        <div className="text-white">
          <NavItem to={ROUTES.LOGOUT} icon={LogOut} text="Cerrar sesión" />
        </div>
      </div>
    </nav>
  );
};
```

### 📝 **NavItem.jsx:**
```jsx
const NavItem = ({ to, icon: Icon, text }) => {
  const isActive = location.pathname === to;
  const isLogout = text.toLowerCase() === "cerrar sesión";

  let className = "flex items-center gap-2 px-4 py-2 rounded transition-colors duration-200";

  if (isActive) {
    className += " bg-[#aab4ff] text-black";
  } else if (isLogout) {
    className += " hover:bg-red-500 hover:text-white";
  } else {
    className += " hover:bg-[#aab4ff] hover:text-black";
  }

  return (
    <Link to={to} className={className} onClick={handleLogout}>
      {Icon && <Icon size={20} />}
      <p className="text-sm font-medium mt-2">{text}</p>
    </Link>
  );
};
```

## 🎯 **Características del Diseño**

### ✅ **Layout Responsive:**
- **Header**: 15% del ancho, altura completa
- **Contenido**: 85% del ancho, altura completa
- **Fondo**: Azul corporativo `#2536dd`

### ✅ **Navegación:**
- **Dashboard**: Icono Home
- **Productos**: Icono ShoppingCart
- **Movimientos**: Icono BarChart3
- **Logout**: Icono LogOut (rojo al hover)

### ✅ **Estados Visuales:**
- **Activo**: Fondo `#aab4ff`, texto negro
- **Hover**: Fondo `#aab4ff`, texto negro
- **Logout Hover**: Fondo rojo, texto blanco

## 🚀 **Funcionalidades Implementadas**

### ✅ **Autenticación:**
- Logout automático con Redux
- Navegación a login después del logout
- Toast notifications para feedback

### ✅ **Navegación:**
- Rutas protegidas con `ProtectedRoute`
- Navegación fluida entre páginas
- Estado activo visual

### ✅ **UX:**
- Transiciones suaves
- Feedback visual inmediato
- Diseño limpio y profesional

## 🎨 **Paleta de Colores**

### 📊 **Colores Principales:**
- **Azul Principal**: `#2536dd` (Header background)
- **Azul Hover**: `#aab4ff` (NavItem hover/active)
- **Rojo Logout**: `#ef4444` (Logout hover)
- **Gris Contenido**: `#f9fafb` (Content background)

### 📊 **Estados:**
- **Normal**: Texto blanco
- **Activo**: Texto negro, fondo azul claro
- **Hover**: Texto negro, fondo azul claro
- **Logout Hover**: Texto blanco, fondo rojo

## 🔧 **Configuración de Rutas**

### 📝 **Rutas Protegidas:**
```javascript
export const ROUTES = {
  DASHBOARD: '/admin/dashboard',
  PRODUCTS: '/admin/productos',
  MOVEMENTS: '/admin/movimientos',
  LOGOUT: '/admin/cerrar-sesion',
};
```

### 📝 **Estructura de Archivos:**
```
src/components/layout/
├── MainLayout/
│   └── MainLayout.jsx     # Layout principal
├── Header/
│   ├── Header.jsx         # Header con logo
│   ├── NavBar.jsx         # Navegación lateral
│   └── NavItem.jsx        # Items de navegación
└── ProtectedRoute/
    └── ProtectedRoute.jsx # Protección de rutas
```

## 🎯 **Ventajas del Diseño**

### ✅ **Profesional:**
- Logo corporativo prominente
- Colores consistentes
- Diseño limpio y moderno

### ✅ **Funcional:**
- Navegación intuitiva
- Estados visuales claros
- Logout fácilmente accesible

### ✅ **Responsive:**
- Layout flexible
- Adaptable a diferentes tamaños
- Navegación optimizada

## 🔄 **Flujo de Navegación**

### 📊 **1. Login:**
```
Usuario accede a / → Login exitoso → Navega a /admin/dashboard
```

### 📊 **2. Navegación:**
```
Usuario hace clic en NavItem → Navega a la página correspondiente
```

### 📊 **3. Logout:**
```
Usuario hace clic en "Cerrar sesión" → Logout → Navega a /
```

## 🎯 **Próximos Pasos**

1. **Probar el layout** con el login
2. **Verificar navegación** entre páginas
3. **Implementar contenido** en cada página
4. **Agregar funcionalidades** específicas

¿Te gustaría que implemente alguna funcionalidad específica o necesitas ayuda con algún aspecto del layout? 