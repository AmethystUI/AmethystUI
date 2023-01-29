import { writable, get } from "svelte/store";

/**
 * Represents data for the color picker.
 * @property {boolean} showInlineHSL - Determines whether to show the HSL color values inline.
 * @property {string} colorRefName - The name of the color reference.
 * @property {string} colorName - The name of the color.
 */
export interface pickerData {
    showInlineHSL : boolean,
    colorRefName : string,
    colorName : string,
}

/**
 * A writable store that holds data for the main color picker.
 */
export let mainColorPickerData = writable<pickerData>({
    showInlineHSL : false,
    colorRefName : undefined,
    colorName : "Colors",
});

/**
 * Sets the color reference name in the main picker data store.
 * @param {string} ref - The color reference name to set.
 */
export const setColorPickerRef = (ref:string) => {
    let currentVal:pickerData = get(mainColorPickerData);
    currentVal.colorRefName = ref;
    mainColorPickerData.set(currentVal);
}

/**
 * Clears the color reference name in the main picker data store and sets an optional color name.
 * @param {string} [colorName="Colors"] - The color name to set.
 */
export const clearColorPickerRef = (colorName:string="Colors") => {
    let currentVal:pickerData = get(mainColorPickerData);
    currentVal.colorRefName = undefined;
    currentVal.colorName = colorName;
    mainColorPickerData.set(currentVal);
}
