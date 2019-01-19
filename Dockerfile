# Build environment
FROM node:11.0.0 as builder
WORKDIR /app/

COPY package*.json ./

RUN npm set progress=false
RUN npm install --no-audit --no-optional

# Backend build environment
FROM builder as backend-builder
COPY src src
COPY tsconfig*.json ./
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
CMD ["node", "api/api-server.js"]

# Decorator app server
FROM backend-base as decorator
ARG port
EXPOSE ${port}
CMD ["node", "decorators/decorator-server.js"]

# Frontend build environment
FROM builder as frontend-builder

COPY src src
COPY webpack.* ./
COPY tsconfig*.json ./
RUN npm run build:viewer

FROM nginx:1.15.8 as static-frontend
COPY conf/xsrt.template /etc/nginx/conf.d
COPY ./secret/certs/cert.crt /etc/ssl/certs/
COPY ./secret/certs/cert.key /etc/ssl/private/
COPY --from=frontend-builder /app/dist/web /app
EXPOSE 80
EXPOSE 443
