import { writable, get } from "svelte/store";
import type { fontObject } from "../workers/pseudoWorkers/fonts";

/**
 * Represents data for the color picker.
 * @property {string} fontRefName - The name of the font reference.
 * @property {string} fontName - The name of the font.
 */
export interface pickerData {
    refName : string,
    windowName : string,
    searchQuery : string // Don't forget to clear this regularly
    currentFontContent : fontObject[], // cached in ram
    fontLoadFailed : boolean,
}

/**
 * A writable store that holds data for the main color picker.
 */
export let mainFontPickerData = writable<pickerData>({
    refName : undefined,
    windowName : "Typography",
    searchQuery : "",
    currentFontContent : [],
    fontLoadFailed : false,
});

/**
 * Sets the font reference name in the main picker data store.
 * @param {string} ref - The font reference name to set.
 */
export const setFontPickerRef = (ref:string) => {
    let currentVal:pickerData = get(mainFontPickerData);
    currentVal.refName = ref;
    mainFontPickerData.set(currentVal);
}

/**
 * Clears the color reference name in the main picker data store and sets an optional color name.
 * @param {string} [colorName="Colors"] - The color name to set.
 */
export const clearColorPickerRef = (colorName:string="Colors") => {
    let currentVal:pickerData = get(mainFontPickerData);
    currentVal.refName = undefined;
    currentVal.windowName = colorName;
    mainFontPickerData.set(currentVal);
}
