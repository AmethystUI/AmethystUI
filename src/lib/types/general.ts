import type { elementStyle } from "./element";
import type { fontObject } from "$lib/workers/pseudoWorkers/fonts";

export type HTMLtags = "A" | "BODY" | "BUTTON" | "CANVAS" | "DIV" | "H1" | "H2" | "H3" | "H4" | "H5" | "H6" | "HR" | "INPUT" | "LABEL" | "OL" | "UL" | "PROGRESS" | "P" | "SECTION" | "SPAN" | "TEXTAREA";
export type units = "px" | "pt" | "pc" | "em" | "rem" | "vw" | "vh" | "%" | "fit-content";
export type borderOutlineStyle = "dotted" | "dashed" | "solid" | "double" | "groove" | "ridge" | "inset" | "outset" | "hidden";
export type displayTypes = "flex" | "inline" | "none";
export type textAlignment = "center" | "left" | "right" | "justify";
export type flexAlignment = "flex-start" | "flex-end" | "center" | "space-between" | "space-around" | "space-evenly" | "none";
export type flexDirection = "row" | "column" | "row-reverse" | "column-reverse";
export type textTransform = "uppercase" | "lowercase" | "capitalize";
export type overflow = "visible" | "hidden" | "scroll" | "auto";
export type colorNumericType = "rgb" | "hsl";
export type textCasing = "lowercase" | "none" | "uppercase";
export type textDecoration = "italicize" | "underline" | "strike";
export type typeCategories = "sans-serif" | "serif" | "display" | "handwriting" | "monospace";

export interface override{ // overrides for the element
    name : string,
	style : elementStyle
};

export interface element{ // a single HTML element
    type : HTMLtags, // html element types
    showing: boolean, // show overrides
    style : elementStyle, // main style
    styleOverrides : override[], // self explanatory
    showOutline : boolean // show the dashed outline on the editor
};

/**
 * A mapping of HTML tag names to a friendly name and an icon URI.
 */
export const HTMltagInfo: {[K in HTMLtags] : {name: string, iconURI: string}} = {
    "A"         : {"name" : "Anchors", "iconURI" : "/src/assets/icons/link.svg"},
    "BODY"      : {"name" : "Document body", "iconURI" : "/src/assets/icons/browser.svg"},
    "BUTTON"    : {"name" : "Button", "iconURI" : "/src/assets/icons/play-circle.svg"},
    "CANVAS"    : {"name" : "Canvas", "iconURI" : "/src/assets/icons/canvas.svg"},
    "DIV"       : {"name" : "Division", "iconURI" : "/src/assets/icons/grid.svg"},
    "H1"        : {"name" : "Title", "iconURI" : "/src/assets/icons/heading.svg"},
    "H2"        : {"name" : "Subtitle", "iconURI" : "/src/assets/icons/heading.svg"},
    "H3"        : {"name" : "Heading", "iconURI" : "/src/assets/icons/heading.svg"},
    "H4"        : {"name" : "Heading 2", "iconURI" : "/src/assets/icons/heading.svg"},
    "H5"        : {"name" : "Heading 3", "iconURI" : "/src/assets/icons/heading.svg"},
    "H6"        : {"name" : "Caption", "iconURI" : "/src/assets/icons/heading.svg"},
    "HR"        : {"name" : "Horizontal line", "iconURI" : "/src/assets/icons/minus.svg"},
    "INPUT"     : {"name" : "Input", "iconURI" : "/src/assets/icons/globe.svg"},
    "LABEL"     : {"name" : "Label", "iconURI" : "/src/assets/icons/pricetags.svg"},
    "OL"        : {"name" : "Organized list", "iconURI" : "/src/assets/icons/list.svg"},
    "UL"        : {"name" : "Unorganized list", "iconURI" : "/src/assets/icons/menu.svg"},
    "PROGRESS"  : {"name" : "Progress", "iconURI" : "/src/assets/icons/clock.svg"},
    "P"         : {"name" : "Body", "iconURI" : "/src/assets/icons/paragraph.svg"},
    "SECTION"   : {"name" : "Section", "iconURI" : "/src/assets/icons/layout.svg"},
    "SPAN"      : {"name" : "Span", "iconURI" : "/src/assets/icons/flash.svg"},
    "TEXTAREA"  : {"name" : "Textarea", "iconURI" : "/src/assets/icons/edit-2.svg"},
}

/**
 * Attributes with a unit. Mostly used for width, height, and stuff of that sort.
 */
export interface unitedAttr<T>{
    v : T,
    u : units
}

export interface shadow{ // text shadow (Still need to be implemented fully. We're not taking full advantage of this structure yet.)
    radius : unitedAttr<number>,
    x : unitedAttr<number>,
    y : unitedAttr<number>,
    color : color
} export interface boxShadow extends shadow { // box shadow
    grow : unitedAttr<number>,
}

export interface typographyStyle{
    fontObj? : fontObject, // the font object that contains most of the information we need
    variation? : number, // basically the weight
    
    textDecorations? : textDecoration[],

    casing? : textCasing,
    alignment? : textAlignment,

    size? : unitedAttr<number>,
    tracking? :unitedAttr<number>,
    lineHeight? : unitedAttr<number>,
}

export interface color{
    type : colorNumericType,
    r? : number,
    g? : number,
    b? : number,
    h : number,
    s : number,
    l : number,
    a : number,
    hex : string,
}

// Google font api key: AIzaSyB0YyT0-3AgT2aF45O4HropOlNx1hghmaI
// Tester key:          AIzaSyDW3JQmec-yJykfP-FcRYpIujOc6jYa4RQ