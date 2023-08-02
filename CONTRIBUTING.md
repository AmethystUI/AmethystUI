<br>

<div style="width: 100%;" align="center">
    <picture>
        <source media="(prefers-color-scheme: dark)" srcset="./src/assets/pngs/markdown_assets/amethyst_banner_dev_darkmode.png">
        <source media="(prefers-color-scheme: light)" srcset="./src/assets/pngs/markdown_assets/amethyst_banner_dev_lightmode.png">
        <img alt="AmethystUI" height="70px" src="./src/assets/pngs/markdown_assets/amethyst_banner_dev_lightmode.png">
    </picture>
</div>

<br>

# Introduction

AmethystUI is a semantic graphics editor that simplifies the design and testing of UI components, with the goal of making front-end development more efficient. This guide will explain how to install and develop for AmethystUI, and you may use the `☰` button on the top left corner to navigate through different sections.

# Setup
AmethystUI uses Svelte as its frontend framework and Vite as its build tool. Originally, the codebase was built with Rollup as the bundler and build tool, but it was migrated to Vite on April 28th, 2023 in favor of more modern web standards. While the migration process was successful, there may be some unforeseen bugs that were not resolved during the migration. If you encounter any issues, please try to resolve them to the best of your abilities. And if the issue persists, create an issue thread in this repository regarding the problem.

## Prerequisites
Make sure that you have the following installed on your machine:
- Git commandline tools
- `SSH` and `GPG`
- NodeJS `v19.6.0` or newer
- `yarn` Package Manager
- Typescript

## Security
We require that all commits made to this codebase to be done through secure tunnles such as `SSH` or `HTTPS`. If you wish to use `SSH` but not have it setted up, please refer to [this guide](https://docs.github.com/en/authentication/connecting-to-github-with-ssh/checking-for-existing-ssh-keys) by GitHub. `GPG` signed commits are not required, but still highly encouraged. If you wish to set up GPG authentication, please refer to [this guide](https://docs.github.com/en/authentication/managing-commit-signature-verification/checking-for-existing-gpg-keys).

## Cloning & Installation
To install the codebase and development server, follow these instructions:

1. Install any missing prerequisites
2. Open a terminal and run the command that matches your system.
- MacOS / Linux SSH: `git clone git@github.com:AmethystUI/AmethystUI.git amethystui/ && cd amethystui/`
- Windows SSH: `git clone git@github.com:AmethystUI/AmethystUI.git amethystui\ && cd amethystui\`
3. Run `git remote -v` to make sure the origin is set correctly
4. Run `git pull origin` to update everything from Git
5. Run `yarn install` to install the necessary packages

The `amethystui/` folder will now be your working directory, and we recommend creating a VSCode project with `amethystui/` as the root folder.

# Development
The development guide in this repository will mainly cover the development environment, guidelines and rules for the **AmethystUI Frontend Application**. Any reference to "Amethyst" or "AmethystUI" will refer specifically to the frontend application of AmethystUI.

## Overview
All of the UI components in AmethystUI are built from scratch and follow a series of design guidelines. Do not use third party UI/UX components unless it meets all criterias of the AmethystUI design guidelines.

## Application Structure
AmethystUI's UI layout is as shown (*NOT* a file structure):
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

## Configuring Transpilation

AmethystUI relies on its build tools and bundlers to function. Therefore, we have taken extra care to ensure that there are enough customizable configurations to be flexible enough to accommodate any future changes. In this section, we'll cover two main types of configurations: transpiling for the main application and transpiling for the service worker.

### Main Application Transpilation

These configuration files are crucial in ensuring that the AmethystUI application can be tailored to your specific needs. By modifying these files, you can customize the build process, adjust the behavior of Svelte, fine-tune TypeScript settings, create global path shorthands, and control Vite's behavior. With these powerful configuration options at your disposal, you can create a highly flexible and adaptable application that meets your requirements.

- `package.json`
    -  Controls the build commands and processes. It contains scripts for running the development and production builds, as well as any other custom scripts needed for the project.
- `svelte.config.js`
    - Controls the behavior of Svelte, the frontend framework used in AmethystUI. You most likely would not need to touch this at all.
- `tsconfig.json`
    - Controls the global TypeScript behavior. It allows for customization of TypeScript settings such as target version, module resolution, and source map generation.
- `tsconfig.paths.json`
    - Controls the global TypeScript path shorthands, such as `$lib` and `$assets`. These paths can be used to import files and folders without needing to specify the entire path each time.
- `vite.config.ts`
    - Controls the behavior of Vite. It allows for customization of Vite's settings, such as enabling CSS modules, configuring the server, and setting up build optimization.

### Service Worker Transpilation

AmethystUI heavily utilizes Service Workers to fetch data from remote servers. By default, service worker scripts are seperately bundled as static assets into `/src/static/workers/` so that they can be loaded by the browser. It is ***very*** important to note that this build process is done separately with Rollup, and is only used to bundle static asset scripts such as the service worker scripts. Therefore, `rollup.config.js` is ***specifically*** for static script bundles, and should not be used to configure application behaviors.

## Development servers

To start the development server, follow these steps:
1. Navigate to your `amethystui/` directory in a command line environment
2. Make sure that all dependencies are installed with `yarn install`
3. Run `yarn dev`
4. The development server should start automatically, and the application should automatically open up in a new tab of your default browser.

## More stuff
We're still working on the README, but if you have any questions feel free to ask it on our discord server.
