import { defaultHeight, defaultMargin, defaultPadding, defaultWidth } from "$src/lib/comp/ctrlMenuItems/StyleEditors/BoundingBoxEditor.svelte";

import { collection } from "$src/lib/stores/collection";
import { get } from "svelte/store";
import { exportConfigs } from "../exportManager";

import _ from "../../common";
import { defaultFlexAlign, defaultOpacity, defaultOverflow } from "$src/lib/comp/ctrlMenuItems/StyleEditors/AppearanceEditor.svelte";
import { defaultBgClr } from "$src/lib/comp/ctrlMenuItems/StyleEditors/BackgroundEditor.svelte";

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
        let rootStyleString = await generateStyleString(elementStyle);

        console.log(rootStyleString);
    }

    // run through aggressive compression if enabled
    // if(get(exportConfigs).common.compressionAmt === 2) rootStyleString = rootStyleString.replace(/\s+/g, "");
}

const generateStyleString = async (style: elementStyle) => {
    const configs = get(exportConfigs);
    const attributeSeperator = configs.common.compressionAmt == 0 ? "\n\n" : "\n";

    const boundingBox = getBoundingBoxStyles(style, configs);
    const appearance = getAppearanceStyles(style, configs);
    
    let backgroundClr = "";
    if(style.USEBACKGROUND) backgroundClr = getColorStyle("background-color", style.backgroundColor ?? defaultBgClr, configs);

    

    return backgroundClr;
    // return `${boundingBox}${attributeSeperator}${appearance}`;
}

/**
 * Generates a condensed representation of a 4 value bounding box attribute for use in CSS.
 *
 * @param {string} attrName - The name of the CSS attribute.
 * @param {unitedAttr<number>} valTop - The top value of the bounding box attribute.
 * @param {unitedAttr<number>} valRight - The right value of the bounding box attribute.
 * @param {unitedAttr<number>} valBottom - The bottom value of the bounding box attribute.
 * @param {unitedAttr<number>} valLeft - The left value of the bounding box attribute.
 * @returns {string} The condensed representation of the bounding box attribute.
 */
export const condenseBoundingBoxAttribute = (
    attrName: string,
    valTop: unitedAttr<number>,
    valRight: unitedAttr<number>,
    valBottom: unitedAttr<number>,
    valLeft: unitedAttr<number>
):string => {
    let str = "";
    if (_.isEqual(valTop, valRight, valBottom, valLeft)) {
        // in the case that all margins are equal
        str = `${attrName}: ${valTop.v}${valTop.u};`;
    } else if (_.isEqual(valTop, valBottom) && _.isEqual(valLeft, valRight)) {
        // in the case that the top and bottom match, and left and right match, but not all
        str = `${attrName}: ${valTop.v}${valTop.u} ${valLeft.v}${valLeft.u};`;
    } else if (_.isEqual(valLeft, valRight)) {
        // in the case that the left and right match, but not the top and bottom
        str = `${attrName}: ${valTop.v}${valTop.u} ${valLeft.v}${valLeft.u} ${valBottom.v}${valBottom.u};`;
    } else {
        // default to using standard marginal shorthand notation
        str = `${attrName}: ${valTop.v}${valTop.u} ${valRight.v}${valRight.u} ${valBottom.v}${valBottom.u} ${valLeft.v}${valLeft.u};`;
    }
    return str;
}

// Some of these utility functions are exported because we can use them for supersets of CSS, like SCSS.
export const getBoundingBoxStyles = (style: elementStyle, exportConfig: exportConfigInterface): string => {
    const compress = exportConfig.common.compressionAmt;  // 0 is none, 1 is standard, 2 is aggressive

    // define constants
    const width: unitedAttr<number> = style.width ?? defaultWidth;
    const height: unitedAttr<number> = style.height ?? defaultHeight;
    
    const marginTop: unitedAttr<number> = style.marginTop ?? defaultMargin;
    const marginRight: unitedAttr<number> = style.marginRight ?? defaultMargin;
    const marginBottom: unitedAttr<number> = style.marginBottom ?? defaultMargin;
    const marginLeft: unitedAttr<number> = style.marginLeft ?? defaultMargin;

    const paddingTop: unitedAttr<number> = style.paddingTop ?? defaultPadding;
    const paddingRight: unitedAttr<number> = style.paddingRight ?? defaultPadding;
    const paddingBottom: unitedAttr<number> = style.paddingBottom ?? defaultPadding;
    const paddingLeft: unitedAttr<number> = style.paddingLeft ?? defaultPadding;

    // Width and Height
    let widthStr = `width: ${width.v}${width.u};`;
    let heightStr = `height: ${height.v}${height.u};`;

    // adjust for fit-content
    if(width.u === "fit-content") widthStr = `width: fit-content;`;
    if(height.u === "fit-content") heightStr = `height: fit-content;`;

    // Margins
    let marginStr;
    if( compress !== 0 ){ // if any compression is used
        marginStr = condenseBoundingBoxAttribute("margin", marginTop, marginRight, marginBottom, marginLeft);
    } else {
        marginStr = [
            `margin-top: ${marginTop.v}${marginTop.u};`,
            `margin-right: ${marginRight.v}${marginRight.u};`,
            `margin-bottom: ${marginBottom.v}${marginBottom.u};`,
            `margin-left: ${marginLeft.v}${marginLeft.u};`
        ].join("\n");
    }

    // Paddings
    let paddingStr;
    if( compress !== 0 ){ // if any compression is used
        paddingStr = condenseBoundingBoxAttribute("padding", marginTop, marginRight, marginBottom, marginLeft);
    } else {
        paddingStr = [
            `padding-top: ${paddingTop.v}${paddingTop.u};`,
            `padding-right: ${paddingRight.v}${paddingRight.u};`,
            `padding-bottom: ${paddingBottom.v}${paddingBottom.u};`,
            `padding-left: ${paddingLeft.v}${paddingLeft.u};`
        ].join("\n");
    }

    // final formatting
    if(compress === 0) return `${widthStr}\n${heightStr}\n\n${marginStr}\n\n${paddingStr}`;
    return `${widthStr} ${heightStr}\n${marginStr} ${paddingStr}`
}

