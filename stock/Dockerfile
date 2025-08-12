# Multi-stage build para optimizar el tamaño final
FROM eclipse-temurin:24-jdk-alpine AS builder

# Instalar dependencias del sistema
RUN apk add --no-cache \
    curl \
    unzip \
    && rm -rf /var/cache/apk/*

# Crear directorio de trabajo
WORKDIR /app

# Copiar archivos de configuración de Gradle
COPY gradlew ./
COPY gradle/ gradle/
COPY build.gradle ./
COPY settings.gradle ./

# Dar permisos de ejecución al wrapper de Gradle
RUN chmod +x ./gradlew

# Descargar dependencias de Gradle (capa separada para mejor cache)
RUN ./gradlew dependencies --no-daemon

# Copiar código fuente
COPY src/ src/

# Construir la aplicación (excluyendo tests para producción)
RUN ./gradlew build -x test --no-daemon

# Runtime stage
FROM eclipse-temurin:24-jre-alpine

# Instalar dependencias del sistema para runtime
RUN apk add --no-cache \
    curl \
    && rm -rf /var/cache/apk/*

# Crear usuario no-root para seguridad
RUN addgroup -g 1001 -S appgroup && \
    adduser -u 1001 -S appuser -G appgroup

# Crear directorio de trabajo
WORKDIR /app

# Copiar JAR desde el stage de build
COPY --from=builder /app/build/libs/*.jar app.jar

# Cambiar ownership al usuario no-root
RUN chown -R appuser:appgroup /app

# Cambiar al usuario no-root
USER appuser

# Exponer puerto
EXPOSE 8080

# Variables de entorno por defecto
ENV SPRING_PROFILES_ACTIVE=prod
ENV SERVER_PORT=8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:8080/actuator/health || exit 1

# Comando de inicio
ENTRYPOINT ["java", "-jar", "app.jar"]
