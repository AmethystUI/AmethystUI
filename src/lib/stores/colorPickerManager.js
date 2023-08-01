import { writable, get } from "svelte/store";
/**
 * A writable store that holds data for the main color picker.
 */
export let mainColorPickerData = writable({
    showInlineHSL: false,
    refName: undefined,
    windowName: "Colors",
});
/**
 * Sets the color reference name in the main picker data store.
 * @param {string} ref - The color reference name to set.
 */
export const setColorPickerRef = (ref) => {
    let currentVal = get(mainColorPickerData);
    currentVal.refName = ref;
    mainColorPickerData.set(currentVal);
};
/**
 * Clears the color reference name in the main picker data store and sets an optional color name.
 * @param {string} [colorName="Colors"] - The color name to set.
 */
export const clearColorPickerRef = (colorName = "Colors") => {
    let currentVal = get(mainColorPickerData);
    currentVal.refName = undefined;
    currentVal.windowName = colorName;
    mainColorPickerData.set(currentVal);
};
//# sourceMappingURL=colorPickerManager.js.map