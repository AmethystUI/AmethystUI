import { writable, get } from "svelte/store";

/**
 * Represents data for the color picker.
 * @property {string} fontRefName - The name of the font reference.
 * @property {string} fontName - The name of the font.
 */
export interface pickerData {
    fontRefName : string,
    fontName : string,
    searchQuery : string // Don't forget to clear this regularly
}

/**
 * A writable store that holds data for the main color picker.
 */
export let mainFontPickerData = writable<pickerData>({
    fontRefName : undefined,
    fontName : "Typography",
    searchQuery : "",
});

/**
 * Sets the font reference name in the main picker data store.
 * @param {string} ref - The font reference name to set.
 */
export const setFontPickerRef = (ref:string) => {
    let currentVal:pickerData = get(mainFontPickerData);
    currentVal.fontRefName = ref;
    mainFontPickerData.set(currentVal);
}

/**
 * Clears the color reference name in the main picker data store and sets an optional color name.
 * @param {string} [colorName="Colors"] - The color name to set.
 */
export const clearColorPickerRef = (colorName:string="Colors") => {
    let currentVal:pickerData = get(mainFontPickerData);
    currentVal.fontRefName = undefined;
    currentVal.fontName = colorName;
    mainFontPickerData.set(currentVal);
}
