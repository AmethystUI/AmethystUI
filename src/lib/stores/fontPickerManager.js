import { writable, get } from "svelte/store";
/**
 * A writable store that holds data for the main color picker.
 */
export let mainFontPickerData = writable({
    refName: undefined,
    windowName: "Typography",
    searchQuery: "",
    searchLocked: true,
    fontLoadFailed: false,
});
/**
 * Sets the font reference name in the main picker data store.
 * @param {string} ref - The font reference name to set.
 */
export const setFontPickerRef = (ref) => {
    let currentVal = get(mainFontPickerData);
    currentVal.refName = ref;
    mainFontPickerData.set(currentVal);
};
/**
 * Clears the color reference name in the main picker data store and sets an optional color name.
 * @param {string} [colorName="Colors"] - The color name to set.
 */
export const clearColorPickerRef = (colorName = "Colors") => {
    let currentVal = get(mainFontPickerData);
    currentVal.refName = undefined;
    currentVal.windowName = colorName;
    mainFontPickerData.set(currentVal);
};
//# sourceMappingURL=fontPickerManager.js.map