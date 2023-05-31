import { defaultHeight, defaultMargin, defaultPadding, defaultWidth } from "$src/lib/comp/ctrlMenuItems/StyleEditors/BoundingBoxEditor.svelte";

import { collection } from "$src/lib/stores/collection";
import { get } from "svelte/store";
import { exportConfigs } from "../exportManager";

import _ from "../../common";
import { defaultFlexAlign, defaultOpacity, defaultOverflow } from "$src/lib/comp/ctrlMenuItems/StyleEditors/AppearanceEditor.svelte";
import { defaultBgClr } from "$src/lib/comp/ctrlMenuItems/StyleEditors/BackgroundEditor.svelte";
import getStringFor from "../../toString";

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

        // console.log(rootStyleString);
    }

    // run through aggressive compression if enabled
    // if(get(exportConfigs).common.compressionAmt === 2) rootStyleString = rootStyleString.replace(/\s+/g, "");
}

const generateStyleString = async (style: elementStyle) => {
    const configs = get(exportConfigs);
    const sectionSeperator = configs.common.compressionAmt == 0 ? "\n\n" : "\n";
    const groupingSeperator = configs.common.compressionAmt == 0 ? "\n" : " ";

    /* 
     * Create a new styleBuffer array, which is just a simple 3d array of strings that correspond to the grouping structure:
     *
     * Level 1 (highest) - Sections, where we control how attributes that control similar properties, such as bounding box attributes are grouped together.
     * Level 2 - Groups, where we control how attributes that control one property, such as overflow are grouped together.
     * Level 3 (lowest) - Attributes, which are the individual attributes that live in groups.
     * 
     * This buffer structure is optimized for CSS and CSS derivative languages, so it may be different from other formats.
     */
    let TOTAL_BUFFER: string[][][] = [];

    // bounding box attributes
    let BOUNDING_BOX_BUFFER: string[][] = [];

    // sizing
    BOUNDING_BOX_BUFFER.push([
        `width: ${getStringFor.unitedAttr(style.width)}`,
        `height: ${getStringFor.unitedAttr(style.height)}`
    ]);

    const marginStyle = getQuadAttributeStyles("margin", configs,
        style.marginTop ?? defaultMargin,
        style.marginRight ?? defaultMargin,
        style.marginBottom ?? defaultMargin,
        style.marginLeft ?? defaultMargin,
    );
    const paddingStyle = getQuadAttributeStyles("padding", configs,
        style.paddingTop ?? defaultPadding,
        style.paddingRight ?? defaultPadding,
        style.paddingBottom ?? defaultPadding,
        style.paddingLeft ?? defaultPadding,
    );

    // if there was no compression, we should be adding the margin and padding as seperate sections entirely.
    if(configs.common.compressionAmt === 0){
        // margin
        BOUNDING_BOX_BUFFER.push([marginStyle]);
        // padding
        BOUNDING_BOX_BUFFER.push([paddingStyle]);
        // final push
        TOTAL_BUFFER.push(BOUNDING_BOX_BUFFER);
    } else {
        // size
        TOTAL_BUFFER.push(BOUNDING_BOX_BUFFER);
        // margin
        TOTAL_BUFFER.push([[marginStyle]]);
        // padding
        TOTAL_BUFFER.push([[paddingStyle]]);
    }
        
        // appearance buffer
    let APPEARANCE_BUFFER: string[][] = [];

    // Opacity. Only add opacity if it is at the default, assumed 100%
    if(style.opacity !== 100){
        APPEARANCE_BUFFER.push([`opacity: ${style.opacity ?? defaultOpacity}`]);
    }
    
    // Overflow. Do not add is both x and y are set to auto, as that's the default value
    if(style.overflowX !== "auto" || style.overflowY !== "auto"){
        if(style.overflowX === style.overflowY){
            APPEARANCE_BUFFER.push[`overflow: ${style.overflowX ?? defaultOverflow}`];
        } else {
            APPEARANCE_BUFFER.push([
                style.overflowX !== "auto" ? `overflow-x: ${style.overflowX ?? defaultOverflow}` : "",
                style.overflowY !== "auto" ? `overflow-y: ${style.overflowY ?? defaultOverflow}` : ""
            ]);
        }
    }

    TOTAL_BUFFER.push(APPEARANCE_BUFFER);
    
    // background buffer
    let BACKGROUND_BUFFER: string[][] = [];

    if(style.USEBACKGROUND){
        BACKGROUND_BUFFER.push([`background-color: ${getStringFor.color(
            style.backgroundColor,
            configs.common.compressionAmt,
            configs.stylesheets.colorFmt,
            configs.stylesheets.colorUnitInference,
        )}`]);
    }

    TOTAL_BUFFER.push(BACKGROUND_BUFFER);

    // border buffer
    let BORDER_BUFFER: string[][] = [];
    
    // border radius
    const borderRadiusStr = getQuadAttributeStyles("padding", configs,
        style.paddingTop ?? defaultPadding,
        style.paddingRight ?? defaultPadding,
        style.paddingBottom ?? defaultPadding,
        style.paddingLeft ?? defaultPadding,
    );
    
    if(configs.common.compressionAmt > 0) BORDER_BUFFER.push([borderRadiusStr]);
    else TOTAL_BUFFER.push([[borderRadiusStr]]);

    // end with color since it will apply to everything
    BORDER_BUFFER.push([`border-color: ${getStringFor.color(
        style.borderColor,
        configs.common.compressionAmt,
        configs.stylesheets.colorFmt,
        configs.stylesheets.colorUnitInference,
    )}`]);

    console.log(JSON.stringify(TOTAL_BUFFER, null, 2))

    // const boundingBox = getBoundingBoxStyles(style, configs);
    // const appearance = getAppearanceStyles(style, configs);
    
    // let backgroundClr = "";
    // if(style.USEBACKGROUND) backgroundClr = getColorStyle("background-color", style.backgroundColor ?? defaultBgClr, configs);

    // let borderStr = "";


    return "";
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
export const condenseQuadAttributes = (
    attrName: string,
    valTop: unitedAttr<number>,
    valRight: unitedAttr<number>,
    valBottom: unitedAttr<number>,
    valLeft: unitedAttr<number>
):string => {
    let str = "";
    if (_.isEqual(valTop, valRight, valBottom, valLeft)) {
        // in the case that all margins are equal
        str = `${attrName}: ${valTop.v}${valTop.u}`;
    } else if (_.isEqual(valTop, valBottom) && _.isEqual(valLeft, valRight)) {
        // in the case that the top and bottom match, and left and right match, but not all
        str = `${attrName}: ${valTop.v}${valTop.u} ${valLeft.v}${valLeft.u}`;
    } else if (_.isEqual(valLeft, valRight)) {
        // in the case that the left and right match, but not the top and bottom
        str = `${attrName}: ${valTop.v}${valTop.u} ${valLeft.v}${valLeft.u} ${valBottom.v}${valBottom.u}`;
    } else {
        // default to using standard marginal shorthand notation
        str = `${attrName}: ${valTop.v}${valTop.u} ${valRight.v}${valRight.u} ${valBottom.v}${valBottom.u} ${valLeft.v}${valLeft.u}`;
    }
    return str;
}

// Some of these utility functions are exported because we can use them for supersets of CSS, like SCSS.
export const getQuadAttributeStyles = (
    attrName: string,
    exportConfig: exportConfigInterface,
    valTop: unitedAttr<number>,
    valRight: unitedAttr<number>,
    valBottom: unitedAttr<number>,
    valLeft: unitedAttr<number>
): string => {
    const compress = exportConfig.common.compressionAmt;  // 0 is none, 1 is standard, 2 is aggressive

    // Margins
    let str;
    if( compress !== 0 || _.isEqual(valTop, valRight, valBottom, valLeft) ){ // if any compression is used
        str = condenseQuadAttributes(attrName, valTop, valRight, valBottom, valLeft);
    } else {
        str = [
            `${attrName}-top: ${valTop.v}${valTop.u};`,
            `${attrName}-right: ${valRight.v}${valRight.u};`,
            `${attrName}-bottom: ${valBottom.v}${valBottom.u};`,
            `${attrName}-left: ${valLeft.v}${valLeft.u};`
        ].join("\n");
    }

    // final formatting
    return str;
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

export default exportCSS;