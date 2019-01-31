# Build environment
FROM node:11.0.0 as builder
WORKDIR /app/

COPY package*.json ./
RUN npm set progress=false
RUN npm install --no-audit --no-optional
COPY packages packages
RUN npx tsc -b packages/
COPY lerna.json ./
RUN npx lerna bootstrap

COPY webpack.config.js ./

# Backend build environment
FROM builder as backend-builder
RUN npm run build:backend

# Base image for api and decorator servers
FROM node:11.0.0-alpine as backend-base
WORKDIR /app/
COPY --from=backend-builder /app/node_modules ./node_modules
COPY --from=backend-builder /app/packages/common ./common/
COPY --from=backend-builder /app/packages/common-backend ./common-backend/


# API app server
FROM backend-base as api
COPY --from=backend-builder /app/packages/api/dist ./api/dist
COPY --from=backend-builder /app/packages/api/node_modules ./api/node_modules

ARG port
EXPOSE ${port}
CMD ["node", "./api/dist/api-server.js"]

# Decorator app server
FROM backend-base as decorator
COPY --from=backend-builder /app/packages/decorators/dist ./decorators/dist
COPY --from=backend-builder /app/packages/decorators/node_modules ./decorators/node_modules
ARG port
EXPOSE ${port}
CMD ["node", "./decorators/dist/decorator-server.js"]

# Frontend build environment
FROM builder as frontend-builder
RUN npm run build:viewer

FROM builder as dev-builder
RUN npm run build:backend && npm run build:viewer

# Frontend Nginx reverse proxy
FROM nginx:1.15.8 as static-frontend
COPY conf/nginx.conf.template /etc/nginx
COPY --from=frontend-builder /app/dist/web /app
EXPOSE 443
