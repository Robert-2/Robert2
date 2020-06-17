# Dockerfile for Robert2 API application

FROM webdevops/php-apache-dev:7.1

COPY ./apache_default.conf /etc/apache2/sites-available/000-default.conf

WORKDIR /app

RUN apt-get update && apt-get upgrade -y
RUN apt-get install -y vim

EXPOSE 80
EXPOSE 443
