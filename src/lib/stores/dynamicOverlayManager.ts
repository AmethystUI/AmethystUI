import { writable, get } from "svelte/store";

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

export let mainDoverlayData = writable<overlayData>({
    x : 0,
    y : 0,
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
    let currentVal:overlayData = get(mainDoverlayData);
    
    // do not update if drag locked is on
    if(currentVal.dragLocked) return;

    currentVal.x = val;
    mainDoverlayData.set({...currentVal});
}
export const setY = (val:number) => {
    let currentVal:overlayData = get(mainDoverlayData);
        
    // do not update if drag locked is on
    if(currentVal.dragLocked) return;

    currentVal.y = val;
    mainDoverlayData.set({...currentVal});
}
export const setSelectedElmnt = (elmntNum?:number, overrideNum?:number) => {
    setTimeout(() => {
        let currentVal:overlayData = get(mainDoverlayData);
        mainDoverlayData.set({...currentVal});
    }, 0);
}

// clears all prop references
export const clearElmnt = () => {
    let currentVal:overlayData = get(mainDoverlayData);
    mainDoverlayData.set({...currentVal});
}