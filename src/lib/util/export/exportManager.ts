/**
 * This script manages the export setting as well as status of the project.
 * It also defines certain types and objects such as the available export formats, as well as the available settings for each file type.
 */

import { get, writable } from "svelte/store"
import { progressController as PC } from "$src/lib/comp/overlays/overlayWindows/progress/progressOverlayManager";
import exportCSS from "./transpilers/css";

import { estimateSteps as estimateCSSsteps } from "./transpilers/css"

import { openProgressOverlay } from "$src/lib/comp/overlays/overlayWindows/progress/progressOverlayManager";
import { closeOverlay, overlayClosable } from "$src/lib/comp/overlays/overlayManager";
import { saveName } from "$src/lib/stores/fileStatus";
import exportJSON, { estimateSteps as estimateJSONsteps } from "./transpilers/json";

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
const defaultConfigs: exportConfig = {
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
export const exportConfigs = writable<exportConfig>(defaultConfigs); // type inference works properly

export const exportTextFile = async (fileName: string, fileType: exportableFileTypes, content: string) => {
    // Create element with <a> tag
    const link = document.createElement("a");
    // Create a blog object with the file content which you want to add to the file
    const file = new Blob([content], { type: 'text/plain' });
    // Add file content in the object URL
    link.href = URL.createObjectURL(file);
    // Add file name
    link.download = `${fileName}.${fileType}`;
    // Add click event to <a> tag to save file.
    link.click();
    URL.revokeObjectURL(link.href);
}

export const startExport = async () => {
    // estimate progress steps first
    let steps = 1;
    switch(get(targetFileType)){
        case "css":
            steps = estimateCSSsteps();
            break;
        case "json":
            steps = estimateJSONsteps();
            break;
        default:
            break;
    }

    const failExport = async (err: Error) => {
        console.error(err); // log err
        await PC.errorResult(err.message, "Export failed."); // show error screen
        overlayClosable.set(true); // allow users to dismiss the overlay if needed
        
        closeOverlay(5000, true);
    }
    
    // bring up progress modal first
    await openProgressOverlay("Exporting", steps);
    
    // TODO: add prettify CSS and JSON

    let result: string;
    try{
        switch(get(targetFileType)){
            case "css":
                result = await exportCSS();
                break;
            case "json":
                result = await exportJSON();
                break;
            default:
                throw new Error(`Transpilation for type "${get(targetFileType)}" is not supported.`);
        }
    } catch (err) {
        await failExport(err);
        return;
    }
    
    await PC.successResult();
    exportTextFile(get(saveName), get(targetFileType), result);
    
    closeOverlay()
}