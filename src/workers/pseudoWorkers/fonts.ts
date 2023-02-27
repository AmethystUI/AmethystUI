import type { typeCategories } from "../../declarations/general";
import { fontLimit, fontSorting } from "../configs/fontLoading.config";

/**
 * Represents a single, reduced typeface object returned by the Google Fonts API.
 * 
 * @note THIS DOES NOT DEFINE THE RAW OBJECT RECIEVED FROM GOOGLE FONTS
 * 
 * @property {string} family - The family name of the font.
 * @property {string} version - The version of the font.
 * @property {string} lastModified - The date when the font was last modified.
 * @property {string[]} files - An array of file paths to the font files. The keys also shows what weights this font supports.
 * @property {string} category - The category of the font.
 */
export interface fontObject {
    family: string,
    appearedName?: string,
    version?: string,
    lastModified?: string,
    fileURLs?: variationURL[], // the URLs asssociated with each fileURL. We'lll use these URLs to access the TTF binaries and convert them to base64
    localURLs?: variationURL[],
    variations: number[],
    category: typeCategories,
    webSafe: boolean,
}

/**
 * A list of web safe fonts that can be used. Not that web safe fonts only support normal and bold variations
 */
const webSafeFonts: fontObject[] = [
    { family: "Arial",
        category: "sans-serif",
        variations: [400, 700],
        webSafe: true,
    }, { family: "Verdana",
        category: "sans-serif",
        variations: [400, 700],
        webSafe: true,
    }, { family: "Tahoma",
        category: "sans-serif",
        variations: [400, 700],
        webSafe: true,
    }, { family: "Trebuchet MS",
        category: "sans-serif",
        variations: [400, 700],
        webSafe: true,
    }, { family: "Times New Roman",
        category: "serif",
        variations: [400, 700],
        webSafe: true,
    }, { family: "Georgia",
        category: "serif",
        variations: [400, 700],
        webSafe: true,
    }, { family: "Garamond",
        category: "serif",
        variations: [400, 700],
        webSafe: true,
    }, { family: "Courier New",
        category: "monospace",
        variations: [400, 700],
        webSafe: true,
    }, { family: "Brush Script MT",
        category: "handwriting",
        variations: [400, 700],
        webSafe: true,
    }, { family: "system-ui",
        appearedName: "System UI",
        category: "sans-serif",
        variations: [400, 700],
        webSafe: true,
    },
];

/**
 * A conversion chart that converts the font extension to the font format used by CSS.
 */
export const fontExtensionToFormats = (format: string): string => {
    switch (format) {
        case "woff":
            return "woff";
        case "woff2":
            return "woff2";
        case "ttf":
            return "truetype";
        case "otf":
            return "opentype";
        case "eot":
            return "embedded-opentype";
        case "svg":
            return "svg";
        default:
            return "";
    }
};

/**
 * @summary
 * This is an asynchronus function that will initialize all the fonts that is available in the the Google Fonts API, and organizes them into an object that can be locally accessed through sessionStorage. Note that this function does not load font files, but rather organizes a list of available font informations as well as its corresponding files. The only reason why we're not keeping the object in memory is because the total list is around 1mb in size, which is pretty large.
 * 
 * @usage
 * Run this function in concurrency to the page load. This should only be done only once.
 * 
 * @remarks
 * Fun fact: This is the first file in the entire codebase to get a proper documentation... I know, I'm not proud of myself either.
 */
