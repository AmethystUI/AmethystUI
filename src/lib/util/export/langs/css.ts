import { collection } from "$src/lib/stores/collection";
import setImmediate from "../../setImmediate";
import { get } from "svelte/store";

// Some of these utility functions are exported because we can use them for supersets of CSS, like SCSS.
export const getBoundingBoxStyles = (style: elementStyle) => {
    console.log(style.width,style.height);
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

        await setImmediate(() => {
            getBoundingBoxStyles(elementStyle);
        })
    }
}

export default exportCSS;