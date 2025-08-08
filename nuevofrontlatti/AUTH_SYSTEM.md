# Sistema de Autenticación - Latti

## 🏗️ Estructura Implementada

### 📁 Archivos de Autenticación

```
src/store/
├── actions/
│   └── authActions.js          # Acciones de autenticación
├── reducers/
│   └── authReducer.js          # Reducer de autenticación
└── hooks/
    └── useAuth.js              # Hook personalizado para auth
```

## 🎯 Características del Sistema

### ✅ **Funcionalidades Implementadas:**

1. **Login/Logout**
   - Autenticación con username/password
   - Manejo de tokens JWT
   - Persistencia en localStorage
   - Logout automático

2. **Registro de Usuarios**
   - Creación de nuevas cuentas
   - Validación de contraseñas
   - Redirección automática al login

3. **Protección de Rutas**
   - Rutas públicas y protegidas
   - Redirección automática
   - Verificación de token

4. **Gestión de Estado**
   - Estados de loading por operación
   - Manejo de errores específicos
   - Persistencia de sesión

## 📝 Ejemplo de Uso

### 🔧 **En un Componente:**

```jsx
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, logoutUser } from '../store/actions/authActions.js';

const AuthComponent = () => {
  const dispatch = useDispatch();
  const { user, isAuthenticated, loginStatus } = useSelector((state) => state.auth);

  const handleLogin = async (credentials) => {
    try {
      await dispatch(loginUser(credentials)).unwrap();
      // Login exitoso
    } catch (error) {
      // Error manejado automáticamente
    }
  };

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      // Logout exitoso
    } catch (error) {
      // Error manejado automáticamente
    }
  };

  return (
    <div>
      {isAuthenticated ? (
        <div>
          <p>Bienvenido, {user}</p>
          <button onClick={handleLogout}>Cerrar Sesión</button>
        </div>
      ) : (
        <LoginForm onSubmit={handleLogin} />
      )}
    </div>
  );
};
```

## 🚀 **Actions Disponibles**

### 🔐 **Autenticación:**
- `loginUser(credentials)` - Iniciar sesión
- `registerUser(userData)` - Registrar usuario
- `logoutUser()` - Cerrar sesión
- `checkAuthStatus()` - Verificar token existente

### 📊 **Parámetros:**

**Login:**
```javascript
{
  username: "usuario",
  password: "contraseña"
}
```

**Register:**
```javascript
{
  username: "nuevo_usuario",
  password: "contraseña_segura"
}
```

## 🎨 **Estados Disponibles**

### 📊 **Estado de Autenticación:**
```javascript
{
  user: string | null,
  token: string | null,
  isAuthenticated: boolean,
  loading: boolean,
  error: string | null,
  loginStatus: "idle" | "loading" | "succeeded" | "failed",
  loginError: string | null,
  registerStatus: "idle" | "loading" | "succeeded" | "failed",
  registerError: string | null,
  logoutStatus: "idle" | "loading" | "succeeded" | "failed",
  logoutError: string | null
}
```

## 🔧 **Configuración de Backend**

### 🌐 **Endpoints:**
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/register` - Registrar usuario

### 📋 **Respuestas del Backend:**

**Login Exitoso:**
```json
{
  "token": "jwt_token_here"
}
```

**Register Exitoso:**
```json
{
  "message": "Usuario registrado correctamente"
}
```

**Error:**
```json
{
  "message": "Usuario o contraseña incorrecto"
}
```

## 🛡️ **Seguridad Implementada**

### ✅ **Características de Seguridad:**

1. **Tokens JWT**
   - Almacenamiento seguro en localStorage
   - Verificación automática de validez
   - Limpieza automática al expirar

2. **Protección de Rutas**
   - Redirección automática a login
   - Preservación de URL de destino
   - Verificación de autenticación

3. **Manejo de Errores**
   - Errores específicos por operación
   - Toast notifications automáticas
   - Limpieza de estado en errores

4. **Persistencia de Sesión**
   - Verificación automática al cargar
   - Restauración de sesión
   - Logout automático en errores

## 📋 **Best Practices**

### ✅ **Recomendaciones:**

1. **Usar el hook useAuth:**
   ```jsx
   const { isAuthenticated, user, loading } = useAuth();
   ```

2. **Manejar estados de loading:**
   ```jsx
   {loginStatus === 'loading' && <Spinner />}
   ```

3. **Usar ProtectedRoute:**
   ```jsx
   <ProtectedRoute>
     <ComponenteProtegido />
   </ProtectedRoute>
   ```

4. **Manejar errores específicos:**
   ```jsx
   if (loginStatus === 'failed') {
     return <div>Error: {loginError}</div>;
   }
   ```

## 🎯 **Flujo de Autenticación**

### 📊 **Flujo Completo:**

1. **Carga de Aplicación**
   - Verificar token existente
   - Restaurar sesión si es válido
   - Mostrar loading durante verificación

2. **Login**
   - Validar credenciales
   - Guardar token en localStorage
   - Actualizar estado de autenticación
   - Redirigir al dashboard

3. **Navegación Protegida**
   - Verificar autenticación en cada ruta
   - Redirigir a login si no autenticado
   - Preservar URL de destino

4. **Logout**
   - Limpiar localStorage
   - Actualizar estado
   - Redirigir a login

## 🔄 **Integración con Backend**

### 🌐 **Configuración de API:**

El sistema está configurado para trabajar con tu backend Spring Boot:

- **Base URL**: Configurada en `api.js`
- **Endpoints**: `/api/auth/login` y `/api/auth/register`
- **Tokens**: JWT tokens automáticos
- **Headers**: Authorization Bearer automático

### 📝 **Ejemplo de Uso Completo:**

```jsx
// Login
const handleLogin = async () => {
  try {
    await dispatch(loginUser({
      username: "usuario",
      password: "contraseña"
    })).unwrap();
    
    // Redirigir automáticamente
    navigate('/dashboard');
  } catch (error) {
    // Error manejado automáticamente
  }
};

// Register
const handleRegister = async () => {
  try {
    await dispatch(registerUser({
      username: "nuevo_usuario",
      password: "contraseña_segura"
    })).unwrap();
    
    // Redirigir al login
    navigate('/login');
  } catch (error) {
    // Error manejado automáticamente
  }
};
```

## 🚀 **Ventajas del Sistema**

1. **Seguridad**: JWT tokens y protección de rutas
2. **UX**: Loading states y manejo de errores
3. **Persistencia**: Sesión mantenida entre recargas
4. **Escalabilidad**: Fácil agregar nuevas funcionalidades
5. **Mantenibilidad**: Código organizado y reutilizable
6. **Debugging**: Estados claros y logs detallados 