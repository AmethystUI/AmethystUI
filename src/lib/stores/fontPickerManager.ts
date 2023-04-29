import { writable, get } from "svelte/store";
import type { fontObject } from "$lib/workers/pseudoWorkers/fonts";

/**
 * Represents data for the font picker.
 *
 * @property {string} refName - The name of the font reference.
 * @property {string} windowName - The name of the window.
 * @property {string} searchQuery - The current search query used by the picker.
 * @property {boolean} fontLoadFailed - Indicates if loading fonts has failed.
 */
export interface pickerData {
    refName : string,
    windowName : string,
    searchQuery : string, // Don't forget to clear this regularly
    searchLocked : boolean, // Prevent the search query from misinterpreseted as an actual query. When we're selecting fonts from the font selection browser, the text where the query would normally be would be changing, but we don't want the actual query to be changing. So we can set this to true, AKA lock it, to prevent it from changing.
    fontLoadFailed : boolean,
}

/**
 * A writable store that holds data for the main color picker.
 */
export let mainFontPickerData = writable<pickerData>({
    refName : undefined,
    windowName : "Typography",
    searchQuery : "",
    searchLocked : true, // keep this locked as often as possible. Treat it as the lock on your front door
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
