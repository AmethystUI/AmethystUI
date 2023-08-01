/// <reference no-default-lib="true"/>
/// <reference lib="es2020" />
/// <reference lib="webworker" />
const sw = self;
import { openDB } from "idb";
import { batchSize, fontLimit, fontSorting } from "./configs/fontLoading.config";
import { cleanFiles, getClosestVariation } from "./pseudoWorkers/fonts";
// ============
export const fontDBName = "FontDB";
export const TTFObjectStore = "TTF";
/**
 * Use the Google Fonts API to fetch avaible font data URLs as well as its correspoding files, and store the TTF font files in an indexedDB.
 */
const downloadRequiredFonts = async () => {
    console.debug(`Downloading required fonts...`);
    // setup indexDB
    const db = await openDB(fontDBName, 1, {
        upgrade(db) {
            db.createObjectStore(TTFObjectStore); // setup db object store. We don't need a keypath as we'll specify it when putting data in
        },
    });
    // ================== QUERYING ==================
    let resp; // the response that our request has
    try {
        // TODO: Change this to production key later
        resp = await fetch(`https://www.googleapis.com/webfonts/v1/webfonts?sort=${fontSorting}&key=AIzaSyDW3JQmec-yJykfP-FcRYpIujOc6jYa4RQ`);
        if (!resp.ok)
            throw new Error(`Unable to fetch font URL's: ${resp.status}`); // if response is broken, throw a new error
    }
    catch (err) {
        throw new Error("Failed to reach Google Fonts API. Are you connected to the internet?");
    }
    // Get a list of URLs that we should be downloading from. We will download the regular font weights (or whatever is closest to it) 
    let URLQuery = []; // it's just a list of URLs that we should be downloading from
    // We have to cut down to the font limit as dictated by our configuartion, as it's almost impossible to load all 1500 fonts efficiently unless we have some really good reason or algorithm to.
    const rawData = (await resp.json()).items.slice(0, fontLimit); // process data & cut down to the font limit
    // Start creating the download query by looping through every typeface and getting the URL of the regular font
    for (let i = 0; i < rawData.length; i++) {
        const font = rawData[i];
        const files = cleanFiles(font.files); // get the raw font files and clean them up
        const variations = files.map(e => e.variation);
        const URLs = files.map(e => e.url);
        // add our URL to the query list
        URLQuery.push(URLs[variations.indexOf(getClosestVariation(400, variations))]);
    }
    // ================== DOWNLOAD ==================
    // Check if we have any fonts in the database already. If we do, skip download
    const DBKeyCount = await (await db.getAllKeys(TTFObjectStore)).length;
    if (DBKeyCount >= fontLimit) { // if the fonts are downloaded right, there should be the same amount of keys in DB as there are font limit.
        console.debug(`Skipping download as we have ${DBKeyCount}/${fontLimit} fonts downloaded already.`);
        return;
    }
    // get the file extension of each file 
    // keyCount might not be 0, so we need to calculate which batch to resume from
    let startingBatch = Math.floor(DBKeyCount / batchSize); // if there's 5 files, and we loaded 4 files while batch size is 3, then we've loaded 1 batch fully since floor(5/3) = 1
    console.debug("Detected " + DBKeyCount + " fonts already downloaded. Resuming download at batch " + startingBatch);
    // Time the download to see how performant it is.
    const start = Date.now();
    // Start looping throught the query (as batches) and downloading each batch
    for (let i = 0; i < URLQuery.length; i += batchSize) {
        const currectBatch = i / batchSize; // guarenteed to be an integer because of math
        if (currectBatch < startingBatch)
            continue; // if the current batch is less than the starting batch, skip it. (it's already downloaded)
        const batch = URLQuery.slice(i, i + batchSize); // get the current batch of URLs
        // fetch batch
        await downloadFontFromURLs(db, batch);
    }
    console.debug(`Download finished! Fetched ${URLQuery.length} fonts in ${Date.now() - start}ms.`);
    // close db
    db.close();
};
/**
 * Downloads font files from the given URLs and stores them in an IndexedDB database.
 *
 * @
 *
 * @param {IDBPDatabase} db - The IndexedDB database where the font files will be stored.
 * @param {string[]} urls - An array of URLs that point to the font files to be downloaded.
 * @param {boolean} [closeDBAfterFinished=false] - A flag indicating whether the database should be closed after the download operation is finished.
 */
export const downloadFontFromURLs = async (db, urls, closeDBAfterFinished = false) => {
    // do a sanity check to see if DB is undefined first
    if (!db) {
        console.warn("Tried to access a DB that is undefined or unopened. Font installer cannot download font files at the moment.");
        return;
    }
    // check if the URL is already downloaded in the DB
    let filteredURL = [];
    const allDBKeys = await db.getAllKeys(TTFObjectStore);
    for (let i = 0; i < urls.length; i++) {
        const url = urls[i];
        if (!allDBKeys.includes(url))
            filteredURL.push(url); // we'll only download the font if it's not already in the DB
    }
    if (filteredURL.length === 0)
        return;
    // compose the url batch into a request
    const promises = filteredURL.map(url => fetch(url).then(res => {
        if (!res.ok) {
            console.warn(`Font download ${url} failed with response code ${res.status}`);
            return null;
        }
        return res.arrayBuffer();
    }));
    // submit requests and wait for all to finish
    let results = [];
    results = await Promise.all(promises); // raw TTF / OTF binaries
    const urlFileFormats = filteredURL.map(url => url.split(".").pop()); // get the file formats of the URLs
    // store the raw binaries and its corresponding file format in indexDB, using the url string as the key
    const tx = db.transaction(TTFObjectStore, "readwrite");
    const store = tx.objectStore(TTFObjectStore);
    for (let i = 0; i < results.length; i++) {
        if (results[i] === null)
            continue; // don't store null urls
        const url = filteredURL[i];
        const fontBlob = new Blob([results[i]], { type: `font/${urlFileFormats[i]}` });
        const font = {
            binary: fontBlob,
            fileType: urlFileFormats[i],
            lastModified: Date.now()
        };
        await store.put(font, url); // put our processed data into the indexDB
    }
    // commit transaction
    await tx.done;
    // close DB if requested
    if (closeDBAfterFinished)
        db.close();
};
// ==========
sw.addEventListener("install", event => {
    const installEvent = event;
    // fetch fileURLs from google font
    installEvent.waitUntil(new Promise((res) => {
        res(0);
    }));
});
sw.addEventListener("activate", () => { });
sw.addEventListener("message", (e) => {
    // if the event wants us to start downloading the font
    if (e.data.command === "downloadRequiredFonts") {
        // we download em bitches
        downloadRequiredFonts();
    }
    else if (e.data.command === "downloadURLFont") {
        // downloading specific URLs and storing them into indexDB
        const url = e.data.payload;
        if (!url)
            throw new Error("No url passed to downloadURLFont");
        openDB(fontDBName, 1, {
            upgrade(db) {
                db.createObjectStore(TTFObjectStore); // setup db object store. We don't need a keypath as we'll specify it when putting data in
            },
        }).then(db => {
            downloadFontFromURLs(db, url, true);
        });
    }
});
sw.onerror = (error) => {
    console.error(`Error from Font Installer: ${error}`);
};
//# sourceMappingURL=fontInstaller.worker.js.map