export const loadFonts = async (web = true): Promise<{fontsLoaded: number}> => {
    let typefaceData: fontObject[] = []; let response: Response;

    return new Promise(async (res, rej) => {
        // only store font if there is nothing in local storage
        if(!!localStorage.getItem("fonts")) return;

        // add web safe fonts
        for(let i = 0; i < webSafeFonts.length; i++) {
            typefaceData.push(webSafeFonts[i]);
        }

        // if we're not adding web fonts, we can just store everything in session right now
        if(!web){
            storeFontDataToLocalStorage(typefaceData, "fonts");

            res({
                fontsLoaded: typefaceData.length
            }); // response end
        }

        // if we still want to get web fonts
        try{ // attempt to fetch all raw font data from the Google Fonts API
            response = await fetch(`https://www.googleapis.com/webfonts/v1/webfonts?sort=${fontSorting}&key=AIzaSyDW3JQmec-yJykfP-FcRYpIujOc6jYa4RQ`);
            // NOTE: Change the API key into prod when this is done.
    
            if(!response.ok) { // if there was a problem with the resp, we'll store what we have right now and reject the promise
                storeFontDataToLocalStorage(typefaceData, "fonts");
                
                return rej(response.status);
            }
        } catch (err) {
            // If there's an error, store what we have right now
            storeFontDataToLocalStorage(typefaceData, "fonts");

            return rej(err);
        }

        // If there is no error, process the response
        let rawTypefaceData = (await response.json()).items; // convert response to json

        // We have to cut down to the font limit as dictated by our configuartion, as it's almost impossible to load all 1500 fonts efficiently unless we have some really good reason or algorithm to.
        rawTypefaceData = rawTypefaceData.slice(0, fontLimit); // cut down to the font limit

        // interate through every font and process the variant so that it removes all the italic ones, and at the same time add a new attribute called `canItalisize`
        for(let i = 0; i < rawTypefaceData.length; i++) {          
            // process files to get variation
            const fileURLs = cleanFiles(rawTypefaceData[i].files);
            const variants:number[] = fileURLs.map(file => { return file.variation })

            // add to final data
            typefaceData.push({
                family: rawTypefaceData[i].family,
                version: rawTypefaceData[i].version,
                lastModified: rawTypefaceData[i].lastModified,
                fileURLs: fileURLs,
                variations: variants,
                category: rawTypefaceData[i].category,
                webSafe: false
            });
        }
        // drop large data from memory
        rawTypefaceData = null;

        // store the processed font data into session storage
        storeFontDataToLocalStorage(typefaceData, "fonts");

        // resolve promise
        res({
            fontsLoaded: typefaceData.length
        });
    })
}

export const searchFontIndex = async (fonts: fontObject[], match: string) => {
    let left = 0;
    let right = fonts.length - 1;
    
    while (left <= right) {
        const middle = Math.floor((left + right) / 2);
        const font = fonts[middle];
        
        if (font.family.toLowerCase() === match.toLowerCase()) {
            return middle;
        }
        
        if (font.family.toLowerCase() < match.toLowerCase()) {
            left = middle + 1;
        } else {
            right = middle - 1;
        }
    }
    
    return -1;
}

export const getClosestVariation = (targetVariation: number, variations: number[]): number => {
    // Find the URL of the regular font, or the closest match of it
    // We can assume that every typeface is guarenteed to have at least 1 variation, so this while loop will not loop forever
    let dv = 0; // difference in variation
    if(!variations.includes(targetVariation)){
        for(dv; !( variations.includes(targetVariation - dv) || variations.includes(targetVariation + dv) ); dv += 100); // find closest match to 400
    }

    // after left or right has been found, get the new variation and file
    return targetVariation + (variations.includes(targetVariation - dv) ? -1 : 1) * dv;
}

const storeFontDataToLocalStorage = (fontsData: fontObject[], storageKey: string) => {
    if(localStorage.getItem(storageKey) != undefined) return; // already stored. No need to store again.

    fontsData.sort((a: fontObject, b: fontObject) => {
        if (a.family.toLowerCase() < b.family.toLowerCase()) return -1;
        if (a.family.toLowerCase() > b.family.toLowerCase()) return 1;
        return 0;
    });
    // set to session storage
    localStorage.setItem(storageKey, JSON.stringify(fontsData));
}

type fontAttributes = Record<string | string, number | string>;

/**
 * An array that contains two objects that map font weights to their corresponding names, and vice versa.
 * @property {fontAttributes} 0 - An object that maps font weights (in string format) to their corresponding names.
 * @property {fontAttributes} 1 - An object that maps font names to their corresponding weights (in string format).
 */
