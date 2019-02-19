# Dev builder
FROM node:11.9.0 as dev-builder
WORKDIR /app/
CMD npm run build:docker

# Frontend Nginx reverse proxy
FROM nginx:1.15.8 as dev-nginx
COPY conf/nginx.conf.template /etc/nginx
EXPOSE 443

# API app server
FROM node:11.9.0-slim as dev-api
WORKDIR /app
ARG port
EXPOSE ${port}

# Decorator app server
# See https://github.com/GoogleChrome/puppeteer/blob/master/docs/troubleshooting.md#running-puppeteer-in-docker
# for more details on setup
FROM node:11.9.0-slim as dev-decorator

# See https://crbug.com/795759
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

RUN npm i puppeteer

RUN groupadd -r pptruser && useradd -r -g pptruser -G audio,video pptruser \
    && mkdir -p /home/pptruser/Downloads \
    && chown -R pptruser:pptruser /home/pptruser \
    && chown -R pptruser:pptruser /node_modules \
    && mkdir -p /var/storage \
    && chown -R pptruser:pptruser /var/storage

USER pptruser

WORKDIR /app
ARG port
EXPOSE ${port}
