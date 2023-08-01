import { writable, get } from 'svelte/store';
const defaultFileSettings = {
    name: "Untitled",
    saved: false,
    autoSavetoCloud: false,
    alwaysShowSaveStatus: false
};
export let fileSettings = writable(defaultFileSettings);
export let saveName = writable(get(fileSettings).name);
//# sourceMappingURL=fileStatus.js.map