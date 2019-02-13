# Dev builder
FROM node:11.9.0 as dev-builder
WORKDIR /app/
CMD npm run build:docker

# Frontend Nginx reverse proxy
FROM nginx:1.15.8 as dev-nginx
COPY conf/nginx.conf.template /etc/nginx
EXPOSE 443

# API app server
FROM node:11.9.0-alpine as dev-api
WORKDIR /app
ARG port
EXPOSE ${port}

# Decorator app server
FROM node:11.9.0-alpine as dev-decorator
WORKDIR /app
ARG port
EXPOSE ${port}
