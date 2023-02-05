/// <reference no-default-lib="true"/>
/// <reference lib="ES2015" />
/// <reference lib="webworker" />

export {};

const dbName = 'fonts';
const objectStoreName = 'fontFiles';

interface fontURLs {
    family: string; // typeface name
    URLs: Record<number, string>; // URL associated with each variation
}

/**
 * The structure of font data as received from Google Font
 * 
 * @typedef {Object} rawFontObjs
 * @property {string} family - The name of the font family.
 * @property {string[]} variants - An array of variants for the font family.
 * @property {string[]} subsets - An array of subsets for the font family.
 * @property {string} version - The version of the font data.
 * @property {string} lastModified - The date and time the font data was last modified.
 * @property {Object} files - An object containing key-value pairs representing the files associated with the font family and their URLs.
 */
type rawFontObjs = {
    family: string;
    variants: string[];
    subsets: string[];
    version: string;
    lastModified: string;
    files: { [key: string]: string };
}

// ============

/**
 * Use the Google Fonts API to fetch avaible font data URLs as well as its correspoding files, and store the TTF font files in an indexedDB.
 */
const downloadFonts = async () => {
    console.debug('Downloading fonts...');

    // get URL's from Google Fonts
    let parsedData: fontURLs[];
    const resp = await fetch("https://www.googleapis.com/webfonts/v1/webfonts?sort=popularity&key=AIzaSyDW3JQmec-yJykfP-FcRYpIujOc6jYa4RQ");

    if(!resp.ok) throw new Error(`Unable to fetch font URL's: ${resp.status}`); // if response is broken, throw a new error
    
    // Parse the response into JSON
    const rawData: rawFontObjs[] = await resp.json();

    console.log(rawData);
}

async function openDb() {
    // return new Promise((resolve, reject) => {
    //     const request = indexedDB.open(dbName, 1);

    //     request.onupgradeneeded = event => {
    //     const db = event.target.result;
    //     db.createObjectStore(objectStoreName, { keyPath: 'name' });
    //     };

    //     request.onsuccess = event => {
    //     resolve(event.target.result);
    //     };

    //     request.onerror = event => {
    //     reject(event.target.error);
    //     };
    // });
}

// ==========

self.addEventListener("install", event => {
    const installEvent = event as ExtendableEvent;
    // fetch fileURLs from google font
    installEvent.waitUntil(new Promise((res, rej): void => {
        res(0);
    }))
});

self.addEventListener("activate", event => {
})

self.addEventListener("message", e => {
    // if the event wants us to start downloading the font
    if(e.data === "downloadFonts") {
        // we download em bitches
        downloadFonts();
    }
});