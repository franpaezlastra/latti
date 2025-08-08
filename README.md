# Sistema de Gestión de Stock - Latti

Un sistema completo de gestión de inventario desarrollado con **Spring Boot** (backend) y **React** (frontend) para la gestión de insumos, productos y movimientos de stock.

## 🚀 Características Principales

### **Gestión de Insumos**
- ✅ Registro y gestión de materias primas
- ✅ Control de stock actual
- ✅ Seguimiento de precios de compra
- ✅ Cálculo automático de inversión total

### **Gestión de Productos**
- ✅ Creación de productos con recetas
- ✅ Control de stock por lotes
- ✅ Fechas de vencimiento
- ✅ Precios de venta por unidad

### **Movimientos de Stock**
- ✅ Entradas y salidas de insumos
- ✅ Producción y ventas de productos
- ✅ Ventas por lotes específicos
- ✅ Validaciones de stock en tiempo real

### **Dashboard Inteligente**
- ✅ Resumen financiero
- ✅ Alertas de stock bajo
- ✅ Seguimiento de lotes
- ✅ Estadísticas de ventas

## 🛠️ Tecnologías Utilizadas

### **Backend (Spring Boot)**
- **Java 17** - Lenguaje principal
- **Spring Boot 3.x** - Framework de desarrollo
- **Spring Security** - Autenticación JWT
- **Spring Data JPA** - Persistencia de datos
- **H2 Database** - Base de datos en memoria
- **Gradle** - Gestión de dependencias

### **Frontend (React)**
- **React 18** - Biblioteca de UI
- **Vite** - Build tool y dev server
- **Redux Toolkit** - Gestión de estado
- **React Router** - Navegación
- **Tailwind CSS** - Estilos y diseño
- **React Icons** - Iconografía

## 📁 Estructura del Proyecto

```
latti-nuevo/
├── nuevofrontlatti/          # Frontend React
│   ├── src/
│   │   ├── components/       # Componentes reutilizables
│   │   ├── pages/           # Páginas principales
│   │   ├── store/           # Redux store
│   │   ├── services/        # Servicios API
│   │   └── utils/           # Utilidades
│   └── package.json
├── stock/                    # Backend Spring Boot
│   ├── src/main/java/
│   │   └── com/Latti/stock/
│   │       ├── controllers/  # Controladores REST
│   │       ├── service/      # Lógica de negocio
│   │       ├── modules/      # Entidades JPA
│   │       └── dtos/        # Data Transfer Objects
│   └── build.gradle
└── README.md
```

## 🚀 Instalación y Configuración

### **Prerrequisitos**
- **Java 17** o superior
- **Node.js 18** o superior
- **npm** o **yarn**

### **Backend (Spring Boot)**

1. **Navegar al directorio del backend:**
   ```bash
   cd stock
   ```

2. **Ejecutar la aplicación:**
   ```bash
   ./gradlew bootRun
   ```
   
   O en Windows:
   ```bash
   gradlew.bat bootRun
   ```

3. **El servidor estará disponible en:**
   ```
   http://localhost:8080
   ```

### **Frontend (React)**

1. **Navegar al directorio del frontend:**
   ```bash
   cd nuevofrontlatti
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Ejecutar en modo desarrollo:**
   ```bash
   npm run dev
   ```

4. **La aplicación estará disponible en:**
   ```
   http://localhost:5173
   ```

## 🔧 Configuración de Base de Datos

El proyecto utiliza **H2 Database** en memoria por defecto. Los datos se resetean al reiniciar la aplicación.

### **Configuración en `application.properties`:**
```properties
spring.datasource.url=jdbc:h2:mem:testdb
spring.datasource.driverClassName=org.h2.Driver
spring.datasource.username=sa
spring.datasource.password=
spring.jpa.database-platform=org.hibernate.dialect.H2Dialect
spring.h2.console.enabled=true
```

## 🔐 Autenticación

El sistema utiliza **JWT (JSON Web Tokens)** para la autenticación:

- **Registro**: `/api/auth/register`
- **Login**: `/api/auth/login`
- **Protección**: Todas las rutas excepto auth requieren token válido

## 📊 API Endpoints

### **Autenticación**
- `POST /api/auth/register` - Registro de usuarios
- `POST /api/auth/login` - Login de usuarios

### **Insumos**
- `GET /api/insumos` - Listar insumos
- `POST /api/insumos` - Crear insumo
- `PUT /api/insumos/{id}` - Actualizar insumo
- `DELETE /api/insumos/{id}` - Eliminar insumo

### **Productos**
- `GET /api/productos` - Listar productos
- `POST /api/productos` - Crear producto
- `PUT /api/productos/{id}` - Actualizar producto
- `DELETE /api/productos/{id}` - Eliminar producto

### **Movimientos**
- `GET /api/movimiento-insumo` - Listar movimientos de insumos
- `POST /api/movimiento-insumo` - Crear movimiento de insumo
- `GET /api/movimiento-productos` - Listar movimientos de productos
- `POST /api/movimiento-productos` - Crear movimiento de producto
- `POST /api/venta-por-lotes` - Crear venta por lotes específicos

## 🎨 Características de UI/UX

### **Diseño Responsive**
- ✅ Adaptable a móviles, tablets y desktop
- ✅ Navegación intuitiva
- ✅ Formularios validados

### **Componentes Reutilizables**
- ✅ Modales estéticos
- ✅ Tablas con paginación
- ✅ Formularios con validación
- ✅ Notificaciones y alertas

### **Tema Visual**
- ✅ Paleta de colores consistente
- ✅ Iconografía clara
- ✅ Espaciado y tipografía optimizados

## 🔄 Flujo de Trabajo

### **1. Gestión de Insumos**
1. Registrar insumos con precio de compra
2. Realizar movimientos de entrada/salida
3. Sistema actualiza automáticamente stock y precios

### **2. Gestión de Productos**
1. Crear productos con recetas de insumos
2. Producir productos (entrada) - descuenta insumos
3. Vender productos (salida) - puede ser por lotes

### **3. Control de Lotes**
1. Cada entrada de producto crea lotes
2. Ventas pueden especificar lotes específicos
3. Seguimiento de fechas de vencimiento

## 🚀 Despliegue

### **Backend (Producción)**
```bash
cd stock
./gradlew build
java -jar build/libs/stock-0.0.1-SNAPSHOT.jar
```

### **Frontend (Producción)**
```bash
cd nuevofrontlatti
npm run build
```

## 🤝 Contribución

1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 👥 Autores

- **Desarrollador Principal** - Sistema de gestión de stock Latti

## 🙏 Agradecimientos

- Spring Boot team por el excelente framework
- React team por la biblioteca de UI
- Tailwind CSS por el sistema de diseño
- Comunidad open source por las herramientas utilizadas

---

**¡Gracias por usar el Sistema de Gestión de Stock Latti!** 🎉
