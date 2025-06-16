FROM eclipse-temurin:21-jdk-alpine

VOLUME /tmp

ARG JAR_FILE=target/workorbit-backend-0.0.1-SNAPSHOT.jar

COPY ${JAR_FILE} app.jar

EXPOSE 10000

ENTRYPOINT ["java","-jar","/app.jar"]