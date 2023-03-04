import { writable, get } from 'svelte/store';
import type { elementStyle } from '../types/element';
import type { HTMLtags, element } from "../types/general";

export let collection = writable<element[]>([]); // the project file data

export let selectedComponent = writable<number>(-1);
export let selectedOverride = writable<number>(-1);
export let focusedComponent = writable<number>(-1); // this is for detecting delete
export let focusedOverride = writable<number>(-1); // this is for detecting delete
export let layerDeleteLock = writable<boolean>(false); // this is for locking the delete function. If this is true, you can't delete
export let layerBlurLock = writable<boolean>(false); // this is for locking the blur function. If this is true, you can't blur

// functions for controlling the collection list
export const addComponent = (type:HTMLtags, defaultStyle:elementStyle={}, showOutline=false) => {
    let currCollection = get(collection);
    // check if type aready exist in currCollection
    for(let i = 0; i < currCollection.length; i++){
        if(currCollection[i].type === type){
            // type already exist. Add new blank override to that type instead
            addOverride(i);
            return;
        }
    }

    // create a new element interfact instance with type *type*, and then set the new value to collection
    currCollection = [...currCollection, {
        type : type,
        showing : false,
        style : defaultStyle,
        styleOverrides : [],
        showOutline : showOutline
    }];
    collection.set(currCollection);
}

export const addOverride = (elmntIndex:number):void => {
    let currCollection = get(collection);

    // find a non-duplicate name
    let i = 1;
    while(true){
        let nameDup = false;
        for(let j = 0; j < currCollection[elmntIndex].styleOverrides.length; j++){
            if(currCollection[elmntIndex].styleOverrides[j].name === `override-${i}`){
                // set nameDup to true and break loop
                nameDup = true;
                break;
            }
        }
        // if there is no dup, break out loop
        if(!nameDup) break;
        i++; // else increment i and check again
    }

    // create a new override and add it to styleOverrides
    const cs = currCollection[elmntIndex].style;
    currCollection[elmntIndex].styleOverrides = [...currCollection[elmntIndex].styleOverrides, {
        name: `override-${i}`,
        // style: Object.assign({}, currCollection[elmntIndex].style)
        style: structuredClone(cs)
    }]

    // show overrides first
    currCollection[elmntIndex].showing = true;
    currCollection = [...currCollection];

    collection.set(currCollection);
}