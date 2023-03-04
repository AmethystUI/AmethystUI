import { writable } from "svelte/store";
import type { elementStyleType } from "../types/element";

export type activeStylesType = Partial<Record<elementStyleType, boolean>>; 
export let activeStyles = writable<activeStylesType>({}); // what styles are currently active. We can use this to see which editors we should be enabling for editing