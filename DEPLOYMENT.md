# 🚀 Guía de Despliegue - Latti Stock Backend

## 📋 **Requisitos Previos**

- ✅ Cuenta en GitHub
- ✅ Acceso a Dokploy (servidor con Docker)
- ✅ Acceso SSH al servidor de Dokploy
- ✅ Docker y Docker Compose instalados en Dokploy

---

## 🔧 **PASO 1: Configurar GitHub Secrets**

### **1.1 Ir a tu repositorio en GitHub**
```
https://github.com/franc/latti/settings/secrets/actions
```

### **1.2 Agregar los siguientes secrets:**

| **Secret Name** | **Descripción** | **Ejemplo** |
|-----------------|-----------------|-------------|
| `DOKPLOY_HOST` | IP o dominio del servidor Dokploy | `72.60.11.86` |
| `DOKPLOY_USERNAME` | Usuario SSH en Dokploy | `root` o `ubuntu` |
| `DOKPLOY_SSH_KEY` | Clave privada SSH para acceder a Dokploy | `-----BEGIN OPENSSH PRIVATE KEY-----...` |

---

## 🐳 **PASO 2: Configurar Dokploy (Servidor)**

### **2.1 Conectarse al servidor**
```bash
ssh usuario@72.60.11.86
```

### **2.2 Crear directorio para la aplicación**
```bash
mkdir -p /opt/dokploy
cd /opt/dokploy
```

### **2.3 Crear archivo docker-compose.yml**
```bash
nano docker-compose.yml
```

**Copiar el contenido de `dokploy-deploy/docker-compose.yml`**

### **2.4 Crear archivo .env**
```bash
nano .env
```

**Copiar el contenido de `dokploy-deploy/env.example` y modificar las contraseñas**

### **2.5 Crear directorio para scripts de BD**
```bash
mkdir -p init-scripts
```

**Copiar el contenido de `dokploy-deploy/init-scripts/01-init.sql`**

---

## 🔄 **PASO 3: Configurar Despliegue Automático**

### **3.1 El workflow se ejecuta automáticamente cuando:**
- ✅ Haces `git push` a la rama `main`
- ✅ Modificas archivos en la carpeta `stock/`

### **3.2 Verificar que el workflow esté funcionando:**
```
https://github.com/franc/latti/actions
```

---

## 🚀 **PASO 4: Primer Despliegue**

### **4.1 Hacer commit y push de los cambios**
```bash
git add .
git commit -m "🚀 Configuración de despliegue automático"
git push origin main
```

### **4.2 Verificar el build en GitHub Actions**
- ✅ **Test**: Se ejecutan las pruebas
- ✅ **Build**: Se construye la aplicación
- ✅ **Docker**: Se publica la imagen en GitHub Container Registry
- ✅ **Deploy**: Se despliega automáticamente en Dokploy

---

## 🔍 **PASO 5: Verificar el Despliegue**

### **5.1 Verificar contenedores en Dokploy**
```bash
cd /opt/dokploy
docker-compose ps
```

**Deberías ver:**
- ✅ `latti_postgres_prod` - Base de datos PostgreSQL
- ✅ `latti_backend_prod` - Backend Spring Boot
- ✅ `latti_nginx` - Nginx (opcional)

### **5.2 Verificar logs del backend**
```bash
docker-compose logs -f backend
```

### **5.3 Verificar logs de la base de datos**
```bash
docker-compose logs -f postgres
```

### **5.4 Probar la API**
```bash
curl http://localhost:8080/actuator/health
```

**Respuesta esperada:**
```json
{
  "status": "UP",
  "components": {
    "db": {
      "status": "UP"
    }
  }
}
```

---

## 🛠️ **PASO 6: Configuración de Nginx (Opcional)**

### **6.1 Crear configuración de Nginx**
```bash
nano nginx.conf
```

**Contenido básico:**
```nginx
events {
    worker_connections 1024;
}

http {
    upstream backend {
        server backend:8080;
    }

    server {
        listen 80;
        server_name tu-dominio.com;

        location / {
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }
    }
}
```

---

## 🔧 **PASO 7: Monitoreo y Mantenimiento**

### **7.1 Verificar estado de los servicios**
```bash
docker-compose ps
docker-compose logs --tail=50 backend
```

### **7.2 Reiniciar servicios si es necesario**
```bash
docker-compose restart backend
docker-compose restart postgres
```

### **7.3 Actualizar la aplicación**
```bash
git pull origin main
docker-compose pull
docker-compose up -d --build
```

---

## 🚨 **Solución de Problemas Comunes**

### **Problema: Backend no se conecta a la BD**
```bash
# Verificar variables de entorno
docker-compose exec backend env | grep DB

# Verificar conectividad
docker-compose exec backend ping postgres
```

### **Problema: Puerto 8080 ocupado**
```bash
# Cambiar puerto en docker-compose.yml
ports:
  - "8081:8080"  # Cambiar 8080 por 8081
```

### **Problema: Permisos de archivos**
```bash
# Corregir permisos
chmod 600 .env
chmod 644 docker-compose.yml
```

---

## 📊 **Verificación Final**

### **✅ Checklist de Despliegue:**
- [ ] GitHub Actions ejecutándose correctamente
- [ ] Imagen Docker publicada en GitHub Container Registry
- [ ] Contenedores ejecutándose en Dokploy
- [ ] Base de datos PostgreSQL funcionando
- [ ] Backend Spring Boot respondiendo en `/actuator/health`
- [ ] API accesible desde el exterior
- [ ] Logs sin errores críticos

---

## 🎯 **Próximos Pasos**

1. **Configurar dominio personalizado**
2. **Configurar SSL/HTTPS**
3. **Configurar backup automático de la BD**
4. **Configurar monitoreo con Prometheus/Grafana**
5. **Configurar alertas por email/Slack**

---

## 📞 **Soporte**

Si tienes problemas con el despliegue:
1. ✅ Revisar logs: `docker-compose logs -f`
2. ✅ Verificar GitHub Actions
3. ✅ Verificar variables de entorno
4. ✅ Verificar conectividad de red

**¡El despliegue automático está configurado! 🎉**
