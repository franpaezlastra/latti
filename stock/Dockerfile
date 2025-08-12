# Multi-stage build para optimizar el tamaño de la imagen
FROM eclipse-temurin:24-jdk-alpine AS builder

# Instalar dependencias del sistema
RUN apk add --no-cache curl

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de configuración de Gradle
COPY gradlew .
COPY gradle gradle
COPY build.gradle .
COPY settings.gradle .

# Descargar dependencias de Gradle
RUN chmod +x ./gradlew && \
    ./gradlew dependencies --no-daemon

# Copiar código fuente
COPY src src

# Construir la aplicación
RUN ./gradlew build -x test --no-daemon

# Imagen de producción
FROM eclipse-temurin:24-jre-alpine

# Instalar dependencias del sistema
RUN apk add --no-cache curl

# Crear usuario no-root
RUN addgroup -g 1001 -S spring && \
    adduser -u 1001 -S spring -G spring

# Establecer directorio de trabajo
WORKDIR /app

# Copiar JAR construido desde la etapa anterior
COPY --from=builder /app/build/libs/*.jar app.jar

# Cambiar propietario del archivo
RUN chown spring:spring app.jar

# Cambiar al usuario no-root
USER spring

# Exponer puerto
EXPOSE 8080

# Variables de entorno para la base de datos
ENV SPRING_PROFILES_ACTIVE=prod
ENV SPRING_DATASOURCE_URL=jdbc:postgresql://${DB_HOST}:${DB_PORT}/${DB_NAME}
ENV SPRING_DATASOURCE_USERNAME=${DB_USERNAME}
ENV SPRING_DATASOURCE_PASSWORD=${DB_PASSWORD}

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:8080/actuator/health || exit 1

# Comando de inicio
ENTRYPOINT ["java", "-jar", "app.jar"]
