import { writable } from "svelte/store";

const knownID = ["export", "appinfo"] as const;
export type modalID = typeof knownID[number];

interface modalInfo {
    opened: boolean;
    windowID: modalID | null;
}

export const mainModalData = writable<modalInfo>({
    opened: false,
    windowID: null
});
export let openModal = (id: modalID) => {
    mainModalData.set({
        opened: true,
        windowID: id
    })
}
export let closeModal = () => {
    mainModalData.set({
        opened: false,
        windowID: null
    })
}