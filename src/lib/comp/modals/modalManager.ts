import { writable } from "svelte/store";

export interface modalOverlayData {
    opened: boolean;
    windowID: string;
}

export const mainModalData = writable<modalOverlayData>({
    opened: true,
    windowID: ""
});
export let openModal = (id: string) => {
    mainModalData.set({
        opened: true,
        windowID: id
    })
}
export let closeModal = () => {
    mainModalData.set({
        opened: false,
        windowID: ""
    })
}