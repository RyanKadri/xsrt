# Build environment
FROM node:11.0.0 as builder
WORKDIR /app/

COPY package*.json ./
RUN npm set progress=false
RUN npm install --no-audit --no-optional
COPY packages packages
COPY lerna.json ./
RUN npx lerna bootstrap --hoist
COPY webpack.config.js ./

# Backend build environment
FROM builder as backend-builder
RUN npm run build:backend -- --mode production

# Base image for api and decorator servers
FROM node:11.0.0-alpine as backend-base
WORKDIR /app/
COPY --from=backend-builder /app/node_modules ./node_modules

# API app server
FROM backend-base as api
COPY --from=backend-builder /app/dist/backend/api-server.bundle.js* ./
ARG port
EXPOSE ${port}
CMD ["node", "./api-server.bundle.js"]

# Decorator app server
FROM backend-base as decorator
COPY --from=backend-builder /app/dist/backend/decorator-server.bundle.js* ./
ARG port
EXPOSE ${port}
CMD ["node", "./decorator-server.bundle.js"]

# Frontend build environment
FROM builder as frontend-builder
RUN npm run build:viewer

# Frontend Nginx reverse proxy
FROM nginx:1.15.8 as dev-nginx
COPY conf/nginx.conf.template /etc/nginx
EXPOSE 443

FROM nginx:1.15.8 as static-frontend
COPY conf/nginx.conf.template /etc/nginx
EXPOSE 443
COPY --from=frontend-builder /app/dist/web /app