const fontNameDictionary: fontAttributes[] = [
    { // index 0 is value -> name, index 1 is the opposite
        100 : "thin",
        200 : "extralight",
        300 : "light",
        400 : "regular",
        500 : "medium",
        600 : "semibold",
        700 : "bold",
        800 : "extrabold",
        900 : "black"
    }, {
        "thin" : 100,
        "extralight" : 200,
        "light" : 300,
        "regular" : 400,
        "medium" : 500,
        "semibold" : 600,
        "bold" : 700,
        "extrabold" : 800,
        "black" : 900,
    }
]

/**
 * An object that maps font weights to their corresponding beautified names.
 * @property {string} thin - Get the beautified name for the thin font weight.
 * @property {string} extralight - Get the beautified name for the extra light font weight.
 * @property {string} light - Get the beautified name for the light font weight.
 * @property {string} regular - Get the beautified name for the regular font weight.
 * @property {string} medium - Get the beautified name for the medium font weight.
 * @property {string} semibold - Get the beautified name for the semi bold font weight.
 * @property {string} bold - Get the beautified name for the bold font weight.
 * @property {string} extrabold - Get the beautified name for the extra bold font weight.
 * @property {string} black - Get the beautified name for the black font weight.
 */
export const beautifiedFontName: fontAttributes = {
    "thin" : "Thin",
    "extralight" : "Extralight",
    "light" : "Light",
    "regular" : "Regular",
    "medium" : "Medium",
    "semibold" : "Semibold",
    "bold" : "Bold",
    "extrabold" : "Extrabold",
    "black" : "Black",    
}
export const standardizedFontName: fontAttributes = {
    "Thin" : "thin",
    "Extralight" : "extralight",
    "Light" : "light",
    "Regular" : "regular",
    "Medium" : "medium",
    "Semibold" : "semibold",
    "Bold" : "bold",
    "Extrabold" : "extrabold",
    "Black" : "black",
}

/**
 * @summary A dictionary referrer for all your font name needs.
 * 
 * @param key
 * The word / value that needs to be converted
 * 
 * @param mode
 * @type {"name" | "value" | "auto"}
 * The function will return either a name, value, or either on auto
 */
export function getFontNameValue(key: string | number, mode: "name" | "value" | "auto"): string | number {
    if(mode === "name"){
        if(!!fontNameDictionary[1][key]) return `${key}`; // do not convert if it's already a name
        let result = fontNameDictionary[0][key];
        return result ?? "N/A";
    } else if (mode === "value"){
        if(!!fontNameDictionary[0][key]) return Number(key); // do not convert if it's already a value
        let result = fontNameDictionary[1][key];
        return result ?? -1;
    }
    let result = fontNameDictionary[0][key] ?? fontNameDictionary[1][key];
    return result ?? "NA";
}

/**
 * Map every variation in a font to a URL
 */
export interface variationURL{
    variation: number,
    url: string
}
/**
 * Removes italic font files from the provided font attributes object and returns the cleaned font attributes object.
 * @param files - The font attributes object to be cleaned.
 * @returns The cleaned font attributes object.
 */
export function cleanFiles(files: fontAttributes): variationURL[] {
    let result:variationURL[] = [];
    const fileKeys:string[] = Object.keys(files);

    function addVariation(newKey: variationURL): void { // use binary insersion to make sure new file keys are always sorted
        // the numerical key is like 300 or 400, while the value key is like light or regular. We're comparing numerical keys to make sure they are always sorted, while we only store the value key.

        let left = 0, right = result.length - 1;
        
        while (left <= right && result.length !== 0) {
            const middle = Math.floor((left + right) / 2);
            if (result[middle].variation < newKey.variation) left = middle + 1;
            else right = middle - 1;
        }
        
        result.splice(left, 0, newKey);
    }

    // iterate through variant keys
    for(let i = 0; i < fileKeys.length; i++){
        // detect if there is "italic" at the end of the key
        const key:string = fileKeys[i];
        if(key.endsWith("italic")){
            continue;
        }

        // add variation and its associated URL
        addVariation({
            variation: getFontNameValue(key.toLowerCase(), "value") as number,
            url: files[key] as string
        });
    }

    return result;
}