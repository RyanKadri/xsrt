# Build environment
FROM node:12.18.2 as builder
WORKDIR /app/

COPY package*.json ./
RUN npm set progress=false
RUN npm install --no-audit
COPY packages/common/package.json ./packages/common/package.json
COPY packages/common-backend/package.json ./packages/common-backend/package.json
COPY packages/api/package.json ./packages/api/package.json
COPY packages/decorators/package.json ./packages/decorators/package.json
COPY lerna.json ./
RUN npx lerna bootstrap --hoist
COPY packages packages
COPY tsconfig.json ./
COPY webpack.config.js ./

FROM builder as backend-builder
RUN npm run package:backend

# Backend builder
FROM node:12.18.2-alpine as api
WORKDIR /app
COPY --from=backend-builder /app/dist/backend/api-server.bundle.js /app/api.js
EXPOSE 8080
CMD ["node", "./api.js"]

# Decorator server
FROM node:12.18.2-alpine as decorators

RUN apk update && apk add --no-cache nmap && \
    echo @edge http://nl.alpinelinux.org/alpine/edge/community >> /etc/apk/repositories && \
    echo @edge http://nl.alpinelinux.org/alpine/edge/main >> /etc/apk/repositories && \
    apk update && \
    apk add --no-cache \
      chromium \
      harfbuzz \
      "freetype>2.8" \
      ttf-freefont \
      nss

ADD https://github.com/Yelp/dumb-init/releases/download/v1.2.0/dumb-init_1.2.0_amd64 /usr/local/bin/dumb-init
RUN chmod +x /usr/local/bin/dumb-init

WORKDIR /app

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
# Install puppeteer so it's available in the container.
RUN npm i puppeteer

COPY --from=backend-builder /app/dist/backend/decorator-server.bundle.js /app/decorator-server.js
EXPOSE 8080

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "./decorator-server.js"]

# Frontend Nginx reverse proxy
FROM nginx:1.15.8 as dev-nginx
COPY conf/nginx.conf.template /etc/nginx
EXPOSE 443
