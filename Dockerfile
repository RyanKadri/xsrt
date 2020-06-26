# Build environment
FROM node:11.9.0 as builder
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
FROM node:11.9.0-slim as backend-base
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
RUN apt-get update && apt-get install -yq libgconf-2-4
RUN apt-get update && apt-get install -y wget --no-install-recommends \
    && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
    && apt-get update \
    && apt-get install -y google-chrome-unstable fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst ttf-freefont \
      --no-install-recommends \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get purge --auto-remove -y curl \
    && rm -rf /src/*.deb

ADD https://github.com/Yelp/dumb-init/releases/download/v1.2.0/dumb-init_1.2.0_amd64 /usr/local/bin/dumb-init
RUN chmod +x /usr/local/bin/dumb-init

# Install puppeteer so it's available in the container.
RUN npm i puppeteer

# Add user so we don't need --no-sandbox.
RUN groupadd -r pptruser && useradd -r -g pptruser -G audio,video pptruser \
    && mkdir -p /home/pptruser/Downloads \
    && chown -R pptruser:pptruser /home/pptruser \
    && chown -R pptruser:pptruser /node_modules \
    && mkdir -p /var/storage \
    && chown -R pptruser:pptruser /var/storage

# Run everything after as non-privileged user.
USER pptruser

COPY --from=backend-builder /app/dist/backend/decorator-server.bundle.js* ./

ARG port
EXPOSE ${port}
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "./decorator-server.bundle.js"]

# Frontend build environment
FROM builder as frontend-builder
RUN npm run build:viewer

# Frontend Nginx reverse proxy
FROM nginx:1.15.8 as dev-nginx
COPY conf/nginx.conf.template /etc/nginx
EXPOSE 443
