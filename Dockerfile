# Build environment
FROM node:11.0.0 as builder
WORKDIR /app

COPY package*.json ./

RUN npm set progress=false
RUN npm install --production --no-audit
RUN npm install typescript --no-optional
COPY . .
RUN npm run build:backend

# Base image for api and decorator servers
FROM node:11.0.0-alpine as backend-base
WORKDIR /app/
COPY --from=builder /app/dist/backend .
COPY --from=builder /app/node_modules ./node_modules

# API app server
FROM backend-base as api
ARG port=3001
EXPOSE ${port}
CMD ["node", "api/api-server.js"]

# Decorator app server
FROM backend-base as decorator
ARG port=3002
EXPOSE ${port}
CMD ["node", "decorators/decorator-server.js"]
