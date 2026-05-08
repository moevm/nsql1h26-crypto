# syntax=docker/dockerfile:1
FROM gradle:9.2.0-jdk21 AS builder

WORKDIR /app

COPY gradle gradle

COPY gradlew .

RUN chmod +x gradlew

COPY build.gradle.kts settings.gradle.kts ./

RUN --mount=type=cache,target=/home/gradle/.gradle ./gradlew dependencies --no-daemon

COPY src src

RUN --mount=type=cache,target=/home/gradle/.gradle ./gradlew bootJar --no-daemon \
 && java -Djarmode=tools -jar /app/build/libs/app.jar extract --layers --launcher --destination /app/extracted \
 && mkdir -p /app/extracted/dependencies /app/extracted/spring-boot-loader /app/extracted/snapshot-dependencies /app/extracted/application

FROM eclipse-temurin:21-jre

WORKDIR /app

EXPOSE 8080

COPY --from=builder /app/extracted/dependencies/ ./
COPY --from=builder /app/extracted/spring-boot-loader/ ./
COPY --from=builder /app/extracted/snapshot-dependencies/ ./
COPY --from=builder /app/extracted/application/ ./

CMD ["java", "org.springframework.boot.loader.launch.JarLauncher"]
