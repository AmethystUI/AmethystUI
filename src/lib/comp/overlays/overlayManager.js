import { get, writable } from "svelte/store";
const knownID = ["progress"];
export const mainOverlayData = writable({
    opened: false,
    windowID: null
});
export let openOverlay = (id) => {
    mainOverlayData.set({
        opened: true,
        windowID: id
    });
};
let closeTimeoutID;
export let closeOverlay = (timeout = 1000, manuallyClosable = false) => {
    overlayClosable.set(manuallyClosable);
    return new Promise((res) => {
        clearTimeout(closeTimeoutID); // clear previous closes
        closeTimeoutID = setTimeout(() => {
            overlayClosable.set(false); // reset closable flag to disallow further manual closing
            mainOverlayData.set({
                opened: false,
                windowID: null
            });
            clearTimeout(closeTimeoutID); // clear current closes
            res();
        }, timeout);
    });
};
export const overlayReady = writable(false);
export const overlayClosable = writable(false);
//# sourceMappingURL=overlayManager.js.map