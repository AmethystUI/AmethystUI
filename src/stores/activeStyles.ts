import { get, writable } from "svelte/store";
import getStyleSetting from "../components/display/displayElements/elementStyleSettings";
import type { elementStyleType } from "../types/element";
import { collection, selectedComponent } from "./collection";

export type activeStylesType = Partial<Record<elementStyleType, boolean>>; 
export let activeStyles = writable<activeStylesType>({}); // what styles are currently active. We can use this to see which editors we should be enabling for editing