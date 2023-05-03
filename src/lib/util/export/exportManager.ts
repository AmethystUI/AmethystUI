/**
 * This script manages the export setting as well as status of the project.
 * It also defines certain types and objects such as the available export formats, as well as the available settings for each file type.
 */

import { writable } from "svelte/store"

/**
 * A union type that represents supported file types.
 *
 * @description This type is used to constrain a variable or parameter to one of the supported file types.
 * For example, if you have a function that accepts a file type as an argument, you can use this type to ensure
 * that the argument is one of the supported file types.
 */
export type fileTypes = "css" | "scss" | "less" | "styl" | "svelte" | "json"
export const nonStylesheetTypes:fileTypes[] = ["json"];

/**
 * The global target file type. This can be used to access export configurations
 */
export const targetFileType = writable<fileTypes>("css");

/**
 * Creates a new type by mapping a subset of properties of the given type to
 * be optional.
 *
 * @template K - A union of keys of the input type that should be made optional.
 * @template T - The type of the properties in the input type.
 */
type PartialRecord<K extends keyof any, T> = Partial<Record<K, T>>;

/**
 * A type representing a configuration value that consists of a display name
 * and a typed value.
 *
 * @template T - The type of the value being configured.
 */

type Configs<T extends Record<string, Record<any, any>>> = {
    [K in keyof T]: {
        [C in keyof T[K]]: T[K][C];
    };
};

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
const defaultConfigs = {
    "stylesheets" : {
        "colorFmt" : "HSLA" as "HSLA" | "HEX" | "RGBA",
        "colorUnitInference" : false,
        "fontIntegration" : true,
        "fontLocalization" : false,
        "compressionAmt" : "Aggressive" as "None" | "Standard" | "Aggressive",
    },
    "scss" : {
        "nestStyles" : true,
    },
    "json" : {
        "compress" : false,
    },
}

/**
 * The export configuration store that can be accessed globally within the app.
 * 
 * @param fileTypes - Access specific file type configuration settings
 * @param stylesheets - Access configuration settings that are universal to all stylesheets. This does NOT include types like JSON.
 * @param common - Access configuration settings that are universal to all file types, including types like JSON.
 */
export const exportConfigs = writable<typeof defaultConfigs>(defaultConfigs); // type inference works properly