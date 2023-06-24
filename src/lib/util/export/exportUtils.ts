import { openDB as openDBWithIDB } from "idb";
import type { IDBPObjectStore, IDBPTransaction, IDBPDatabase } from "idb";
import { fontDBName, TTFObjectStore, type fontBinary } from "$lib/workers/fontInstaller.worker";
import { searchFontIndex, type fontObject } from "$src/lib/workers/pseudoWorkers/fonts";
import { systemDefaultStyles } from "$src/lib/@const/element.const";

const openDB = async (db: IDBPDatabase): Promise<IDBPDatabase> => {
    // check if the DB is already open by seeing if it holds a value
    if (!!db) return;

    // open the DB and store it to db;
    db = await openDBWithIDB(fontDBName, 1, {
        upgrade(db) {
            db.createObjectStore(TTFObjectStore); // setup db object store. We don"t need a keypath as we"ll specify it when putting data in
        },
    })

    return db;
}

const blobToBase64 = (blob) => new Promise<string>((res, rej) => {
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onload = () => res(reader.result as string); // shit implementation but who gives a fuck
    reader.onerror = error => rej(error);
});

export const getFontBinaryB64 = async (fontObj: fontObject, fontWeight: number, includeDataTag = false): Promise<string> => {
    // setup and open database
    let db: IDBPDatabase;
    db = await openDB(db);

    // open DB transaction so we can start fetching the font binary data.
    let tx: IDBPTransaction<unknown, ["TTF"], "readonly">;
    let store: IDBPObjectStore<unknown, ["TTF"], "TTF", "readonly">;

    try {
        tx = db.transaction(TTFObjectStore, "readonly");
        store = tx.objectStore(TTFObjectStore);
    } catch (error) {
        console.warn("Tried to update DB while DB is closing.");
        return;
    }

    // Get URL from fontObj
    const fontURL = fontObj.fileURLs.reduce((acc, font) => {
        acc[font.variation] = font.url;
        return acc;
    }, {})[fontWeight];

    // use the fontURL to fetch the binary data from indexedDB
    const fontBinaryObj = await store.get(fontURL) as fontBinary; // get the blob object

    let b64: string;
    try{
        b64 = await blobToBase64(fontBinaryObj.binary);
    } catch (err){ // error handling
        throw err;
    }

    if(!includeDataTag){
        b64 = b64.split(',')[1];
    }

    return b64;
}