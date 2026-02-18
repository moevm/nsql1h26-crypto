FROM gradle:9.2.0-jdk21 AS builder

WORKDIR /app

COPY gradle gradle

COPY gradlew .

COPY build.gradle settings.gradle ./

RUN ./gradlew dependencies --no-daemon

COPY src src

RUN ./gradlew shadowJar --no-daemon

FROM eclipse-temurin:21-jre

WORKDIR /app

COPY --from=builder /app/build/libs/hello_world-1.0-SNAPSHOT.jar app.jar

CMD ["java", "-jar", "app.jar"]
