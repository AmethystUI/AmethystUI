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
	registerFontInstaller().then((installer: ServiceWorker) => {
		// download fonts
		console.debug("Font installer loaded and activated successfully.");
		installer.postMessage({ command: "downloadRequiredFonts" });		
	}).catch(err => {
		// cannot download web fonts
		console.error(err);
	});
}

/**
 * Function to register a font installer service worker.
 * @returns Promise that resolves with the ServiceWorker instance when it's installed and activated.
 */
const registerFontInstaller = (): Promise<ServiceWorker> => {
	return new Promise<ServiceWorker>(async (res, rej) => {
		// Check if the browser supports service workers
		if ("serviceWorker" in navigator) {
			try {
				// Register the service worker located at "./workers/fontInstaller.worker.js"
				const registration = await navigator.serviceWorker.register("./workers/fontInstaller.worker.js");

				// If the service worker is not active, add an event listener to track its installation progress
				if (!registration.active) {
					registration.addEventListener("updatefound", () => {
						// Add a new temporary promise to allow timeouts
						const workerPromise = new Promise<ServiceWorker>((resolve, reject) => {
							let timedOut = false;
							const timeoutId = setTimeout(() => {
								timedOut = true;
								return reject(new Error("Font installer activation timeout"));
							}, 5000); // set a timeout of 5 seconds

							const attemptToResolveWorker = (): void => {
								if (!!registration.active && registration.active.state === "activated") { // return the service worker
									clearTimeout(timeoutId);
									clearInterval(intervalID);
									return resolve(registration.installing ?? registration.active);
								}
							}

							// check every 500ms to see if the worker is active. If it is, resolve the promise with the worker.
							let intervalID = setInterval(attemptToResolveWorker, 500)

							// do an initial check to see if the worker is active anyways
							attemptToResolveWorker();
						});

						workerPromise.then(worker => {
							return res(worker);
						}).catch(err => {
							throw err;
						});
					});
				} else {
					// If the worker is already active, resolve the promise with the worker instance
					return res(registration.active);
				}
			} catch (error) {
				// If there is an error while registering the service worker, reject the promise with the error message
				return rej("Font installer service worker failed to register. Reason: " + error);
			}
		} else {
			// If the browser doesn't support service workers, reject the promise with an error message
			return rej("Browser doesn't support service workers.");
		}
	});
};  

export default app;