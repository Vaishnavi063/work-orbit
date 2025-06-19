# --- Stage 1: Build the application ---
FROM eclipse-temurin:21-jdk-alpine AS builder

WORKDIR /app

COPY . .

RUN ./mvnw clean package -DskipTests


# --- Stage 2: Create the final, lightweight image ---
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

COPY --from=builder /app/target/backend-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 10007

ENTRYPOINT ["java","-jar","/app/app.jar"]