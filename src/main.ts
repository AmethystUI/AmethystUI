import App from './App.svelte';
import { loadFonts } from "./workers/pseudoWorkers/fonts";

const app = new App({
	target: document.body
});

window.onload = () => {
	loadFonts().then(
		res => console.debug(`Loaded ${res.fontsLoaded} fonts without errors in ${Math.round(res.timeTook)}ms`)
	).catch(
		e => console.error("Error occured during font loading: ", e)
	); // initialize all fonts
}

export default app;