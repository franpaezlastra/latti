# --- Build stage ---
    FROM gradle:8.13-jdk17-alpine AS build
    WORKDIR /app
    COPY . .
    RUN gradle clean bootJar -x test --no-daemon
    
    # --- Runtime stage ---
    FROM eclipse-temurin:17-jre
    WORKDIR /app
    COPY --from=build /app/build/libs/*.jar app.jar
    EXPOSE 8080
    ENTRYPOINT ["java","-Djava.security.egd=file:/dev/./urandom","-jar","/app/app.jar"]
    