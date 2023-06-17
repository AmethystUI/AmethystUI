import getStringFor from "$src/lib/util/toString";
import _ from "$src/lib/util/common";

type exportFunction = (style: elementStyle) => string | null;

/**
 * A map of generative functions with add
 */
export let CSSTemplate: Map<string, exportFunction> = new Map<string, exportFunction>();
let conf: exportConfig;

export const generateCSSTemplate = (config: exportConfig, elementType: HTMLtags) => {
    // update config
    conf = config;

    // generate the map
    CSSTemplate = genMap(elementType);
}

const genMap = (tag: HTMLtags): Map<string, exportFunction> => {
    const hmap: Map<string, exportFunction> = new Map<string, exportFunction>();
    const compress: boolean = conf.common.compressionAmt > 0;

    // Width and height
    hmap.set("000000x000", (style: elementStyle): string => { // width
        if(_.isDefault(tag, style, "width")) return ""; // check default values
        return `width: ${getStringFor.unitedAttr(style.width)};`;
    });
    hmap.set("000001x000", (style: elementStyle): string => { // height
        if(_.isDefault(tag, style, "height")) return ""; // check default values
        return `height: ${getStringFor.unitedAttr(style.height)};`;
    });

    hmap.set("000100x010", (style: elementStyle): string => { // condensed margin
        const allMarginAttr:elementStyleKeys[] = ["marginTop", "marginRight", "marginBottom", "marginLeft"];
        
        // if literally all default values exist and they ALL equal to the edited margins, don"t generate anything
        if(allMarginAttr.every(attr => _.isDefault(tag, style, attr))) return ""; // check default values

        if(compress || _.isEqual(style.marginTop, style.marginRight, style.marginBottom, style.marginLeft)){
            return `margin: ${condenseQuadAttr(style.marginTop, style.marginRight, style.marginBottom, style.marginLeft, getStringFor.unitedAttr)};`
        }

        return null;
    })
    hmap.set("000100x000", (style: elementStyle): string => { // margin top
        if(_.isDefault(tag, style, "marginTop")) return ""; // check default values
        return `margin-top: ${getStringFor.unitedAttr(style.marginTop)};`;
    })
    hmap.set("000101x000", (style: elementStyle): string => { // margin right
        if(_.isDefault(tag, style, "marginRight")) return ""; // check default values
        return `margin-right: ${getStringFor.unitedAttr(style.marginRight)};`;
    })
    hmap.set("000102x000", (style: elementStyle): string => { // margin bottom
        if(_.isDefault(tag, style, "marginBottom")) return ""; // check default values
        return `margin-bottom: ${getStringFor.unitedAttr(style.marginBottom)};`;
    })
    hmap.set("000103x000", (style: elementStyle): string => { // margin left
        if(_.isDefault(tag, style, "marginLeft")) return ""; // check default values
        return `margin-left: ${getStringFor.unitedAttr(style.marginLeft)};`;
    })

    hmap.set("000200x010", (style: elementStyle): string => { // condensed padding
        const allPaddingAttr:elementStyleKeys[] = ["paddingTop", "paddingRight", "paddingBottom", "paddingLeft"];
        
        // if literally all default values exist and they ALL equal to the edited paddings, don"t generate anything
        if(allPaddingAttr.every(attr => _.isDefault(tag, style, attr))) return ""; // check default values

        if(compress || _.isEqual(style.paddingTop, style.paddingRight, style.paddingBottom, style.paddingLeft)){
            return `padding: ${condenseQuadAttr(style.paddingTop, style.paddingRight, style.paddingBottom, style.paddingLeft, getStringFor.unitedAttr)};`
        }

        return null;
    })
    hmap.set("000200x000", (style: elementStyle): string => { // padding top
        if(_.isDefault(tag, style, "paddingTop")) return ""; // check default values
        return `padding-top: ${getStringFor.unitedAttr(style.paddingTop)};`;
    })
    hmap.set("000201x000", (style: elementStyle): string => { // padding right
        if(_.isDefault(tag, style, "paddingRight")) return ""; // check default values
        return `padding-right: ${getStringFor.unitedAttr(style.paddingRight)};`;
    })
    hmap.set("000202x000", (style: elementStyle): string => { // padding bottom
        if(_.isDefault(tag, style, "paddingBottom")) return ""; // check default values
        return `padding-bottom: ${getStringFor.unitedAttr(style.paddingBottom)};`;
    })
    hmap.set("000203x000", (style: elementStyle): string => { // padding left
        if(_.isDefault(tag, style, "paddingLeft")) return ""; // check default values
        return `padding-left: ${getStringFor.unitedAttr(style.paddingLeft)};`;
    })

    
    hmap.set("010000x000", (style: elementStyle): string => { // opacity
        if(_.isDefault(tag, style, "opacity")) return ""; // check default values
        return `opacity: ${style.opacity}%;`;
    })

    hmap.set("010100x010", (style: elementStyle): string => { // overflow
        const allOverflowAttr:elementStyleKeys[] = ["overflowX", "overflowY"];
        
        if(allOverflowAttr.every(v => _.isDefault(tag, style, v))) return ""; // check default values

        if(style.overflowX === style.overflowY){
            return `overflow: ${style.overflowX};`;
        }
        
        return null;
    })
    hmap.set("010100x000", (style: elementStyle): string => { // overflowX
        if(_.isDefault(tag, style, "overflowX")) return ""; // check default values
        return `overflowX: ${style.overflowX};`;
    })
    hmap.set("010101x000", (style: elementStyle): string => { // overflowX
        if(_.isDefault(tag, style, "overflowY")) return ""; // check default values
        return `overflowY: ${style.overflowY};`;
    })
    // TODO: Add display flex and alignment here

    hmap.set("020000x000", (style: elementStyle): string => { // border all
        if(!style.USEBACKGROUND) return null; // do not generate if we"re not using a border
        
        if(_.isDefault(tag, style, "backgroundColor")) return ""; // check default values
        
        const clrText = getStringFor.color(
            style.backgroundColor,
            conf.common.compressionAmt,
            conf.stylesheets.colorFmt,
            conf.stylesheets.colorUnitInference,
        );
        return `background-color: ${clrText};`;
    })

    let USEBORDER: boolean;
    hmap.set("030000x0f0", (style: elementStyle): string => { // initialize what use border actually is
        // Use a border if and only if: we said to use one, and all width are not 0, and all styles are not "hidden"
        USEBORDER = (
            style.USEBORDER &&
            !_.isUnitedValueZero(style.borderWidthTop, style.borderWidthRight, style.borderWidthBottom, style.borderWidthRight) &&
            !_.isEqual("hidden", style.borderStyleTop, style.borderStyleRight, style.borderStyleBottom, style.borderStyleLeft)
        );
        return null; // don"t actually return anything. Just run the function
    });
    hmap.set("030000x020", (style: elementStyle): string => { // border highest compression
        if( !USEBORDER || !compress ) return null; // don"t do anything if we"re not compressing or not using a border
        
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
    })
    hmap.set("030000x010", (style: elementStyle): string => { // border normal compression
        if( !USEBORDER || !compress ) return null; // don"t do anything if we"re not compressing or not using a border

        // generate border width and styles
        const widthAttr: elementStyleKeys[] = ["borderWidthTop", "borderWidthRight", "borderWidthBottom", "borderWidthLeft"];
        const styleAttr: elementStyleKeys[] = ["borderStyleTop", "borderStyleRight", "borderStyleBottom", "borderStyleLeft"];

        let widthStr, styleStr, clrStr = "";

        // if not all width are default values, genereate border width
        if( !widthAttr.every(v => (!_.isDefault(tag, style, v))) ) {
            widthStr = `border-width: ${condenseQuadAttr(style.borderWidthTop, style.borderWidthRight, style.borderWidthBottom, style.borderWidthLeft, getStringFor.unitedAttr)};`;
        }
        // if not all styles are default values, generate condensed border styles
        if( !styleAttr.every(v => (!_.isDefault(tag, style, v))) ) {
            styleStr = `border-style: ${condenseQuadAttr(style.borderStyleTop, style.borderStyleRight, style.borderStyleBottom, style.borderStyleLeft)};`;
        }
        // generaete color
        if( !_.isDefault(tag, style, "borderColor") ){
            const clr = getStringFor.color(
                style.borderColor,
                conf.common.compressionAmt,
                conf.stylesheets.colorFmt,
                conf.stylesheets.colorUnitInference,
            );
            clrStr = `border-color: ${clr};`;
        }

        return [widthStr, styleStr, clrStr].join("\n").trim();
    })
    hmap.set("030000x000", (style: elementStyle): string => { // border no compression
        if( !USEBORDER ) return null; // don"t do anything if we"re not using a border

        // generate border width and styles
        const directions: string[] = ["Top", "Right", "Bottom", "Left"];

        let clrStr = ""; let borderStrs: string[] = [];

        // generate border in all directions
        for( let i = 0; i < directions.length; i++ ){
            const dir = directions[i];
            if( // if both width and style are default values, or if either are hidden or 0, skip this direction
                ["borderWidth", "borderStyle"].every(v => _.isDefault(tag, style, <elementStyleKeys>`${v}${dir}`)) ||
                _.isUnitedValueZero( <unitedAttr<number>>style[`borderWidth${dir}`] ) || 
                _.isEqual( "hidden", style[`borderStyle${dir}`] )
            ) continue;
            
            // push direction to borderStrs
            const widthStr = `${getStringFor.unitedAttr(<unitedAttr<number>>style[`borderWidth${dir}`])}`;
            const styleStr = `${style[`borderStyle${dir}`]}`;
            borderStrs.push(
                `border-${dir.toLowerCase()}: ${widthStr} ${styleStr};`,
            );
        }

        // generaete color
        if( !_.isDefault(tag, style, "borderColor") ){
            const clr = getStringFor.color(
                style.borderColor,
                conf.common.compressionAmt,
                conf.stylesheets.colorFmt,
                conf.stylesheets.colorUnitInference,
            );
            clrStr = `border-color: ${clr};`;
        }

        return [clrStr, ...borderStrs].join("\n").trim();
    })

    
    
    return hmap;
}

// =========================== UTILITY FUNCTIONS ===========================

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