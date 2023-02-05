/// <reference lib="dom"/>

import App from './App.svelte';
import { loadFonts } from "./workers/pseudoWorkers/fonts";

const app = new App({
	target: document.body
});

window.onload = () => {
	// Initialize font directory. This does not install the fonts.
	loadFonts().catch(
		e => console.error("Error occured during font loading: ", e)
	);

	// register font install script SW.
	registerFontInstaller();
}

const registerFontInstaller = async () => {
	if ("serviceWorker" in navigator) {
	try {
		const registration = await navigator.serviceWorker.register("./workers/fontInstaller.worker.js");
		if (registration.installing) {
			console.log("Service worker installing");
		} else if (registration.waiting) {
			console.log("Service worker installed");
		} else if (registration.active) {
			console.log("Service worker active");
		}
	} catch (error) {
		console.error(`Registration failed with ${error}`);
	}
	}
};

export default app;