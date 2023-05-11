import { writable } from "svelte/store";
import type { fontObject } from "$lib/workers/pseudoWorkers/fonts";
import { mainFontPickerData } from "./fontPickerManager";

/**
 * Represents the font data stored in indexDB and the current page stylesheet

 * @property {fontObject[]} currentFontContent - An array of cached font objects in RAM.
 */
interface storedFontData {
    currentFontContent : fontObject[], // the font objects summary that currenly lives inside indexDB
    transcribedFonts : Map<string, null> // keep track of which fonts have been transcribed
}

/**
 * A writable store that holds data for the main color picker.
 */
export let storedFontData = writable<storedFontData>({
    currentFontContent : [],
    transcribedFonts : new Map()
});

// attempt to load the fonts from local storage
export const initializeMainFontPickerData = (storageKey: string): Promise<void> => {
    // reset fontFailure in main font picker data
    mainFontPickerData.update(pickerDat => { pickerDat.fontLoadFailed = false; return pickerDat });

    return new Promise(async (res, rej) => {
        let rawFontData = localStorage.getItem(storageKey);

        // Try to fetch the font data up to 6 times with a 500ms interval each time (3s)
        for (let i = 0; i < 6 && !rawFontData; i++) {
            await new Promise((res) => setTimeout(res, 500));
            rawFontData = localStorage.getItem(storageKey);
        }
        // Reject the promise if the font data is still not fetched after 6 attempts
        if (!rawFontData) {
            // set fontFailure in main font picker data to true
            mainFontPickerData.update(pickerDat => { pickerDat.fontLoadFailed = true; return pickerDat });

            return rej(new Error("Cannot fetch font data from local storage cache."));
        }
        // Try to parse the fetched font data as JSON and resolve the promise on success
        try {
            // update currentFontContent in main font picker data
            mainFontPickerData.update(pickerDat => {
                storedFontData.update(data => {
                    data.currentFontContent = JSON.parse(rawFontData);
                    return data;
                }); // update currentFontContent in main font picker data
                return pickerDat;
            });

            res();
        } catch (err) {
            // set fontFailure in main font picker data to true
            mainFontPickerData.update(pickerDat => { pickerDat.fontLoadFailed = true; return pickerDat });
            // Reject the promise if the fetched font data is not valid JSON
            rej(`JSON parse error > \n${err}`);
        }
    });
};