export const getAppearanceStyles = (style: elementStyle, exportConfig: exportConfigInterface): string => {
    const compress = exportConfig.common.compressionAmt;  // 0 is none, 1 is standard, 2 is aggressive

    // define constants
    const opacity: number = style.opacity ?? defaultOpacity;
    const overflowX: overflow = style.overflowX ?? defaultOverflow;
    const overflowY: overflow = style.overflowY ?? defaultOverflow;
    const alignX: flexAlignment = style.justifyContent ?? defaultFlexAlign;
    const alignY: flexAlignment = style.alignItems ?? defaultFlexAlign;

    // opacity
    const opacityStr = `opacity: ${opacity}%;`;

    // overflow
    let overflowStr = "";
    if(overflowX === overflowY){ // if both are the same, just use overflow as the attribute name
        overflowStr = `overflow: ${overflowX};`;
    } else {
        overflowStr = [`overflow-x: ${overflowX};`, `overflow-y: ${overflowY};`].join(compress === 0 ? "\n" : " ");
    }

    // alignment
    let alignXStr, alignYStr, alignStr = "";
    if(alignX !== "none" || alignY!== "none"){
        // initialize alignment string
        alignStr = "display: flex;"

        if(alignX !== "none"){ // only set justify content is both are necessary
            alignXStr = `justify-content: ${alignX};`;
        } if(alignY !== "none"){
            alignYStr = `align-items: ${alignY};`;
        }

        // finalize alignment string
        alignStr = [alignStr, alignXStr, alignYStr].join(compress === 0 ? "\n" : " ");
    }

    // final formatting
    if(compress === 0) return `${opacityStr}\n\n${overflowStr}\n\n${alignStr}`;
    return `${opacityStr}\n${overflowStr}\n${alignStr}`;
}

export const getColorStyle = (name: string, value: color, exportConfig: exportConfigInterface): string => {
    const compress = exportConfig.common.compressionAmt;  // 0 is none, 1 is standard, 2 is aggressive
    const colorFmt: colorFmt = exportConfig.stylesheets.colorFmt;

    let colorStr = "";
    if(colorFmt === "hex"){ // hex format
        colorStr = `#${value.hex}`;
    } else if(colorFmt === "hsl"){ // hsl / hsla format
        const useAlpha = value.a !== 100;
        const inferUnits = exportConfig.stylesheets.colorUnitInference || compress === 2;

        const alpha = `${value.a / (inferUnits ? 100 : 1)}${inferUnits ? "" : "%"}`;
        const sat = `${value.s / (inferUnits ? 100 : 1)}${inferUnits ? "" : "%"}`;
        const lum = `${value.l / (inferUnits ? 100 : 1)}${inferUnits ? "" : "%"}`;
        const hue = `${value.h}deg`;

        // if we're not using an alpha value or we're on the aggressive compression mode, we want to infer the units as much as we can
        colorStr = `${useAlpha ? "hsla" : "hsl"}(${hue}, ${sat}, ${lum}`; // the base string
        if(useAlpha) colorStr += `, ${alpha}`; // add alpha value if needed
        colorStr += `)`; // closing parenthesis
    } else if(colorFmt === "rgb"){ // rgb format
        const useAlpha = value.a !== 100;
        const inferUnits = exportConfig.stylesheets.colorUnitInference || compress === 2;

        const alpha = `${value.a / (inferUnits ? 100 : 1)}${inferUnits ? "" : "%"}`;
        
        colorStr = `${useAlpha ? "rgba" : "rgb"}(${value.r}, ${value.g}, ${value.b}`; // the base string
        if(useAlpha) colorStr += `, ${alpha}`; // add alpha value if needed
        colorStr += `)`; // closing parenthesis
    } else throw new Error(`Unknown color format: ${colorFmt}`);

    return `${name}: ${colorStr};`;
}

export default exportCSS;