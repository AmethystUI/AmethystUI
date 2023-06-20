import getStringFor from "$src/lib/util/toString";
import _ from "$src/lib/util/common";
import { getClosestVariation, type fontObject } from "$src/lib/workers/pseudoWorkers/fonts";
import { toHex8 as hex8, toHex as hex4 } from "../utils/css.util";

type exportFunction = () => string | null;

/**
 * A map of generative functions with add
 */
export let CSSTemplate: Map<string, exportFunction> = new Map<string, exportFunction>();
let conf: exportConfig;

export const generateCSSTemplate = (config: exportConfig, elementType: HTMLtags, elementStyle: elementStyle) => {
    // update config
    conf = config;

    // generate the map
    CSSTemplate = genMap(elementType, elementStyle);
}

const genMap = (tag: HTMLtags, style: elementStyle): Map<string, exportFunction> => {
    const hmap: Map<string, exportFunction> = new Map<string, exportFunction>();
    const compress: boolean = conf.common.compressionAmt > 0;

    // Width and height
    hmap.set("000000x000", (): string => { // width
        if(_.isDefault(tag, style, "width")) return ""; // check default values
        return `width: ${getStringFor.unitedAttr(style.width)};`;
    });
    hmap.set("000001x000", (): string => { // height
        if(_.isDefault(tag, style, "height")) return ""; // check default values
        return `height: ${getStringFor.unitedAttr(style.height)};`;
    });

    hmap.set("000100x010", (): string => { // condensed margin
        const allMarginAttr:elementStyleKeys[] = ["marginTop", "marginRight", "marginBottom", "marginLeft"];
        
        // if literally all default values exist and they ALL equal to the edited margins, don't generate anything
        if(allMarginAttr.every(attr => _.isDefault(tag, style, attr))) return ""; // check default values

        if(compress || _.isEqual(style.marginTop, style.marginRight, style.marginBottom, style.marginLeft)){
            return `margin: ${condenseQuadAttr(style.marginTop, style.marginRight, style.marginBottom, style.marginLeft, getStringFor.unitedAttr)};`
        }

        return null;
    });
    hmap.set("000100x000", (): string => { // margin top
        if(_.isDefault(tag, style, "marginTop")) return ""; // check default values
        return `margin-top: ${getStringFor.unitedAttr(style.marginTop)};`;
    });
    hmap.set("000101x000", (): string => { // margin right
        if(_.isDefault(tag, style, "marginRight")) return ""; // check default values
        return `margin-right: ${getStringFor.unitedAttr(style.marginRight)};`;
    });
    hmap.set("000102x000", (): string => { // margin bottom
        if(_.isDefault(tag, style, "marginBottom")) return ""; // check default values
        return `margin-bottom: ${getStringFor.unitedAttr(style.marginBottom)};`;
    });
    hmap.set("000103x000", (): string => { // margin left
        if(_.isDefault(tag, style, "marginLeft")) return ""; // check default values
        return `margin-left: ${getStringFor.unitedAttr(style.marginLeft)};`;
    });

    hmap.set("000200x010", (): string => { // condensed padding
        const allPaddingAttr:elementStyleKeys[] = ["paddingTop", "paddingRight", "paddingBottom", "paddingLeft"];
        
        // if literally all default values exist and they ALL equal to the edited paddings, don't generate anything
        if(allPaddingAttr.every(attr => _.isDefault(tag, style, attr))) return ""; // check default values

        if(compress || _.isEqual(style.paddingTop, style.paddingRight, style.paddingBottom, style.paddingLeft)){
            return `padding: ${condenseQuadAttr(style.paddingTop, style.paddingRight, style.paddingBottom, style.paddingLeft, getStringFor.unitedAttr)};`
        }

        return null;
    });
    hmap.set("000200x000", (): string => { // padding top
        if(_.isDefault(tag, style, "paddingTop")) return ""; // check default values
        return `padding-top: ${getStringFor.unitedAttr(style.paddingTop)};`;
    });
    hmap.set("000201x000", (): string => { // padding right
        if(_.isDefault(tag, style, "paddingRight")) return ""; // check default values
        return `padding-right: ${getStringFor.unitedAttr(style.paddingRight)};`;
    });
    hmap.set("000202x000", (): string => { // padding bottom
        if(_.isDefault(tag, style, "paddingBottom")) return ""; // check default values
        return `padding-bottom: ${getStringFor.unitedAttr(style.paddingBottom)};`;
    });
    hmap.set("000203x000", (): string => { // padding left
        if(_.isDefault(tag, style, "paddingLeft")) return ""; // check default values
        return `padding-left: ${getStringFor.unitedAttr(style.paddingLeft)};`;
    });

    
    hmap.set("010000x000", (): string => { // opacity
        if(_.isDefault(tag, style, "opacity")) return ""; // check default values
        return `opacity: ${style.opacity}%;`;
    });

    hmap.set("010100x010", (): string => { // overflow
        const allOverflowAttr:elementStyleKeys[] = ["overflowX", "overflowY"];
        
        if(allOverflowAttr.every(v => _.isDefault(tag, style, v))) return ""; // check default values

        if(style.overflowX === style.overflowY){
            return `overflow: ${style.overflowX};`;
        }
        
        return null;
    });
    hmap.set("010100x000", (): string => { // overflowX
        if(_.isDefault(tag, style, "overflowX")) return ""; // check default values
        return `overflowX: ${style.overflowX};`;
    });
    hmap.set("010101x000", (): string => { // overflowX
        if(_.isDefault(tag, style, "overflowY")) return ""; // check default values
        return `overflowY: ${style.overflowY};`;
    });
    hmap.set("010200x000", (): string => { // display
        // this might change in the future, but we'll keep it how it is for now
        if(style.justifyContent !== "none" || style.alignItems !== "none"){
            return `display: flex;`;
        }
        return null;
    })
    hmap.set("010201x000", (): string => { // justify content
        if(style.justifyContent === "none") return "";
        return `justify-content: ${style.justifyContent};`;
    })
    hmap.set("010202x000", (): string => { // align items
        if(style.alignItems === "none") return "";
        return `align-items: ${style.alignItems};`;
    })

    hmap.set("020000x000", (): string => { // border all
        if(!style.USEBACKGROUND) return null; // do not generate if we're not using a border
        
        if(_.isDefault(tag, style, "backgroundColor")) return ""; // check default values
        
        const clrText = getStringFor.color(
            style.backgroundColor,
            conf.common.compressionAmt,
            conf.stylesheets.colorFmt,
            conf.stylesheets.colorUnitInference,
        );
        return `background-color: ${clrText};`;
    });

    const USEBORDER: boolean = (
        style.USEBORDER &&
        !_.isUnitedValueZero(style.borderWidthTop, style.borderWidthRight, style.borderWidthBottom, style.borderWidthRight) &&
        !_.isEqual("hidden", style.borderStyleTop, style.borderStyleRight, style.borderStyleBottom, style.borderStyleLeft)
    );
    const USEOUTLINE: boolean = (
        style.USEOUTLINE &&
        !_.isUnitedValueZero(style.outlineWidth) &&
        style.outlineStyle !== "hidden"
    );
    hmap.set("030000x020", (): string => { // border highest compression
        if( !USEBORDER || !compress ) return null; // don't do anything if we're not compressing or not using a border
        
        const allCheckingAttr:elementStyleKeys[] = ["borderWidthTop", "borderWidthRight", "borderWidthBottom", "borderWidthLeft", "borderStyleTop", "borderStyleRight", "borderStyleBottom", "borderStyleLeft"];
        const isDefaultValue = allCheckingAttr.every(v => _.isDefault(tag, style, v));

        if(isDefaultValue) return ""; // check default values

        const equalWidth = _.isUnitedValueEqual(style.borderWidthTop, style.borderWidthRight, style.borderWidthBottom, style.borderWidthLeft);
        const equalStyle = _.isEqual(style.borderStyleTop, style.borderStyleRight, style.borderStyleBottom, style.borderStyleLeft);

        // do not generate if either equalStyle or equalWidth is false
        if(!equalStyle || !equalWidth) return null;

        const clrText = getStringFor.color(
            style.borderColor,
            conf.common.compressionAmt,
            conf.stylesheets.colorFmt,
            conf.stylesheets.colorUnitInference,
        );
        return `border: ${style.borderWidthTop.v}${style.borderWidthTop.u} ${style.borderStyleTop} ${clrText};`;
    });

    hmap.set("030000x010", (): string => { // border width right
        if( !USEBORDER || !compress ) return null; // don't do anything if we're not compressing or not using a border

        // generate border width and styles
        const widthAttr: elementStyleKeys[] = ["borderWidthTop", "borderWidthRight", "borderWidthBottom", "borderWidthLeft"];
        
        if( widthAttr.every(v => (!_.isDefault(tag, style, v))) ) return ""; // check for default values
        return `border-width: ${condenseQuadAttr(style.borderWidthTop, style.borderWidthRight, style.borderWidthBottom, style.borderWidthLeft, getStringFor.unitedAttr)};`
    });
    hmap.set("030001x010", (): string => { // border width right
        if( !USEBORDER || !compress ) return null; // don't do anything if we're not compressing or not using a border
        
        // generate border width and styles
        const styleAttr: elementStyleKeys[] = ["borderStyleTop", "borderStyleRight", "borderStyleBottom", "borderStyleLeft"];
        
        if( styleAttr.every(v => (!_.isDefault(tag, style, v))) ) return ""; // check for default values
        return `\nborder-style: ${condenseQuadAttr(style.borderStyleTop, style.borderStyleRight, style.borderStyleBottom, style.borderStyleLeft)};`;
    });
    hmap.set(compress ? "030002x010" : "030004x000", (): string => { // border color
        if( !USEBORDER || !compress ) return null; // don't do anything if we're not compressing or not using a border

        // generate color
        if( _.isDefault(tag, style, "borderColor") ) return ""; // check for default values
        const clr = getStringFor.color(
            style.borderColor,
            conf.common.compressionAmt,
            conf.stylesheets.colorFmt,
            conf.stylesheets.colorUnitInference,
        );
        return `\nborder-color: ${clr};`;
    });

    hmap.set("030000x000", (): string => { // border top
        if( !USEBORDER ) return null; // don't do anything if we're not using a border
        
        if(_.isDefault(tag, style, "borderWidthTop"), _.isDefault(tag, style, "borderStyleTop")) return ""; // check for default values

        return `border-top: ${getStringFor.unitedAttr(style.borderWidthTop)} ${style.borderStyleTop};`;
    });
    hmap.set("030001x000", (): string => { // border right
        if( !USEBORDER ) return null; // don't do anything if we're not using a border
        
        if(_.isDefault(tag, style, "borderWidthRight"), _.isDefault(tag, style, "borderStyleRight")) return ""; // check for default values

        return `\nborder-right: ${getStringFor.unitedAttr(style.borderWidthRight)} ${style.borderStyleRight};`;
    });
    hmap.set("030002x000", (): string => { // border bottom
        if(!USEBORDER ) return null; // don't do anything if we're not using a border
        
        if(_.isDefault(tag, style, "borderWidthBottom"), _.isDefault(tag, style, "borderStyleBottom")) return ""; // check for default values

        return `\nborder-bottom: ${getStringFor.unitedAttr(style.borderWidthBottom)} ${style.borderStyleBottom};`;
    });
    hmap.set("030003x000", (): string => { // border left
        if(!USEBORDER ) return null; // don't do anything if we're not using a border
        
        if(_.isDefault(tag, style, "borderWidthLeft"), _.isDefault(tag, style, "borderStyleLeft")) return ""; // check for default values

        return `\nborder-left: ${getStringFor.unitedAttr(style.borderWidthLeft)} ${style.borderStyleLeft};`;
    });
    
    const BRchunk = `0${USEBORDER ? 3 : 4}`;
    hmap.set(`${BRchunk}0100x020`, (): string => { // border radius
        if(!(USEBORDER || USEOUTLINE)) return null; // don't do anything if we're not using a border or not compressing

        const checkDefault:elementStyleKeys[] = ["borderRadiusTop", "borderRadiusRight", "borderRadiusBottom", "borderRadiusLeft"];

        if(checkDefault.every(v => _.isDefault(tag, style, v))) return "" // continue generating
        if(
            !compress &&
            !_.isEqual(style.borderRadiusTop, style.borderRadiusRight, style.borderRadiusBottom, style.borderRadiusLeft)
        ) return null; // if we're not meant to be compressing, and we cannot generate something nicely, do not compress.

        // generate condensed border radius
        return `border-radius: ${condenseQuadAttr(style.borderRadiusTop, style.borderRadiusRight, style.borderRadiusBottom, style.borderRadiusLeft, getStringFor.unitedAttr)};`
    });
    hmap.set(`${BRchunk}0100x010`, (): string => { // border radius top left
        if( !(USEBORDER || USEOUTLINE) ) return null; // don't do anything if we're not using a border

        if(_.isDefault(tag, style, "borderRadiusTop")) return ""; // check for default value
        return `border-top-left-radius: ${getStringFor.unitedAttr(style.borderRadiusTop)};`;
    });
    hmap.set(`${BRchunk}0101x010`, (): string => { // border radius top right
        if(!(USEBORDER || USEOUTLINE) ) return null; // don't do anything if we're not using a border

        if(_.isDefault(tag, style, "borderRadiusRight")) return ""; // check for default value
        return `\nborder-top-right-radius: ${getStringFor.unitedAttr(style.borderRadiusRight)};`;
    });
    hmap.set(`${BRchunk}0102x010`, (): string => { // border radius bottom right
        if(!(USEBORDER || USEOUTLINE) ) return null; // don't do anything if we're not using a border

        if(_.isDefault(tag, style, "borderRadiusBottom")) return ""; // check for default value
        return `\nborder-bottom-right-radius: ${getStringFor.unitedAttr(style.borderRadiusBottom)};`;
    });
    hmap.set(`${BRchunk}0103x010`, (): string => { // border radius bottom left
        if(!(USEBORDER || USEOUTLINE) ) return null; // don't do anything if we're not using a border

        if(_.isDefault(tag, style, "borderRadiusLeft")) return ""; // check for default value
        return `\nborder-bottom-left-radius: ${getStringFor.unitedAttr(style.borderRadiusLeft)};`;
    });

    hmap.set("040000x010", (): string => { // outline condensed
        if(!USEOUTLINE || !compress) return null; // don't do anything if we're not compressing

        let useableValues: string[] = ["outline: "];

        // outline width
        if(!_.isDefault(tag, style, "outlineWidth")) useableValues.push(getStringFor.unitedAttr(style.outlineWidth));
        // required outline width
        useableValues.push(style.outlineStyle);
        // outline color
        if(!_.isDefault(tag, style, "outlineColor")){
            const clr = getStringFor.color(
                style.outlineColor,
                conf.common.compressionAmt,
                conf.stylesheets.colorFmt,
                conf.stylesheets.colorUnitInference,
            );

            useableValues.push(clr);
        }

        return useableValues.join(" ").trim();
    });
    hmap.set("040001x000", (): string => { // outline width
        if(!USEOUTLINE) return null; // don't do anything if we're not using outline
    
        if(_.isDefault(tag, style, "outlineWidth")) return ""; // check for default value
        return `outline-width: ${getStringFor.unitedAttr(style.outlineWidth)};`;
    });
    hmap.set("040002x000", (): string => { // outline style
        if(!USEOUTLINE) return null; // don't do anything if we're not using outline

        return `\noutline-style: ${style.outlineStyle};`;
    });
    hmap.set("040003x000", (): string => { // outline color
        if(!USEOUTLINE) return null; // don't do anything if we're not using outline

        if(_.isDefault(tag, style, "outlineColor")) return ""; // check for default value
        return `\noutline-color: ${getStringFor.color(
            style.outlineColor,
            conf.common.compressionAmt,
            conf.stylesheets.colorFmt,
            conf.stylesheets.colorUnitInference,
        )};`;
    });
    
    hmap.set("040100x000", (): string => { return "" }) // will be radius, if applicable
    
    hmap.set("040200x000", (): string => { // outline offset
        if(!USEOUTLINE) return null; // don't do anything if we're not using outline
        if(_.isDefault(tag, style, "outlineOffset")) return ""; // check default
        return `outline-offset: ${getStringFor.unitedAttr(style.outlineOffset)};`;
    });

    const USETEXT = style.USETEXT;
    const typeStyle: typographyStyle = style.typeStyle;
    const fontObj: fontObject = typeStyle.fontObj;
    hmap.set("050000x010", (): string => { // font shorthand
        if(!USETEXT || !compress) return null; // don't do anything if we're not using text

        // for formal shorthand syntax, refer to https://developer.mozilla.org/en-US/docs/Web/CSS/font
        const useableValues: string[] = [];

        if(typeStyle.textDecorations.includes("italicize")){ // font style
            useableValues.push("italic");
        }
        // we don't have font-variant for now, but we could add it later if needed
        if(typeStyle.variation !== getClosestVariation(400, fontObj.variations)){ // font variantion / weight
            useableValues.push(`${typeStyle.variation}`);
        }
        useableValues.push(getStringFor.unitedAttr(typeStyle.size)); // mandatory font size
        useableValues.push(`/${getStringFor.unitedAttr(typeStyle.lineHeight)}`); // line height. This is mandatory for now because we don't have a "normal" option for line height
        
        useableValues.push(fontObj.family); // mandatory font family

        return `font: ${useableValues.join(" ").replace(" /", "/").trim()};`;
    });

    hmap.set("050000x000", () => { // font family
        return `font-family: ${fontObj.family};`;
    });
    hmap.set("050001x000", () => { // font size
        return `\nfont-size: ${getStringFor.unitedAttr(typeStyle.size)};`;
    });
    hmap.set("050002x000", () => { // font variation
        if(typeStyle.variation !== getClosestVariation(400, fontObj.variations)){
            return `font-weight: ${style.typeStyle.variation};`;
        } return "";
    });
    hmap.set("050003x000", () => { // line height
        return `\nline-height: ${getStringFor.unitedAttr(style.typeStyle.lineHeight)};`;
    });
    hmap.set("050004x000", () => { // font style
        if(typeStyle.textDecorations.includes("italicize")){ // font style
            return "\nfont-style: italic;";
        } return "";
    });
    hmap.set("050100x000", () => { // text color
        return `\ncolor: ${getStringFor.color(
            style.color,
            conf.common.compressionAmt,
            conf.stylesheets.colorFmt,
            conf.stylesheets.colorUnitInference,
        )};`;
    });

    const textChunk = compress ? "05" : "06";
    let startLine = compress ? 2 : 0;
    hmap.set(`${textChunk}${hex8(startLine++)}00x100`, (): string => { // text alignment
        if( !USETEXT ) return null; // don't do anything if we're not using text
        if(typeStyle.alignment === "left") return ""; // skip if we have no decorations
        return `text-align: ${typeStyle.alignment};`;
    });
    hmap.set(`${textChunk}${hex8(startLine++)}00x100`, (): string => { // text casing (transform)
        if( !USETEXT ) return null; // don't do anything if we're not using text
        if(typeStyle.casing === "none") return ""; // skip if we have no decorations
        return `text-transform: ${typeStyle.casing};`;
    });
    hmap.set(`${textChunk}${hex8(startLine++)}00x100`, (): string => { // underline + strike-through 
        if( !USETEXT ) return null; // don't do anything if we're not using text
        if(typeStyle.textDecorations.length === 0) return ""; // skip if we have no decorations

        const valueMapper: Record<textDecoration, string> = {
            italicize: "",
            underline: "underline",
            strike: "line-through"
        }
        return `text-decoration: ${typeStyle.textDecorations.map(v => valueMapper[v]).join(" ").trim()};`;
    });
    hmap.set(`${textChunk}${hex8(startLine++)}00x100`, (): string => { // tracking
        if( !USETEXT ) return null; // don't do anything if we're not using text
        if(_.isUnitedValueZero(typeStyle.tracking)) return ""; // skip if we have no decorations
        return `letter-spacing: ${getStringFor.unitedAttr(typeStyle.tracking)};`;
    });
    hmap.set("060000x000", ():string => { return null }); // place holder for if chunk 6 was merged with chunk 5

    hmap.set("070000x000", ():string => { // shadow work
        return "hi mom";
    })

    return hmap;
}

// =========================== UTILITY FUNCTIONS ===========================

/**
 * Condenses four attributes into a single string representation.
 *
 * @param top - The top attribute value.
 * @param right - The right attribute value.
 * @param bottom - The bottom attribute value.
 * @param left - The left attribute value.
 * @param toStr - An optional function used to convert attribute values to strings. Useful for specific objects that need to be stringified.
 * @returns The condensed string representation of the attributes.
 */
const condenseQuadAttr = (top: any, right: any, bottom: any, left: any, toStr = (v) => `${v}`): string => {
    if(_.isEqual(top, right, bottom, left)){
        return `${toStr(top)}`;
    } else if(_.isEqual(right, left) && _.isEqual(top, bottom)){
        return `${toStr(top)} ${toStr(right)}`
    } else if(_.isEqual(right, left)){
        return `${toStr(top)} ${toStr(right)} ${toStr(bottom)}`
    } else {
        return `${toStr(top)} ${toStr(right)} ${toStr(bottom)} ${toStr(left)}`
    }
}