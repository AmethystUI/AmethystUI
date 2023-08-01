import * as t from 'io-ts';
// IOTS Codecs
export const _units = t.union([
    t.literal("px"),
    t.literal("pt"),
    t.literal("pc"),
    t.literal("em"),
    t.literal("rem"),
    t.literal("vw"),
    t.literal("vh"),
    t.literal("%"),
    t.literal("fit-content"),
]);
export const _borderOutlineStyle = t.union([
    t.literal("dotted"),
    t.literal("dashed"),
    t.literal("solid"),
    t.literal("double"),
    t.literal("groove"),
    t.literal("ridge"),
    t.literal("inset"),
    t.literal("outset"),
    t.literal("hidden"),
]);
export const _displayTypes = t.union([
    t.literal("flex"),
    t.literal("block"),
    t.literal("inline"),
    t.literal("none"),
]);
export const _textAlignment = t.union([
    t.literal("center"),
    t.literal("left"),
    t.literal("right"),
    t.literal("justify"),
]);
export const _flexAlignment = t.union([
    t.literal("flex-start"),
    t.literal("flex-end"),
    t.literal("center"),
    t.literal("space-between"),
    t.literal("space-around"),
    t.literal("space-evenly"),
    t.literal("none"),
]);
export const _flexDirection = t.union([
    t.literal("row"),
    t.literal("column"),
    t.literal("row-reverse"),
    t.literal("column-reverse"),
]);
export const _textTransform = t.union([
    t.literal("uppercase"),
    t.literal("lowercase"),
    t.literal("capitalize"),
]);
export const _overflow = t.union([
    t.literal("visible"),
    t.literal("hidden"),
    t.literal("scroll"),
    t.literal("auto"),
]);
export const _colorNumericType = t.union([
    t.literal("rgb"),
    t.literal("hsl"),
]);
export const _textCasing = t.union([
    t.literal("lowercase"),
    t.literal("none"),
    t.literal("uppercase"),
]);
export const _textDecoration = t.union([
    t.literal("italicize"),
    t.literal("underline"),
    t.literal("strike"),
]);
export const _typeCategories = t.union([
    t.literal("sans-serif"),
    t.literal("serif"),
    t.literal("display"),
    t.literal("handwriting"),
    t.literal("monospace"),
]);
export const _colorType = t.union([
    t.literal("HEX"),
    t.literal("RGB"),
    t.literal("HSL"),
]);
export const _color = t.intersection([
    t.type({
        type: _colorNumericType,
        h: t.number,
        s: t.number,
        l: t.number,
        a: t.number,
        hex: t.string,
    }),
    t.partial({
        r: t.number,
        g: t.number,
        b: t.number,
    })
]);
/**
 * Attributes with a unit. Mostly used for width, height, and stuff of that sort.
 */
export const _unitedAttr = t.type({
    v: t.number,
    u: _units
});
// text shadow (Still need to be implemented fully. We're not taking full advantage of this structure yet.)
export const _shadow = t.type({
    radius: _unitedAttr,
    x: _unitedAttr,
    y: _unitedAttr,
    color: _color // ignore this error
});
export const _boxShadow = t.intersection([
    _shadow,
    t.type({
        grow: _unitedAttr
    })
]);
/**
 * Map every variation in a font to a URL
 */
export const _variationURL = t.type({
    variation: t.number,
    url: t.string
});
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
export const _fontObject = t.intersection([
    t.type({
        family: t.string,
        variations: t.array(t.number),
        category: _typeCategories,
        webSafe: t.boolean,
    }),
    t.partial({
        appearedName: t.string,
        version: t.string,
        lastModified: t.string,
        fileURLs: t.array(_variationURL),
        localURLs: t.array(_variationURL),
    })
]);
export const _typographyStyle = t.partial({
    fontObj: _fontObject,
    variation: t.number,
    textDecorations: t.array(_textDecoration),
    casing: _textCasing,
    alignment: _textAlignment,
    size: _unitedAttr,
    tracking: _unitedAttr,
    lineHeight: _unitedAttr,
});
/**
 * An object representing the style properties of an HTML element.
 *
 * @property All Caps - Compilation tags and non-style related properties.
 * @property First Letter Cap - Properties used in the backend as an aid to style elements. Does not directly affect the stylesheet.
 * @property Normal Camel Case - Properties that will directly affect the styling of the element.
 */
export const _elementStyle = t.partial({
    USEBACKGROUND: t.boolean,
    backgroundColor: _color,
    opacity: t.number,
    overflowX: _overflow,
    overflowY: _overflow,
    USESHADOW: t.boolean,
    boxShadows: t.array(_boxShadow),
    MuxBoxShadClr: _color,
    USEBORDER: t.boolean,
    borderWidthTop: _unitedAttr,
    borderWidthRight: _unitedAttr,
    borderWidthBottom: _unitedAttr,
    borderWidthLeft: _unitedAttr,
    borderColor: _color,
    borderStyleTop: _borderOutlineStyle,
    borderStyleRight: _borderOutlineStyle,
    borderStyleBottom: _borderOutlineStyle,
    borderStyleLeft: _borderOutlineStyle,
    borderRadiusTop: _unitedAttr,
    borderRadiusRight: _unitedAttr,
    borderRadiusBottom: _unitedAttr,
    borderRadiusLeft: _unitedAttr,
    marginTop: _unitedAttr,
    marginRight: _unitedAttr,
    marginBottom: _unitedAttr,
    marginLeft: _unitedAttr,
    paddingTop: _unitedAttr,
    paddingRight: _unitedAttr,
    paddingBottom: _unitedAttr,
    paddingLeft: _unitedAttr,
    height: _unitedAttr,
    width: _unitedAttr,
    // outline radius is controlled by border radius. That's why it doesn't exist here
    // outline also only accept one type of style
    USEOUTLINE: t.boolean,
    outlineWidth: _unitedAttr,
    outlineColor: _color,
    outlineStyle: _borderOutlineStyle,
    outlineOffset: _unitedAttr,
    USETEXT: t.boolean,
    leadingContent: t.string,
    trailingContent: t.string,
    placeholder: t.string,
    typeStyle: _typographyStyle,
    color: _color,
    display: _displayTypes,
    // FLEX ONLY (implement in public preview 2.0)
    justifyContent: _flexAlignment,
    alignItems: _flexAlignment,
    flexDirection: _flexDirection, // 2.0
    // translateX? : unitedAttr<number>,
    // translateY? : unitedAttr<number>,
    // scaleX? : number,
    // scaleY? : number,  
});
export {};
//# sourceMappingURL=element.js.map