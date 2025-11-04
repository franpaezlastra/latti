# 🚨 Solución: Base de Datos se Borra en cada Deploy

## 📋 Problema
La base de datos se reinicia/borra cada vez que haces un push porque:

1. ❌ No está configurada la variable `SPRING_PROFILES_ACTIVE=prod` en Dockploy
2. ❌ El perfil `dev` usa `create-drop` que BORRA toda la BD
3. ❌ Está usando H2 en memoria por defecto

## ✅ Solución en Dockploy

### Paso 1: Verificar/Agregar Variables de Entorno

Ve a tu servicio en Dockploy → **Environment Variables** y asegúrate de tener:

```bash
# 🔴 CRÍTICO: Esta variable es la más importante
SPRING_PROFILES_ACTIVE=prod

# 📊 Base de Datos PostgreSQL (debes tener una BD externa)
SPRING_DATASOURCE_URL=jdbc:postgresql://tu-host:5432/tu_base_datos
SPRING_DATASOURCE_USERNAME=tu_usuario
SPRING_DATASOURCE_PASSWORD=tu_password

# 🔧 Configuración JPA (IMPORTANTE)
SPRING_JPA_HIBERNATE_DDL_AUTO=update

# 🔐 JWT
JWT_SECRET=tu_clave_secreta_segura_minimo_32_caracteres

# 🌐 CORS
CORS_ALLOWED_ORIGINS=https://tu-frontend.com
```

### Paso 2: Opciones para `SPRING_JPA_HIBERNATE_DDL_AUTO`

```bash
# Para primera vez (crea las tablas):
SPRING_JPA_HIBERNATE_DDL_AUTO=update

# Después del primer deploy (más seguro):
SPRING_JPA_HIBERNATE_DDL_AUTO=validate

# Si tienes migraciones con Flyway/Liquibase:
SPRING_JPA_HIBERNATE_DDL_AUTO=none
```

### Paso 3: Guardar y Redesplegar

1. Guarda las variables de entorno en Dockploy
2. Haz un nuevo deploy (o espera el auto-deploy)
3. Verifica en los logs que diga: `The following 1 profile is active: "prod"`

## 🎯 Verificación

Después del deploy, revisa los logs en Dockploy y busca:

✅ **Correcto:**
```
The following 1 profile is active: "prod"
HikkadiCP - Using PostgreSQL database
Hibernate: validate
```

❌ **Incorrecto (se borrará la BD):**
```
The following 1 profile is active: "dev"
H2 Console available at '/h2-console'
Hibernate: create-drop
```

## 📝 Notas Importantes

1. **Primera vez**: Usa `update` para crear las tablas automáticamente
2. **Producción estable**: Cambia a `validate` para más seguridad
3. **Backups**: Configura backups automáticos en tu servicio de PostgreSQL
4. **PostgreSQL**: Asegúrate de tener una base de datos PostgreSQL externa (Railway, Supabase, etc.)

## 🔍 Si sigue pasando

Copia y pega este comando en Dockploy para ver qué perfil está usando:

```bash
docker logs tu-contenedor | grep "profile"
```

Deberías ver: `The following 1 profile is active: "prod"`

