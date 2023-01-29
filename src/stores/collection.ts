import { writable, get } from 'svelte/store';

export type HTMLtag = "A" | "BODY" | "BUTTON" | "CANVAS" | "DIV" | "H1" | "H2" | "H3" | "H4" | "H5" | "H6" | "HR" | "INPUT" | "LABEL" | "OL" | "UL" | "PROGRESS" | "P" | "SECTION" | "SPAN" | "TEXTAREA";
export type units = "px" | "pt" | "pc" | "em" | "rem" | "vw" | "vh" | "%" | "fit-content";
export type borderOutlineStyle = "dotted" | "dashed" | "solid" | "double" | "groove" | "ridge" | "inset" | "outset" | "hidden";
export type displayTypes = "flex" | "inline" | "none";
export type typography = "poppins";
export type textAlignment = "center" | "left" | "right" | "justify";
export type flexAlignment = "flex-start" | "flex-end" | "center" | "space-between" | "space-around" | "space-evenly";
export type flexDirection = "row" | "column" | "row-reverse" | "column-reverse";
export type textTransform = "uppercase" | "lowercase" | "capitalize";
export type overflow = "visible" | "hidden" | "scroll" | "auto";
export type colorNumericType = "rgb" | "hsl";
export type textCasing = "lower" | "mix" | "upper";
export type textDecoration = "italicize" | "underline" | "strike";
export type typeCategories = "sans-serif" | "serif" | "display" | "handwriting" | "monospace";

export interface tagInfo{
    name : string,
    iconURI : string
}
export const HTMltagInfo: Record<HTMLtag, tagInfo> = {
    "A"         : {"name" : "Anchor", "iconURI" : "./assets/icons/link.svg"},
    "BODY"      : {"name" : "Document body", "iconURI" : "./assets/icons/browser.svg"},
    "BUTTON"    : {"name" : "Button", "iconURI" : "./assets/icons/play-circle.svg"},
    "CANVAS"    : {"name" : "Canvas", "iconURI" : "./assets/icons/canvas.svg"},
    "DIV"       : {"name" : "Division", "iconURI" : "./assets/icons/grid.svg"},
    "H1"        : {"name" : "Heading 1", "iconURI" : "./assets/icons/heading.svg"},
    "H2"        : {"name" : "Heading 2", "iconURI" : "./assets/icons/heading.svg"},
    "H3"        : {"name" : "Heading 3", "iconURI" : "./assets/icons/heading.svg"},
    "H4"        : {"name" : "Heading 4", "iconURI" : "./assets/icons/heading.svg"},
    "H5"        : {"name" : "Heading 5", "iconURI" : "./assets/icons/heading.svg"},
    "H6"        : {"name" : "Heading 6", "iconURI" : "./assets/icons/heading.svg"},
    "HR"        : {"name" : "Horizontal line", "iconURI" : "./assets/icons/minus.svg"},
    "INPUT"     : {"name" : "Input", "iconURI" : "./assets/icons/globe.svg"},
    "LABEL"     : {"name" : "Label", "iconURI" : "./assets/icons/pricetags.svg"},
    "OL"        : {"name" : "Organized list", "iconURI" : "./assets/icons/list.svg"},
    "UL"        : {"name" : "Unorganized list", "iconURI" : "./assets/icons/menu.svg"},
    "PROGRESS"  : {"name" : "Progress", "iconURI" : "./assets/icons/clock.svg"},
    "P"         : {"name" : "Paragraph", "iconURI" : "./assets/icons/paragraph.svg"},
    "SECTION"   : {"name" : "Section", "iconURI" : "./assets/icons/layout.svg"},
    "SPAN"      : {"name" : "Span", "iconURI" : "./assets/icons/flash.svg"},
    "TEXTAREA"  : {"name" : "Textarea", "iconURI" : "./assets/icons/edit-2.svg"},
}

export interface unitedAttr<T>{
    v : T,
    u : units
}

export interface numberRange{
    low : 0,
    high : 100
}

export interface shadow{
    radius : unitedAttr<number>,
    x : unitedAttr<number>,
    y : unitedAttr<number>,
    color : color
} export interface boxShadow {
    base : shadow,
    grow : unitedAttr<number>,
}

export interface typographyStyle{
    typeface : string, // same as font family name
    variation : number, // basically the weight
    
    textDecorations: textDecoration[],

    casing: textCasing,
    alignment: textAlignment,

    size : unitedAttr<number>,
    tracking :unitedAttr<number>,
    lineHeight : unitedAttr<number>,
}

export interface color{
    type : colorNumericType,
    r : number,
    g : number,
    b : number,
    h : number,
    s : number,
    l : number,
    a : number,
    hex : string,
}

// all caps attributes are used as compilation tags
export interface elementStyle{
    USEBACKGROUND? : boolean; // done
    backgroundColor? : color, // done
    opacity? : number, // done
    overflowX? : overflow, // done
    overflowY? : overflow, // done
    
