import getStringFor from "$src/lib/util/toString";

type exportFunction = (style: elementStyle) => string | null;

/**
 * A map of generative functions with add
 */
const CSSTemplate: Map<string, exportFunction> = new Map<string, exportFunction>();

// Width and height
CSSTemplate.set("000000x001", (style: elementStyle): string => { // width
    return null;
});
CSSTemplate.set("000000x000", (style: elementStyle): string => { // width
    if(style.width !== undefined){
        return `width: ${getStringFor.unitedAttr(style.width)};`;
    } return null;
});
CSSTemplate.set("000001x000", (style: elementStyle): string => { // height
    if(style.height !== undefined){
        return `height: ${getStringFor.unitedAttr(style.height)};`;
    } return null;
});

// =========================== UTILITY FUNCTIONS ===========================

export default CSSTemplate;