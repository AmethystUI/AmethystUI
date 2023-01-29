import type { typeCategories } from "../../stores/collection";

/**
 * Represents a single, reduced typeface object returned by the Google Fonts API.
 * @property {string} family - The family name of the font.
 * @property {string} version - The version of the font.
 * @property {string} lastModified - The date when the font was last modified.
 * @property {string[]} files - An array of file paths to the font files. The keys also shows what weights this font supports.
 * @property {string} category - The category of the font.
 */
export interface fontObject {
    /** @summary The family name of the font. */
    family: string,
    version?: string,
    lastModified?: string,
    files?: Record<string, string>,
    category: typeCategories,
    webSafe: boolean
}

/**
 * A list of web safe fonts that can be used. Not that web safe fonts only support normal and bold variations
 */
const webSafeFonts: fontObject[] = [ // these websafe fonts don't need files
    { family: "Arial",
        category: "sans-serif",
        webSafe: true,
    }, { family: "Verdana",
        category: "sans-serif",
        webSafe: true,
    }, { family: "Tahoma",
        category: "sans-serif",
        webSafe: true,
    }, { family: "Trebuchet MS",
        category: "sans-serif",
        webSafe: true,
    }, { family: "Times New Roman",
        category: "serif",
        webSafe: true,
    }, { family: "Georgia",
        category: "serif",
        webSafe: true,
    }, { family: "Garamond",
        category: "serif",
        webSafe: true,
    }, { family: "Courier New",
        category: "monospace",
        webSafe: true,
    }, { family: "Brush Script MT",
        category: "handwriting",
        webSafe: true,
    }
]

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
export async function loadFonts (web = true): Promise<{fontsLoaded: number, timeTook: number}> {
    let typefaceData: fontObject[] = []; let response: Response;

    return new Promise(async (res, rej) => {
        // time the process time just for debugging purposes
        const startTime = performance.now();
        
        // add web safe fonts
        for(let i = 0; i < webSafeFonts.length; i++) {
            typefaceData.push(webSafeFonts[i]);
        }

        // if we're not adding web fonts, we can just store everything in session right now
        if(!web){
            sessionStorage.setItem("typefaces", JSON.stringify(typefaceData));
            const endTime = performance.now();
            res({
                fontsLoaded: typefaceData.length,
                timeTook: endTime - startTime
            }); // response end
        }

        // if we still want to get web fonts
        try{ // attempt to fetch all raw font data from the Google Fonts API
            response = await fetch("https://www.googleapis.com/webfonts/v1/webfonts?sort=popularity&key=AIzaSyDW3JQmec-yJykfP-FcRYpIujOc6jYa4RQ");
            // NOTE: Change the API key into prod when this is done.
    
            if(!response.ok) { // if there was a problem with the resp, we'll store what we have right now and reject the promise
                sessionStorage.setItem("typefaces", JSON.stringify(typefaceData)); // store what we have right now

                return rej(response.status);
            }
        } catch (err) {
            // If there's an error, store what we have right now
            sessionStorage.setItem("typefaces", JSON.stringify(typefaceData));
            return rej(err);
        }

        // If there is no error, process the response
        let rawTypefaceData = (await response.json())["items"]; // convert response to json

        // interate through every font and process the variant so that it removes all the italic ones, and at the same time add a new attribute called `canItalisize`
        for(let i = 0; i < rawTypefaceData.length; i++) {            
            // add to final data
            typefaceData.push({
                family: rawTypefaceData[i].family,
                version: rawTypefaceData[i].version,
                lastModified: rawTypefaceData[i].lastModified,
                files: cleanFontFiles(rawTypefaceData[i].files),
                category: rawTypefaceData[i].category,
                webSafe: false
            });
        }
        // drop large data from memory
        rawTypefaceData = null;

        // store the processed font data into session storage
        sessionStorage.setItem("typefaces", JSON.stringify(typefaceData));

        // time the process time just for debugging purposes
        const endTime = performance.now();

        // resolve promise
        res({
            fontsLoaded: typefaceData.length,
            timeTook: endTime - startTime
        });
    })
}

type fontAttributes = Record<string, string>;

/**
 * An array that contains two objects that map font weights to their corresponding names, and vice versa.
 * @property {fontAttributes} 0 - An object that maps font weights (in string format) to their corresponding names.
 * @property {fontAttributes} 1 - An object that maps font names to their corresponding weights (in string format).
 */
const fontNameDictionary: fontAttributes[] = [{ // index 0 is value -> name, index 1 is the opposite
    "100" : "thin",
    "200" : "extralight",
    "300" : "light",
    "400" : "regular",
    "500" : "medium",
    "600" : "semibold",
    "700" : "bold",
    "800" : "extrabold",
    "900" : "black"},{
    "thin" : "100",
    "extralight" : "200",
    "light" : "300",
    "regular" : "400",
    "medium" : "500",
    "semibold" : "600",
    "bold" : "700",
    "extrabold" : "800",
    "black" : "900",
}]

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
    "extralight" : "Extra Light",
    "light" : "Light",
    "regular" : "Regular",
    "medium" : "Medium",
    "semibold" : "Semi Bold",
    "bold" : "Bold",
    "extrabold" : "Extra Bold",
    "black" : "Black",    
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
export function getFontNameValue(key: string, mode: "name" | "value" | "auto"): string {
    if(mode === "name"){
        if(!!fontNameDictionary[1][key]) return key; // do not convert if it's already a name
        let result = fontNameDictionary[0][key];
        return result ?? "–";
    } else if (mode === "value"){
        if(!!fontNameDictionary[0][key]) return key; // do not convert if it's already a value
        let result = fontNameDictionary[1][key];
        return result ?? "–";
    }
    let result = fontNameDictionary[0][key] ?? fontNameDictionary[1][key];
    return result ?? "–";
}

/**
 * Removes italic font files from the provided font attributes object and returns the cleaned font attributes object.
 * @param files - The font attributes object to be cleaned.
 * @returns The cleaned font attributes object.
 */
function cleanFontFiles(files: fontAttributes): fontAttributes {
    let result:fontAttributes = {};
    const fileKeys = Object.keys(files);

    // iterate through variants
    for(let i = 0; i < fileKeys.length; i++){
        // detect if there is "italic" at the end of the key
        const key = fileKeys[i];
        if(key.endsWith("italic")){
            continue;
        }

        // add to result
        result[getFontNameValue(key.toLowerCase(), "name")] = files[key];
    }

    return result;
}