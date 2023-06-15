import getStringFor from "$src/lib/util/toString";
import _ from "$src/lib/util/common";
import { defaultCSSStyles as defaultCSSstyles } from "$src/lib/@const/element.const";

type exportFunction = (style: elementStyle) => string | null;

/**
 * A map of generative functions with add
 */
export const CSSTemplate: Map<string, exportFunction> = new Map<string, exportFunction>();
let conf: exportConfig;

export const generateCSSTemplate = (config: exportConfig, elementType: HTMLtags) => {
    // update config
    conf = config;

    // clear the original map
    CSSTemplate.clear();

    // generate the map
    genMap(elementType);
}

const genMap = (tag: HTMLtags) => {
    // Width and height
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

    CSSTemplate.set("000100x010", (style: elementStyle): string => { // condensed margin
        if(conf.common.compressionAmt === 0){
            return null;
        }
        if( // if literally all default values exist and they ALL equal to the edited margins, don't generate anything
            !!defaultCSSstyles[tag].marginTop && _.isEqual(defaultCSSstyles[tag].marginTop, style.marginTop) &&
            !!defaultCSSstyles[tag].marginRight && _.isEqual(defaultCSSstyles[tag].marginTop, style.marginRight) &&
            !!defaultCSSstyles[tag].marginBottom && _.isEqual(defaultCSSstyles[tag].marginBottom, style.marginBottom) &&
            !!defaultCSSstyles[tag].marginLeft && _.isEqual(defaultCSSstyles[tag].marginLeft, style.marginLeft)
        ){
            return ""; // continue generating
        }
        return `margin: ${condenseQuadAttr(style.marginTop, style.marginRight, style.marginBottom, style.marginLeft)};`
    })
    CSSTemplate.set("000100x000", (style: elementStyle): string => { // margin top
        if(!!defaultCSSstyles[tag].marginTop && _.isEqual(defaultCSSstyles[tag].marginTop, style.marginTop)){
            return ""; // continue generating
        }
        return `margin-top: ${getStringFor.unitedAttr(style.marginTop)};`;
    })
    CSSTemplate.set("000101x000", (style: elementStyle): string => { // margin right
        if(!!defaultCSSstyles[tag].marginRight && _.isEqual(defaultCSSstyles[tag].marginRight, style.marginRight)){
            return ""; // continue generating
        }
        return `margin-right: ${getStringFor.unitedAttr(style.marginRight)};`;
    })
    CSSTemplate.set("000102x000", (style: elementStyle): string => { // margin bottom
        if(!!defaultCSSstyles[tag].marginBottom && _.isEqual(defaultCSSstyles[tag].marginBottom, style.marginBottom)){
            return ""; // continue generating
        }
        return `margin-bottom: ${getStringFor.unitedAttr(style.marginBottom)};`;
    })
    CSSTemplate.set("000103x000", (style: elementStyle): string => { // margin left
        if(!!defaultCSSstyles[tag].marginLeft && _.isEqual(defaultCSSstyles[tag].marginLeft, style.marginLeft)){
            return ""; // continue generating
        }
        return `margin-left: ${getStringFor.unitedAttr(style.marginLeft)};`;
    })
}

// =========================== UTILITY FUNCTIONS ===========================

const condenseQuadAttr = (
    top: unitedAttr<any>, right: unitedAttr<any>, bottom: unitedAttr<any>, left: unitedAttr<any>
): string => {
    if(_.isEqual(top, right, bottom, left)){
        return `${top.v}${top.u}`;
    } else if(_.isEqual(right, left) && _.isEqual(top, bottom)){
        return `${top.v}${top.u} ${right.v}${right.u}`
    } else if(_.isEqual(right, left)){
        return `${top.v}${top.u} ${right.v}${right.u} ${bottom.v}${bottom.u}`
    } else {
        return `${top.v}${top.u} ${right.v}${right.u} ${bottom.v}${bottom.u} ${left.v}${left.u}`
    }
}