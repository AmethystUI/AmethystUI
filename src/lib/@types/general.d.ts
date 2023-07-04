type Enumerate<N extends number, Acc extends number[] = []> = Acc["length"] extends N
    ? Acc[number]
    : Enumerate<N, [...Acc, Acc["length"]]>

type IntRange<F extends number, T extends number> = Exclude<Enumerate<T>, Enumerate<F>>

type HTMLtags = "A" | "BODY" | "BUTTON" | "CANVAS" | "DIV" | "H1" | "H2" | "H3" | "H4" | "H5" | "H6" | "HR" | "INPUT" | "LABEL" | "OL" | "UL" | "PROGRESS" | "P" | "SECTION" | "SPAN" | "TEXTAREA";
type units = "px" | "pt" | "pc" | "em" | "rem" | "vw" | "vh" | "%" | "fit-content";
type borderOutlineStyle = "dotted" | "dashed" | "solid" | "double" | "groove" | "ridge" | "inset" | "outset" | "hidden";
type displayTypes = "flex" | "block" | "inline" | "none";
type textAlignment = "center" | "left" | "right" | "justify";
type flexAlignment = "flex-start" | "flex-end" | "center" | "space-between" | "space-around" | "space-evenly" | "none";
type flexDirection = "row" | "column" | "row-reverse" | "column-reverse";
type textTransform = "uppercase" | "lowercase" | "capitalize";
type overflow = "visible" | "hidden" | "scroll" | "auto";
type colorNumericType = "rgb" | "hsl";
type textCasing = "lowercase" | "none" | "uppercase";
type textDecoration = "italicize" | "underline" | "strike";
type typeCategories = "sans-serif" | "serif" | "display" | "handwriting" | "monospace";
type colorType = "HEX" | "RGB" | "HSL";

interface override { // overrides for the element
    name: string,
    style: elementStyle
};

interface element { // a single HTML element
    type: HTMLtags, // html element types
    showing: boolean, // show overrides
    style: elementStyle, // main style
    styleOverrides: override[], // self explanatory
    showOutline: boolean // show the dashed outline on the editor
};

interface project { // a project object that can be exported
    name: string,
    exportDate: number,
    content: element[]
}

/**
 * Attributes with a unit. Mostly used for width, height, and stuff of that sort.
 */
interface unitedAttr<T> {
    v: T,
    u: units
}

interface shadow { // text shadow (Still need to be implemented fully. We're not taking full advantage of this structure yet.)
    radius: unitedAttr<number>,
    x: unitedAttr<number>,
    y: unitedAttr<number>,
    color: color
}
interface boxShadow extends shadow { // box shadow
    grow: unitedAttr<number>,
}


/**
 * Map every variation in a font to a URL
 */
interface variationURL{
    variation: number,
    url: string
}
/**
 * Represents a single, reduced typeface object returned by the Google Fonts API.
 * 
 * @note THIS DOES NOT DEFINE THE RAW OBJECT RECIEVED FROM GOOGLE FONTS
 * 
 * @property {string} family - The family name of the font.
 * @property {string} version - The version of the font.
 * @property {string} lastModified - The date when the font was last modified.
 * @property {string[]} files - An array of file paths to the font files. The keys also shows what weights this font supports.
 * @property {string} category - The category of the font.
 */
interface fontObject {
    family: string,
    appearedName?: string,
    version?: string,
    lastModified?: string,
    fileURLs?: variationURL[], // the URLs asssociated with each fileURL. We'lll use these URLs to access the TTF binaries and convert them to base64
    localURLs?: variationURL[],
    variations: number[],
    category: typeCategories,
    webSafe: boolean,
}

interface typographyStyle {
    fontObj?: fontObject, // the font object that contains most of the information we need
    variation?: number, // basically the weight

    textDecorations?: textDecoration[],

    casing?: textCasing,
    alignment?: textAlignment,

    size?: unitedAttr<number>,
    tracking?: unitedAttr<number>,
    lineHeight?: unitedAttr<number>,
}

interface color {
    type: colorNumericType,
    r?: number,
    g?: number,
    b?: number,
    h: number,
    s: number,
    l: number,
    a: number,
    hex: string,
}

// Google font api key: AIzaSyB0YyT0-3AgT2aF45O4HropOlNx1hghmaI
// Tester key:          AIzaSyDW3JQmec-yJykfP-FcRYpIujOc6jYa4RQ

// globalScope

declare let IntRange: IntRange;

declare let HTMLtags: HTMLtags;
declare let units : units;
declare let borderOutlineStyle : borderOutlineStyle;
declare let displayTypes : displayTypes;
declare let textAlignment : textAlignment;
declare let flexAlignment : flexAlignment;
declare let flexDirection : flexDirection;
declare let textTransform : textTransform;
declare let colorType : colorType;
declare let overflow : overflow;
declare let colorNumericType : colorNumericType;
declare let textCasing : textCasing;
declare let textDecoration : textDecoration;
declare let typeCategories : typeCategories;

declare let override : override;
declare let element : element;
declare let project : project;
declare let unitedAttr : unitedAttr;
declare let shadow : shadow;
declare let boxShadow : boxShadow;
declare let variationURL : variationURL;
declare let fontObject : fontObject;
declare let typographyStyle : typographyStyle;
declare let color : color;