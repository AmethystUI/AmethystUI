import { writable, get } from 'svelte/store';

export type viewTypes = "element" | "component";
export let currentView = writable<viewTypes>("element");