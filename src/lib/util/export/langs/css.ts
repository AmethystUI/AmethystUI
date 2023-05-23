import { defaultHeight, defaultWidth } from "$src/lib/comp/ctrlMenuItems/StyleEditors/BoundingBoxEditor.svelte";

import { collection } from "$src/lib/stores/collection";
import setImmediate from "../../setImmediate";
import { get } from "svelte/store";

// Some of these utility functions are exported because we can use them for supersets of CSS, like SCSS.
export const getBoundingBoxStyles = (style: elementStyle): string => {
    const width: unitedAttr<number> = style.width ?? defaultWidth;
    const height: unitedAttr<number> = style.height ?? defaultHeight;

    let widthStr = `width: ${width.v}${width.u};`;
    let heightStr = `height: ${height.v}${height.u};`;

    if(width.u === "fit-content"){
        widthStr = `width: fit-content;`
    }
    if(height.u === "fit-content"){
        heightStr = `height: fit-content;`
    }

    return widthStr + heightStr;
}

const exportCSS = async () => {
    // Get current collection
    const coll: element[] = get(collection);

    // create new buffer object
    let buffer: simpleExportBuffer;

    // loop through every element to generate its relevant stylesheet code
    for(let i = 0; i < coll.length; i++) {
        const currentElement = coll[i];
        const elementStyle: elementStyle = currentElement.style;
        const elementType: HTMLtags = currentElement.type;
        
        // fetch root style
        const rootStyleString = await generateStyleString(elementStyle);

        console.log(rootStyleString);
    }
}

const generateStyleString = async (style: elementStyle) => {
    const boundingBox = getBoundingBoxStyles(style);

    return boundingBox;
}

export default exportCSS;