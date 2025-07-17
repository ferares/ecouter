# Écouter

## Inspiration

Project I did for my French class. My teacher needed an easy way to play the audios from our text book either from her laptop, cellphone or tablet. There was no way to read the original CDs, a pendrive wasn't a good solution for mobile devices, Google Drive proved to be too slow and cumbersome and the same can be said about some books' web sites.

## Demo

![](https://github.com/ferares/ecouter/blob/main/demo.gif)

## Features

- The project can be deployed to a public server available to both teachers and students worldwide.

- It can host multiple books at once, all available from the main menu.

- Each book is divided into units that are displayed as collapsible accordions for a quick and easy search of the desired audio tracks.

- Custom audio player with "back" and "forward" buttons (for skipping 5 seconds back or forward).

- Responsive design ideal for mobile devices, with big buttons and a simple, clutter free, interface.

- PWA functionality so it can be installed and launched as a standalone app on mobile devices.

## How to use

You'll need [Node.js](https://nodejs.org) & [pnpm](https://pnpm.io/) for building the project.

After installing those, on the project root directory, just run `pnpm i` to install the build dependencies and then either `pnpm dev` to startup a development server or `pnpm build` to build the project into the `dist` folder

Finally you'll want to add some audio tracks to a subfolder named `tracks` in the `public` directory and then create a `data.json` file (also placed in the public directory) with the info of all the tracks you've just added. The data structure of the `data.json` file must follow the `Book[]` type as defined in `src/main.ts`.

## Cache busting

As a cache busting method for the `data.json` file we use a query string `?v={version_number}`. Remember to update that version number on the `src/main.ts:fetchData` function whenever you update the `data.json` file.
