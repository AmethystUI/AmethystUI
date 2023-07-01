import { writable } from "svelte/store";
import type { modalOverlayData } from "../modals/modalManager";

export const mainOverlayData = writable<modalOverlayData>({
    opened: false,
    windowID: ""
});
export let openOverlay = (id: string) => {
    mainOverlayData.set({
        opened: true,
        windowID: id
    })
}
export let closeOverlay = () => {
    overlayClosable.set(false); // reset closable flag to disallow further manual closing

    mainOverlayData.set({
        opened: false,
        windowID: ""
    })
}

export const overlayReady = writable<boolean>(false);
export const overlayClosable = writable<boolean>(false);