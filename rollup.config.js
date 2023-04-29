/**
 * @WARNING: THIS IS NOT RESPONSIBLE FOR THE MAIN APPLICATION CODE!
 * This rollup config is used ONLY for generating the service worker JS files. The main application code is managed by Vite.
 * 
 * If you are trying to configure compilation settings for the main application code, this is not the place to do it!
 */

import typescript from "@rollup/plugin-typescript";
import glob from "glob";
import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import livereload from "rollup-plugin-livereload";
import { terser } from "rollup-plugin-terser";

const production = !process.env.ROLLUP_WATCH;

const workerFiles = glob.sync("./src/lib/workers/**/*.worker.ts"); // worker files

const workerConfigs = workerFiles.map((workerFile) => ({ // Worker scripts
	input: workerFile,
	output: {
		sourcemap: true,
		format: "iife",
		name: workerFile.replace(/src\/workers\//, "").replace(/\.ts$/, ""),
		file: `${process.cwd()}/src/static/workers/${workerFile.replace(/^\.\/src\/lib\/workers\//, "").replace(/\.ts$/, ".js")}`
	},
	plugins: [
		resolve({
			browser: true,
			dedupe: ["svelte"]
		}),
		commonjs(),
		typescript({
			sourceMap: !production,
			inlineSources: !production
		}),

		// Watch the `public` directory and refresh the
		// browser on changes when not in production
		!production && livereload("public"),

		// If we"re building for production (yarn build
		// instead of yarn dev), minify
		production && terser()
	],
	watch: {
		clearScreen: true,
	}
}))

export default [...workerConfigs];
