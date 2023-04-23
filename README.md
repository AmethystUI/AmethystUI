<div style="margin-top:1rem; padding: 20px; display:flex; justify-content: center; width: calc(100% - 20px);">
    <picture>
        <source media="(prefers-color-scheme: dark)" srcset="./public/assets/pngs/markdown_assets/amethyst_banner_dev_darkmode.png">
        <source media="(prefers-color-scheme: light)" srcset="./public/assets/pngs/markdown_assets/amethyst_banner_dev_lightmode.png">
        <img alt="AmethystUI" height="70px" src="./public/assets/pngs/markdown_assets/amethyst_banner_dev_lightmode.png">
    </picture>
</div>

# Introduction

AmethystUI is a semantic graphics editor that simplifies the design and testing of UI components, with the goal of making front-end development more efficient. This guide will explain how to install and develop for AmethystUI, and you may use the `☰` button on the top left corner to navigate through different sections.

# Setup
AmethystUI uses Svelte as its frontend framework and Rollup as its modle bundler. It also includes two live development server that's ready to use; One for the frontend application and one for the service workers.

## Prerequisites
Make sure that you have the following installed on your machine:
- Git commandline tools
- `SSH` and `GPG`
- NodeJS `v19.6.0` or newer
- `npm` and `yarn` Package Managers
- Typescript

## Security
We require that all commits made to this codebase to be done through secure tunnles such as `SSH` or `HTTPS`. If you wish to use `SSH` but not have it setted up, please refer to [this guide](https://docs.github.com/en/authentication/connecting-to-github-with-ssh/checking-for-existing-ssh-keys) by GitHub. `GPG` signed commits are not required, but still highly encouraged. If you wish to set up GPG authentication, please refer to [this guide](https://docs.github.com/en/authentication/managing-commit-signature-verification/checking-for-existing-gpg-keys).

## Cloning & Installation
To install the codebase and development server, follow these instructions:

1. Install any missing prerequisites
2. Open a terminal and run the command that matches your system.
- MacOS / Linux SSH: `git clone git@github.com:AmethystUI/AmethystUI.git amethystui/ && cd amethystui/`
- Windows SSH: `git clone git@github.com:AmethystUI/AmethystUI.git amethystui\ && cd amethystui\`
3. Run `git pull origin` to update everything from Git
4. Run `yarn install` to install the necessary packages

The `amethystui/` folder will now be your working directory, and we recommend creating a VSCode project with `amethystui/` as the root folder.

# Development
The development guide in this repository will mainly cover the development environment, guidelines and rules for the **AmethystUI Frontend Application**. Any reference to "Amethyst" or "AmethystUI" will refer specifically to the frontend application of AmethystUI.

## Overview
All of the UI components in AmethystUI are built from scratch and follow a series of design guidelines. Do not use third party UI/UX components unless it meets all criterias of the AmethystUI design guidelines.

## Application Structure
AmethystUI's UI layout is as follows:
```
Main App
│
├ Frontend
│    ├ Left panel
│    │   ├ Editor selector
│    │   └ Current view layer
│    │       ├ Elements / Overrides
│    │       ├ Component layers
│    │       └ ...
│    ├ Top panel
│    │   ├ New element
│    │   ├ File name
│    │   └ General app control
│    │       ├ Canvas mode
│    │       ├ Export
│    │       ├ ...
│    │       └ Account info
│    ├ Display panel
│    │   ├ Element preview
│    │   └ ...
│    └ Right panel
│    │   ├ Bounding box editor
│    │   ├ Appearance editor
│    │   └ ...
│    └ Modals
│    └ Dynamic Overlays
└ Service workers
    └ ...
```

- **Main App**: This is essentially the entire AmethystUI application. Everything falls under here.

- **Frontend**: This is the part of the app that the user interacts with. It contains several sub-components:
    1. **Left Panel**: This panel contains the editor selector and the current view layer. The view layer is further subdivided into elements/overrides, component layers, and other related options. The contents of the view layer is also controlled by the editor selector.
    2. **Top Panel**: This panel contains controls for creating new elements, setting file names, and general app controls. General app controls include options like canvas mode, export, account info, and more.
    3. **Display Panel**: This panel contains an element preview and other related display options. The content of this panel is also controlled by the editor selector.
    4. **Right Panel**: This panel contains options for editing bounding boxes, adjusting the appearance of elements, and other related options. The content of this panel is also controlled by the editor selector.
    5. **Modals**: These are blocking popup windows that appear on top of the main UI to provide additional options or information, such as editing account information and export settings.
    6.**Dynamic Overlays**: These are floating, draggable, non-blocking modals that appear on certain contexts (such as picking colors or choosing fonts) on top of the main UI to provide more control over a certain attribute.
- Service Workers: These are separate threads that handle various background tasks. Currently, we only use it to fetch font files using the Google Fonts API and cache them into IndexedDB.

## Development servers

AmethystUI heavily utilize Service Workers to fetch data from remote servers, so it has two separate development servers that should boot up upon running `yarn run dev`.

To make sure both are running, make sure the debug message `Your application is ready~! 🚀` is shown twice. After the server has booted up, you should see a link from the development server that reads `http://localhost:{port-number}`. You may open the link in a web browser, and you should see the AmethystUI app hosted locally.

## More stuff
We're still working on the README, but if you have any questions feel free to ask it on our discord server.