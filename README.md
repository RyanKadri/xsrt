# XSRT (Exert)

[![Join the chat at https://gitter.im/xsrt-chat/community](https://badges.gitter.im/trilium-notes/Lobby.svg)](https://gitter.im/xsrt-chat/community?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

XSRT is a free and open source session recording tool for web applications. It can be embedded in web applications to allow the owner to record user actions and later play them back as a video. This is useful for tracking hard-to-reproduce bugs and getting a sense of how users are interacting with your application.

![Screenshot of recording](/docs/assets/xsrt-player.png)

## Project Status

This project is still very much in early development. It is not yet intended for production use.

## Privacy Concerns

Some would argue that this code makes it easier for companies to intrude on their customers' privacy. There is definitely some validity to that concern. I the existence of this project is useful for the following reasons:

* Similar session recording tools already exist and are proprietary (Hotjar, Hoverowl, LogRocket for example). Making this project open source and developing in the open are hopefully a step in the right direction
* Watching videos of your users while they are on your site is not actually an efficient way to gather bulk information. It is more useful for one-off bug-tracking and user assistance cases.
* Persistent / hidden tracking across many domains is more of a danger to privacy than tracking on a single site (I would argue).
* This project can by default respect Do Not Track headers and other privacy guidelines

## Setup

There are a few components to this project. All share the same package.json so a single `npm install` should be sufficient to install all dependencies.

### Recording Viewer (Frontend)

This is a standard React app. It builds with webpack and can run in the webpack dev server. You can run the frontend with `npm run start:viewer`.

### Recording API Server (Backend)

This project uses an express backend. You can build and debug in VSCode (via launch configs). This will be updated shortly to allow for a simpler `npm run ***` start.

### Chrome Extension

You can run the recording code on most sites (barring some known issues with "unfriendly" CSPs). To build this code, you can run `npm run build:extension`. Since this is purely a DX tool for this project, I do not plan on adding this to the chrome store. Instead, I would recommend installing it as an unpacked extension