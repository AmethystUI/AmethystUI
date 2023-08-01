import { writable, get } from "svelte/store";
export let mainDoverlayData = writable({
    x: 0,
    y: 0,
    w: 250,
    h: 300,
    offsetX: 10,
    offsetY: 0,
    cursorOffsetX: 0,
    cursorOffsetY: 0,
    visible: false,
    dragLocked: false,
    initialDrag: true,
    activeComponentID: undefined,
    overlayLocked: false,
    isOpening: false,
});
export const setX = (val) => {
    let currentVal = get(mainDoverlayData);
    // do not update if drag locked is on
    if (currentVal.dragLocked)
        return;
    currentVal.x = val;
    mainDoverlayData.set({ ...currentVal });
};
export const setY = (val) => {
    let currentVal = get(mainDoverlayData);
    // do not update if drag locked is on
    if (currentVal.dragLocked)
        return;
    currentVal.y = val;
    mainDoverlayData.set({ ...currentVal });
};
export const setSelectedElmnt = (elmntNum, overrideNum) => {
    setTimeout(() => {
        let currentVal = get(mainDoverlayData);
        mainDoverlayData.set({ ...currentVal });
    }, 0);
};
// clears all prop references
export const clearElmnt = () => {
    let currentVal = get(mainDoverlayData);
    mainDoverlayData.set({ ...currentVal });
};
//# sourceMappingURL=dynamicOverlayManager.js.map