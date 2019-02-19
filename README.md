# XSRT (Exert)

## Warning. This project is still early in development. Please contact me on the Gitter below for help if you want to be an early adopter.

[![Join the chat at https://gitter.im/xsrt-chat/community](https://badges.gitter.im/trilium-notes/Lobby.svg)](https://gitter.im/xsrt-chat/community?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
[![CircleCI](https://circleci.com/gh/RyanKadri/xsrt/tree/master.svg?style=svg)](https://circleci.com/gh/RyanKadri/xsrt/tree/master)

XSRT is a free and open source session recording tool for web applications. It can be embedded in web applications to allow the owner to record user actions and later play them back as a video. This is useful for tracking hard-to-reproduce bugs and getting a sense of how users are interacting with your application.

![Screenshot of recording](/docs/assets/xsrt-player.png)

## Project Status

This project is still very much in early development. It is not yet intended for production use.

See current and upcoming work here: https://trello.com/b/NAelvlwv/kanban

## Privacy Concerns

Some would argue that this code makes it easier for companies to intrude on their customers' privacy. There is definitely some validity to that concern. I think the existence of this project is useful for the following reasons:

* Similar session recording tools already exist and are proprietary (Hotjar, Hoverowl, LogRocket for example). Making this project open source is hopefully a step in the right direction
* Watching recorded user sessions is not an efficient way to invade user privacy. It is more useful for one-off bug-tracking and user assistance.
* Persistent high-level tracking across many domains is more of a danger to privacy than in-depth tracking on a single site.
* This project can respect Do Not Track headers and other privacy guidelines

## Setup

Please see the wiki here: https://github.com/RyanKadri/xsrt/wiki/Setup for more details on getting this project running

## Contributing

I would love contributions to this project. I could use help in the following areas:
* Documentation
* Testing
* Docker and General CI/CD
* General Features/Improvements