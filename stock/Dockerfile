FROM gradle:8.13-jdk17-alpine

# Crear carpeta de trabajo
WORKDIR /app

# Copiar todo al contenedor
COPY . .

# Crear la carpeta uploads dentro del contenedor
RUN mkdir -p /app/uploads

# Construir la aplicación (sin tests para acelerar; quita -x test si quieres)
RUN gradle clean build -x test --no-daemon

# Exponer el puerto de Spring Boot
EXPOSE 8080

# Declarar carpeta como volumen (opcional, pero buena práctica)
VOLUME ["/app/uploads"]

# Ejecutar la app
ENTRYPOINT ["java", "-jar", "build/libs/empresas-0.0.1-SNAPSHOT.jar"]
