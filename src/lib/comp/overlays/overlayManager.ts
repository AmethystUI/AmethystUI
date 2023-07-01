import { writable } from "svelte/store";

const knownID = ["progress"] as const;
export type overlayID = typeof knownID[number];

interface overlayInfo {
    opened: boolean;
    windowID: overlayID | null;
}

export const mainOverlayData = writable<overlayInfo>({
    opened: false,
    windowID: null
});
export let openOverlay = (id: overlayID) => {
    mainOverlayData.set({
        opened: true,
        windowID: id
    })
}
export let closeOverlay = () => {
    overlayClosable.set(false); // reset closable flag to disallow further manual closing

    mainOverlayData.set({
        opened: false,
        windowID: null
    })
}

export const overlayReady = writable<boolean>(false);
export const overlayClosable = writable<boolean>(false);