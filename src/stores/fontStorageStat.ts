import { writable, get } from "svelte/store";
import type { fontObject } from "../workers/pseudoWorkers/fonts";

/**
 * Represents the font data stored in indexDB and the current page stylesheet

 * @property {fontObject[]} currentFontContent - An array of cached font objects in RAM.
 */
interface storedFontData {
    currentFontContent : fontObject[], // the font objects summary that currenly lives inside indexDB
}

/**
 * A writable store that holds data for the main color picker.
 */
export let storedFontData = writable<storedFontData>({
    currentFontContent : [],
});