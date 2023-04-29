import { writable } from "svelte/store";

export interface modalData {
    opened: boolean;
    modalID: string;
}

export const mainModalData = writable<modalData>({
    opened: true,
    modalID: ""
});

export let openModal = (id: string) => {
    mainModalData.set({
        opened: true,
        modalID: id
    })
}

export let closeModal = () => {
    mainModalData.set({
        opened: false,
        modalID: ""
    })
}