import { writable, get } from 'svelte/store';

export type viewTypes = "edit" | "palette";
export let currentView = writable<viewTypes>("edit");