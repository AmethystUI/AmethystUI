import { writable } from "svelte/store";

export type activeStylesType = Partial<Record<elementStyleKeys, boolean>>; 
export let activeStyles = writable<activeStylesType>({}); // what styles are currently active. We can use this to see which editors we should be enabling for editing