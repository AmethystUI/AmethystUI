import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    svelte(),
  ],

  resolve: {
    alias: {
      $src: path.resolve(new URL('./src/', import.meta.url).pathname),
      $public: path.resolve(new URL('./public', import.meta.url).pathname),
      $lib: path.resolve(new URL('./src/lib/', import.meta.url).pathname),
      $assets: path.resolve(new URL('./src/assets/', import.meta.url).pathname),
      $static: path.resolve(new URL('./src/static/', import.meta.url).pathname),
    },
  },
})
