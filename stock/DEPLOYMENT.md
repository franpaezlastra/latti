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

### Variables de Entorno Requeridas (CRÍTICAS)

```bash
# 🔴 PERFIL DE SPRING (CRÍTICO - evita que se borre la BD)
SPRING_PROFILES_ACTIVE=prod

# 📊 BASE DE DATOS POSTGRESQL
SPRING_DATASOURCE_URL=jdbc:postgresql://tu-host:5432/tu_base_datos
SPRING_DATASOURCE_USERNAME=tu_usuario
SPRING_DATASOURCE_PASSWORD=tu_password

# 🔧 CONFIGURACIÓN JPA (primera vez usa 'update', después 'validate')
SPRING_JPA_HIBERNATE_DDL_AUTO=update

# 🔐 JWT
JWT_SECRET=tu_clave_secreta_minimo_32_caracteres

# 🌐 CORS
CORS_ALLOWED_ORIGINS=https://tu-dominio-frontend.com
```

⚠️ **MUY IMPORTANTE**: 
- `SPRING_PROFILES_ACTIVE=prod` es CRÍTICO para que NO se borre la BD
- `SPRING_JPA_HIBERNATE_DDL_AUTO=update` en la primera vez crea las tablas
- Después puedes cambiar a `validate` para mayor seguridad

## 🚀 Despliegue en Dockploy

### 1. Conectar Repositorio
- Ir a Dockploy Dashboard
- Conectar tu repositorio GitHub
- Seleccionar rama `main`

### 2. Configurar Servicio
- **Build Path:** `/stock` (carpeta del backend)
- **Port:** `8080`
- **Build Type:** `Dockerfile`

### 3. Variables de Entorno (REVISAR ARRIBA ⬆️)
- ✅ `SPRING_PROFILES_ACTIVE=prod` (CRÍTICO)
- ✅ `SPRING_DATASOURCE_URL` con PostgreSQL
- ✅ `SPRING_DATASOURCE_USERNAME`
- ✅ `SPRING_DATASOURCE_PASSWORD`
- ✅ `SPRING_JPA_HIBERNATE_DDL_AUTO=update`
- ✅ `JWT_SECRET`
- ✅ `CORS_ALLOWED_ORIGINS`

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
