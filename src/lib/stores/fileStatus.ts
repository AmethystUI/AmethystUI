import { writable, get } from 'svelte/store';

export interface status{
    name: string,
    saved: boolean,
    autoSavetoCloud: boolean,
    alwaysShowSaveStatus: boolean
};

export let fileStat = writable<status>({
    name: "Untitled",
    saved: false,
    autoSavetoCloud: false,
    alwaysShowSaveStatus: false
});

export let saveName = writable<string>(get(fileStat).name);