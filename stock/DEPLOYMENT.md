# 🚀 Despliegue en Dockploy

## 📋 Requisitos Previos

- ✅ Repositorio Git configurado
- ✅ Cuenta en Dockploy
- ✅ Base de datos PostgreSQL externa (Railway, Supabase, etc.)

## 🐳 Configuración Docker

### Dockerfile
- **Multi-stage build** para optimizar tamaño
- **Java 24** con Eclipse Temurin
- **Usuario no-root** para seguridad
- **Health check** en `/actuator/health`

### Variables de Entorno Requeridas
```bash
DB_HOST=tu-host-postgresql
DB_PORT=5432
DB_NAME=tu_nombre_base_datos
DB_USERNAME=tu_usuario
DB_PASSWORD=tu_password
```

## 🚀 Despliegue en Dockploy

### 1. Conectar Repositorio
- Ir a Dockploy Dashboard
- Conectar tu repositorio GitHub
- Seleccionar rama `main`

### 2. Configurar Servicio
- **Build Path:** `/stock` (carpeta del backend)
- **Port:** `8080`
- **Build Type:** `Dockerfile`

### 3. Variables de Entorno
- Agregar todas las variables de base de datos
- `SPRING_PROFILES_ACTIVE=prod`

### 4. Desplegar
- Hacer clic en "Deploy"
- Esperar que el build termine
- Verificar health check

## 🔄 Despliegue Automático

- **Trigger:** `On Push` a rama `main`
- **Watch Paths:** `stock/**`
- **Auto-deploy:** Activado

## 📊 Monitoreo

- **Health Check:** `/actuator/health`
- **Logs:** Disponibles en Dockploy
- **Métricas:** Spring Boot Actuator

## 🛠️ Troubleshooting

### Error de Build
- Verificar que Gradle esté configurado correctamente
- Revisar logs de build en Dockploy

### Error de Conexión a BD
- Verificar variables de entorno
- Confirmar que la BD esté accesible desde Dockploy

### Error de Health Check
- Verificar que la app esté corriendo en puerto 8080
- Revisar logs de la aplicación