    USESHADOW? : boolean, // done
    boxShadows? : boxShadow[], // done
    muxBoxShadClr? : color, // done

    USEBORDER? : boolean,
    borderWidthTop? : unitedAttr<number>, // done
    borderWidthRight? : unitedAttr<number>, // done
    borderWidthBottom? : unitedAttr<number>, // done
    borderWidthLeft? : unitedAttr<number>, // done
    borderColor? : color, // done
    borderStyleTop? : borderOutlineStyle, // done
    borderStyleRight? : borderOutlineStyle, // done
    borderStyleBottom? : borderOutlineStyle, // done
    borderStyleLeft? : borderOutlineStyle, // done
    borderRadiusTop? : unitedAttr<number>, // done
    borderRadiusRight? : unitedAttr<number>, // done
    borderRadiusBottom? : unitedAttr<number>, // done
    borderRadiusLeft? : unitedAttr<number>, // done

    marginTop? : unitedAttr<number>, // done
    marginRight? : unitedAttr<number>, // done
    marginBottom? : unitedAttr<number>, // done
    marginLeft? : unitedAttr<number>, // done

    paddingTop? : unitedAttr<number>, // done
    paddingRight? : unitedAttr<number>, // done
    paddingBottom? : unitedAttr<number>, // done
    paddingLeft? : unitedAttr<number>, // done
    
    height? : unitedAttr<number>, // done
    width? : unitedAttr<number>, // done
    
    // outline radius is controlled by border radius. That's why it doesn't exist here
    // outline also only accept one type of style
    USEOUTLINE? : boolean, // done
    outlineWidth? : unitedAttr<number>, // done
    outlineColor? : color, // done
    outlineStyle? : borderOutlineStyle, // done
    outlineOffset? : unitedAttr<number>, // done

    content? : string,
    placeholder? : string,
    typeStyle? : typographyStyle, // we have to condense all of these stuff into a single attribute because we have an overlay controlling it. And that requires a single, condensed attr.
    color? : color,

    display?: displayTypes,

    // FLEX ONLY (implement in public preview 2.0)
    // justifyContent?: flexAlignment,
    // alignItems?: flexAlignment,
    // flexDirection?: flexDirection,

    translateX? : unitedAttr<number>,
    translateY? : unitedAttr<number>,
    scaleX? : number,
    scaleY? : number,  
};

// Google font api key: AIzaSyB0YyT0-3AgT2aF45O4HropOlNx1hghmaI
// Tester key:          AIzaSyDW3JQmec-yJykfP-FcRYpIujOc6jYa4RQ

export interface override{
    name : string,
	style : elementStyle
};

export interface element{
    type : HTMLtag,
    showing: boolean,
    style : elementStyle,
    showPlaceHolderContent? : boolean,
    styleOverrides : override[],
    showOutline : boolean
};

export let collection = writable<element[]>([]);

export let selectedComponent = writable<number>(-1);
export let selectedOverride = writable<number>(-1);
export let focusedComponent = writable<number>(-1); // this is for detecting delete
export let focusedOverride = writable<number>(-1); // this is for detecting delete
export let layerDeleteLock = writable<boolean>(false); // this is for locking the delete function. If this is true, you can't delete
export let layerBlurLock = writable<boolean>(false); // this is for locking the blur function. If this is true, you can't blur

// functions for controlling the collection list
export const addComponent = (type:HTMLtag, defaultStyle:elementStyle={}, showOutline=false) => {
    let currCollection = get(collection);
    // check if type aready exist in currCollection
    for(let i = 0; i < currCollection.length; i++){
        if(currCollection[i].type === type){
            // type already exist. Add new blank override to that type instead
            addOverride(i);
            return;
        }
    }

    // create a new element interfact instance with type *type*, and then set the new value to collection
    currCollection = [...currCollection, {
        type : type,
        showing : false,
        style : defaultStyle,
        styleOverrides : [],
        showOutline : showOutline
    }];
    collection.set(currCollection);
}

export const addOverride = (elmntIndex:number):void => {
    let currCollection = get(collection);

    // find a non-duplicate name
    let i = 0;
    while(true){
        let nameDup = false;
        for(let j = 0; j < currCollection[elmntIndex].styleOverrides.length; j++){
            if(currCollection[elmntIndex].styleOverrides[j].name === `Override ${i}`){
                // set nameDup to true and break loop
                nameDup = true;
                break;
            }
        }
        // if there is no dup, break out loop
        if(!nameDup) break;
        i++; // else increment i and check again
    }

    // create a new override and add it to styleOverrides
    const cs = currCollection[elmntIndex].style;
    currCollection[elmntIndex].styleOverrides = [...currCollection[elmntIndex].styleOverrides, {
        name: `Override ${i}`,
        // style: Object.assign({}, currCollection[elmntIndex].style)
        style: structuredClone(cs)
    }]

    // show overrides first
    currCollection[elmntIndex].showing = true;
    currCollection = [...currCollection];

    collection.set(currCollection);
}