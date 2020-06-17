# Dockerfile for Robert2 API application

FROM mysql:5.7

ENV MYSQL_ROOT_PASSWORD=root
ENV MYSQL_ROOT_USER=root
ENV MYSQL_DATABASE=robert2

EXPOSE 3306
