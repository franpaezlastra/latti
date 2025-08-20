FROM gradle:8.13-jdk17-alpine

WORKDIR /app
COPY . .

# Carpeta para subidas
RUN mkdir -p /app/uploads

# Construir (sin tests para acelerar)
RUN gradle clean bootJar -x test --no-daemon

EXPOSE 8080
VOLUME ["/app/uploads"]

# 👇 Ejecuta CUALQUIER jar que se haya generado
ENTRYPOINT ["sh", "-c", "java -jar build/libs/*.jar"]
