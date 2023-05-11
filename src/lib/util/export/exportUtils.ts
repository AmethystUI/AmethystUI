import setImmediate from "../setImmediate"

import { openDB as openDBWithIDB } from "idb";
import type { IDBPObjectStore, IDBPTransaction, IDBPDatabase } from "idb";
import { fontDBName, TTFObjectStore } from "$lib/workers/fontInstaller.worker";
import { searchFontIndex, type fontObject } from "$src/lib/workers/pseudoWorkers/fonts";

const openDB = async (db: IDBPDatabase) => {
    // check if the DB is already open by seeing if it holds a value
    if(!!db) return;

    // open the DB and store it to db;
    db = await openDBWithIDB(fontDBName, 1, {
        upgrade(db) {
            db.createObjectStore(TTFObjectStore); // setup db object store. We don't need a keypath as we'll specify it when putting data in
        },
    })
}

export const getFontBinaryB64 = async (fontObjs: fontObject[], fontName: string, fontWeight: number): Promise<string> => {    
    // setup and open database
    // NOTE: Commented out for testing
    // let db:IDBPDatabase;
    // await openDB(db);
    
    // // open DB transaction so we can start fetching the font binary data.
    // let tx: IDBPTransaction<unknown, ["TTF"], "readonly">;
    // let store: IDBPObjectStore<unknown, ["TTF"], "TTF", "readonly">;

    // try{
    //     tx = db.transaction(TTFObjectStore, "readonly");
    //     store = tx.objectStore(TTFObjectStore);
    // } catch (error) {
    //     console.warn("Tried to update DB while DB is closing.");
    //     return;
    // }

    // Get URL from fontObjs
    const fontMatchIndex = await searchFontIndex(fontObjs, fontName);
    if(fontMatchIndex === -1){ // Edge case. This should technically never run
        console.warn("Couldn't find font with name: " + fontName);
        throw new Error("Couldn't find font with name: " + fontName);
    }
    const fontMatchObj: fontObject = fontObjs[fontMatchIndex];
    const fontURL = fontMatchObj.fileURLs.reduce((acc, font) => {
        acc[font.variation] = font.url;
        return acc;
    }, {})[fontWeight];

    console.log(fontURL);
    
    return "";
}