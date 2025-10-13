# 🚀 Configuración para Desarrollo Local

## ✅ Estado Actual - Checkpoint "comenzamos"

### Backend (Spring Boot) - REMOTO
- **URL Base:** `https://api.lattituc.site/api`
- **Estado:** ✅ Funcionando en servidor remoto
- **CORS:** Configurado para aceptar conexiones desde `localhost:5173`, `5174`, `5175`

### Frontend (React + Vite) - LOCAL
- **Puerto:** 5173
- **URL:** `http://localhost:5173`
- **Estado:** ✅ Funcionando
- **API Config:** Apunta a `https://api.lattituc.site/api`

## 🔧 Configuración Actual

### Backend - CORS Config
```java
// stock/src/main/java/com/Latti/stock/configurations/CorsConfig.java
configuration.setAllowedOrigins(Arrays.asList(
    "http://localhost:5173", "http://localhost:5174","http://localhost:5175"
));
```

### Frontend - API Config
```javascript
// nuevofrontlatti/src/constants/api.js
export const API_BASE_URL = 'https://api.lattituc.site/api';
```

## 🎯 Cómo Trabajar en Modo Desarrollo

### 1. Backend (Servidor Remoto)
- **No necesitas iniciar nada localmente**
- **API disponible en:** `https://api.lattituc.site/api`
- **Estado:** ✅ Ya funcionando en el servidor

### 2. Iniciar Frontend (Local)
```bash
cd nuevofrontlatti
npm run dev
```
- Se ejecuta en: `http://localhost:5173`
- Hot reload activado para ver cambios en tiempo real

### 3. Verificar Conexión
- Abrir navegador en: `http://localhost:5173`
- El frontend se conecta automáticamente al servidor remoto
- Los cambios en el código se reflejan inmediatamente

## 🔄 Ventajas del Modo Híbrido (Frontend Local + Backend Remoto)

✅ **Hot Reload:** Los cambios en el frontend se ven instantáneamente
✅ **Debugging:** Puedes usar DevTools del navegador
✅ **Datos Reales:** Consumes datos del servidor de producción
✅ **Flexibilidad:** Puedes modificar el frontend sin afectar el backend
✅ **Testing:** Puedes probar nuevas funcionalidades del frontend con datos reales

## 📝 Notas Importantes

- El backend remoto ya está configurado para aceptar conexiones desde el frontend local
- No necesitas cambiar ninguna configuración de CORS en el servidor
- El frontend ahora apunta al servidor remoto `https://api.lattituc.site/api`
- Solo necesitas tener el frontend local corriendo

## 🚨 Si Necesitas Volver al Checkpoint

```bash
git reset --hard HEAD
```

Esto restaurará el código al estado exacto del checkpoint "comenzamos".
