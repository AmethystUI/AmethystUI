import { collection } from "$src/lib/stores/collection";
import { get } from "svelte/store";

import _ from "../../common";

import { encodeAddr } from "../configs/css.configs";

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
        let rootStyleString = generateStyleString(elementStyle);

        // console.log(rootStyleString);
    }
}

const generateStyleString = (style: elementStyle) => {
    console.log(encodeAddr({p: 1, w: 0}, {p: 3, w: 0}, {p: 2, w: 0}));
}

export default exportCSS;