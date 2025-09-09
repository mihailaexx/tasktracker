# Use Maven 3.9.11 with OpenJDK 21 as the base image
FROM maven:3.9.11-eclipse-temurin-21 AS builder

# Set the working directory
WORKDIR /app

# Copy the pom.xml and download dependencies
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy the source code
COPY src ./src

# Build the application
RUN mvn package -DskipTests

# Use OpenJDK 21 as the runtime base image
FROM openjdk:21-jdk-slim

ARG VERSION=0.0.2-SNAPSHOT

# Set the working directory
WORKDIR /app

# Copy the jar file from the builder stage
COPY --from=builder /app/target/task-tracker-${VERSION}.jar app.jar

# Set default environment variable for Spring profile
ENV SPRING_PROFILES_ACTIVE=prod

# Expose the port
EXPOSE 8080

# Run the application with docker profile by default
ENTRYPOINT ["java", "-Dspring.profiles.active=${SPRING_PROFILES_ACTIVE}", "-jar", "app.jar"]
