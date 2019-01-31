# XSRT (Exert)

[![CircleCI](https://circleci.com/gh/RyanKadri/xsrt/tree/master.svg?style=svg)](https://circleci.com/gh/RyanKadri/xsrt/tree/master)


## Warning. This project is still early in development. Please contact me on the Gitter below for help if you want to be an early adopter.

[![Join the chat at https://gitter.im/xsrt-chat/community](https://badges.gitter.im/trilium-notes/Lobby.svg)](https://gitter.im/xsrt-chat/community?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

XSRT is a free and open source session recording tool for web applications. It can be embedded in web applications to allow the owner to record user actions and later play them back as a video. This is useful for tracking hard-to-reproduce bugs and getting a sense of how users are interacting with your application.

![Screenshot of recording](/docs/assets/xsrt-player.png)

## Project Status

This project is still very much in early development. It is not yet intended for production use.

## Privacy Concerns

Some would argue that this code makes it easier for companies to intrude on their customers' privacy. There is definitely some validity to that concern. I think the existence of this project is useful for the following reasons:

* Similar session recording tools already exist and are proprietary (Hotjar, Hoverowl, LogRocket for example). Making this project open source is hopefully a step in the right direction
* Watching recorded user sessions is not an efficient way to invade user privacy. It is more useful for one-off bug-tracking and user assistance.
* Persistent high-level tracking across many domains is more of a danger to privacy than in-depth tracking on a single site.
* This project can respect Do Not Track headers and other privacy guidelines

## Local Setup

There are a number of environment variables you can set when standing up this project. 
You can copy `.env-example` to `.env` and tweak it as you see fit.

There are a few components to this project. All share the same package.json so a single `npm install` should be sufficient to install all dependencies.

### Recording Viewer (Frontend)

This is a standard React app. It builds with webpack and can run in the webpack dev server. You can run the frontend with `npm run start:viewer`.

### Recording API Server (Backend)

This project uses an express backend. You can build and run with `npm run start:api`

### Decorator Server (Backend)

This project uses an express backend. You can build and run with `npm run start:decorator`

### Chrome Extension

You can run the recording code on most sites (barring some known issues with "unfriendly" CSPs). To build this code, you can run `npm run build:extension`. Since this is purely a DX tool for this project, I do not plan on adding this to the chrome store. Instead, I would recommend installing it as an unpacked extension

## Docker Setup

To run this entire docker-compose application including the Nginx frontend, you will need SSL certs. You can put
existing certs (key and cert file) in `./secret/certs` or can run `sh ./scripts/create-certs-if-needed.sh` to create
self-signed certificates. If you do this, your browser will complain about your certificate not being valid.
That should be fine for local development. 

If you do not choose to have your `STATIC_PORT` environment variable be `443` (default HTTPS), you will need to specifically
enter `https://localhost:<Your Port>`  

You can set up all of the components to this project by running `sh ./scripts/start-docker.sh` if you just want to play around.

If you want to develop with all components in docker, you can run `sh ./scripts/start-docker-dev.sh`.
This Docker setup includes a Webpack dev server with live reloading and will restart the backend containers when
you update backend code.

## Contributing

I would love contributions to this project. I could use help in the following areas:
* Documentation
* Testing
* Docker and General CI/CD
* General Features/Improvements