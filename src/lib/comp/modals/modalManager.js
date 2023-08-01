import { writable } from "svelte/store";
const knownID = ["export", "appinfo"];
export const mainModalData = writable({
    opened: false,
    windowID: null
});
export let openModal = (id) => {
    mainModalData.set({
        opened: true,
        windowID: id
    });
};
export let closeModal = () => {
    mainModalData.set({
        opened: false,
        windowID: null
    });
};
//# sourceMappingURL=modalManager.js.map