# Build environment
FROM node:11.0.0 as builder
WORKDIR /app/

COPY package*.json ./
COPY webpack* ./
COPY tsconfig*.json ./

RUN npm set progress=false
RUN npm install --no-audit --no-optional
COPY src src

# Backend build environment
FROM builder as backend-builder
RUN npm run build:backend

# Base image for api and decorator servers
FROM node:11.0.0-alpine as backend-base
WORKDIR /app/
COPY --from=backend-builder /app/dist/backend .
COPY --from=backend-builder /app/node_modules ./node_modules

# API app server
FROM backend-base as api
ARG port
EXPOSE ${port}
CMD ["node", "api-service.bundle.js"]

# Decorator app server
FROM backend-base as decorator
ARG port
EXPOSE ${port}
CMD ["node", "decorator-service.bundle.js"]

# Frontend build environment
FROM builder as frontend-builder
RUN npm run build:viewer

FROM builder as dev-builder
RUN npm run build:backend && npm run build:viewer

# Frontend Nginx reverse proxy
FROM nginx:1.15.8 as static-frontend
COPY conf/nginx.conf.template /etc/nginx
COPY ./secret/certs/cert.crt /etc/ssl/certs/
COPY ./secret/certs/cert.key /etc/ssl/private/
COPY --from=frontend-builder /app/dist/web /app
EXPOSE 80
EXPOSE 443
