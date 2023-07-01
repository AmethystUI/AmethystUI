import { writable, get } from 'svelte/store';

const defaultFileSettings = {
    name: "Untitled",
    saved: false,
    autoSavetoCloud: false,
    alwaysShowSaveStatus: false
}
export let fileSettings = writable<typeof defaultFileSettings>(defaultFileSettings);

export let saveName = writable<string>(get(fileSettings).name);