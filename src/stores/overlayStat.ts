import { writable, get } from "svelte/store";
import type { color, numberRange } from "./collection";

export type dataMode = "none" | "colorPicker" | "fontEditor";

export interface overlayData {
    x : number,
    y : number,
    w : number,
    h : number,
    positionTrackingID? : any,
    offsetX : number,
    offsetY : number,
    cursorOffsetX : number,
    cursorOffsetY : number,
    visible : boolean,
    overlayLocked : boolean,
    isOpening : boolean,
    dragLocked : boolean,
    initialDrag : boolean,
    activeComponentID : string
}

export let mainOverlayData = writable<overlayData>({
    x : window.innerWidth / 2,
    y : window.innerHeight / 2,
    w : 250,
    h : 300,
    offsetX : 10,
    offsetY : 0,
    cursorOffsetX : 0,
    cursorOffsetY : 0,
    visible : false,
    dragLocked : false, // when this is true, we stop updating the position all together and the picker acts like a window
    initialDrag : true,
    activeComponentID : undefined,
    overlayLocked : false,
    isOpening : false,
});

export const setX = (val:number):Promise<void> => {
    let currentVal:overlayData = get(mainOverlayData);
    
    // do not update if drag locked is on
    if(currentVal.dragLocked) return;

    currentVal.x = val;
    mainOverlayData.set({...currentVal});
}
export const setY = (val:number) => {
    let currentVal:overlayData = get(mainOverlayData);
        
    // do not update if drag locked is on
    if(currentVal.dragLocked) return;

    currentVal.y = val;
    mainOverlayData.set({...currentVal});
}
export const setSelectedElmnt = (elmntNum?:number, overrideNum?:number) => {
    setTimeout(() => {
        let currentVal:overlayData = get(mainOverlayData);
        mainOverlayData.set({...currentVal});
    }, 0);
}

// clears all prop references
export const clearElmnt = () => {
    let currentVal:overlayData = get(mainOverlayData);
    mainOverlayData.set({...currentVal});
}