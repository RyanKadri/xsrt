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
FROM node:12.18.2 as decorator

# Run everything after as non-privileged user.
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

WORKDIR /app

# Add user so we don't need --no-sandbox.
RUN groupadd -r pptruser && useradd -r -g pptruser -G audio,video pptruser \
    && mkdir -p /home/pptruser/Downloads \
    && chown -R pptruser:pptruser /home/pptruser \
    && chown -R pptruser:pptruser /app \
    && mkdir -p /var/storage \
    && chown -R pptruser:pptruser /var/storage

USER pptruser

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
