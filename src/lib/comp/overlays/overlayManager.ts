import { get, writable } from "svelte/store";

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

let closeTimeoutID: ReturnType<typeof setTimeout>;
export let closeOverlay = (timeout = 1000, manuallyClosable = false): Promise<void> => {
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
    })
}

export const overlayReady = writable<boolean>(false);
export const overlayClosable = writable<boolean>(false);