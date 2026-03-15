# Step 1: Use Maven to build the app
FROM maven:3.8.4-openjdk-17 AS build
WORKDIR /app
COPY . .
RUN mvn clean package -DskipTests

# Step 2: Run the app
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 10000
# Force Spring Boot to listen on Port 10000
ENTRYPOINT ["java", "-Dserver.port=10000", "-jar", "app.jar"]