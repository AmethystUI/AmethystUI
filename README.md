# DEVELOPMENT

AmethystUI is built with Svelte and Rollup, and a live development server is available to use. We recommend VSCode for development, but any non-IDE text editors will also work. The commands in this guide are targeted for MacOS and Linux.

To install the codebase and development server, follow these instructions:

1. Make sure that  `git`, `npm`, `yarn`, and `node` is installed on your machine
2. Open a terminal and run `git clone https://github.com/AmethystUI/AmethystUI.git amethystui/ && cd amethystui/`, or alternatively, `git clone git@github.com:AmethystUI/AmethystUI.git amethystui/ && cd amethystui/` if you prefer ssh.
3. Run `git pull origin` to update everything from Git
4. Run `yarn install` to install the necessary packages

The `amethystui/` folder will now be your working directory, and we recommend creating a VSCode project with `amethystui/` as the root folder.

To start the development server, navigate to the `amethystui/` folder and run `yarn run dev` in the terminal.

AmethystUI heavily utilize Service Workers to fetch data from remote servers, so it has two separate development servers that should boot up upon running `yarn run dev`. To make sure both are running, make sure the debug message `Your application is ready~! 🚀` is shown twice. After the server has booted up, you should see a link from the development server that reads `http://localhost:{port-number}`. You may open the link in a web browser, and you should see the AmethystUI app hosted locally.
