/**
 * This script manages the export setting as well as status of the project.
 * It also defines certain types and objects such as the available export formats, as well as the available settings for each file type.
 */

import { writable } from "svelte/store"
import { openProgressModal } from "$src/lib/stores/modalManager"
import { progressOverlayController as POC } from "../UI/progressOverlayController";

/**
 * A union type that represents supported file types.
 *
 * @description This type is used to constrain a variable or parameter to one of the supported file types.
 * For example, if you have a function that accepts a file type as an argument, you can use this type to ensure
 * that the argument is one of the supported file types.
 */
export const nonStylesheetTypes:exportableFileTypes[] = ["json"];

/**
 * The global target file type. This can be used to access export configurations
 */
export const targetFileType = writable<exportableFileTypes>("css");

/**
 * The default configuration object for the application.
 *
 * @devnote I tried to give this config object explicit typing but ended up losing my fucking mind.
 * If you're modifying this, don't add random shit and it'll work fine.
 *
 * @example
 * ```
 * const config = { ...defaultConfigs, scss: { nestStyles: false } };
 * ```
 */
const defaultConfigs: exportConfigInterface = {
    "common": {
        "compressionAmt": 1,
    },
    "stylesheets": {
        "colorFmt": "hsl",
        "colorUnitInference": false,
        "fontIntegration": true,
        "loadFullTypeface": false,
        "fontLocalization": false,
    },
    "scss": {
        "nestStyles": true,
    },
}

/**
 * The export configuration store that can be accessed globally within the app.
 * 
 * @param fileTypes - Access specific file type configuration settings
 * @param stylesheets - Access configuration settings that are universal to all stylesheets. This does NOT include types like JSON.
 * @param common - Access configuration settings that are universal to all file types, including types like JSON.
 */
export const exportConfigs = writable<exportConfigInterface>(defaultConfigs); // type inference works properly

export const startExport = async () => {
    // bring up progress modal first
    await openProgressModal("Exporting", 20);

    
}