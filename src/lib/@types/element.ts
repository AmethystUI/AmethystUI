import * as t from 'io-ts'
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
])

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
export const _boxShadow = t.intersection([ // doc told me to use intersection here
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
        fileURLs: t.array(_variationURL), // the URLs asssociated with each fileURL. We'lll use these URLs to access the TTF binaries 
        localURLs: t.array(_variationURL),
    })
]);
export const _typographyStyle = t.partial({
    fontObj: _fontObject, // the font object that contains most of the information we need
    variation: t.number, // basically the weight

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
    USEBACKGROUND : t.boolean, // done
    backgroundColor : _color, // done
    opacity : t.number, // done
    overflowX : _overflow, // done
    overflowY : _overflow, // done
    
    USESHADOW : t.boolean, // done
    boxShadows : t.array(_boxShadow), // done
    MuxBoxShadClr : _color, // done

    USEBORDER : t.boolean,
    borderWidthTop : _unitedAttr, // done
    borderWidthRight : _unitedAttr, // done
    borderWidthBottom : _unitedAttr, // done
    borderWidthLeft : _unitedAttr, // done
    borderColor : _color, // done
    borderStyleTop : _borderOutlineStyle, // done
    borderStyleRight : _borderOutlineStyle, // done
    borderStyleBottom : _borderOutlineStyle, // done
    borderStyleLeft : _borderOutlineStyle, // done
    borderRadiusTop : _unitedAttr, // done
    borderRadiusRight : _unitedAttr, // done
    borderRadiusBottom : _unitedAttr, // done
    borderRadiusLeft : _unitedAttr, // done

    marginTop : _unitedAttr, // done
    marginRight : _unitedAttr, // done
    marginBottom : _unitedAttr, // done
    marginLeft : _unitedAttr, // done

    paddingTop : _unitedAttr, // done
    paddingRight : _unitedAttr, // done
    paddingBottom : _unitedAttr, // done
    paddingLeft : _unitedAttr, // done
    
    height : _unitedAttr, // done
    width : _unitedAttr, // done
    
    // outline radius is controlled by border radius. That's why it doesn't exist here
    // outline also only accept one type of style
    USEOUTLINE : t.boolean, // done
    outlineWidth : _unitedAttr, // done
    outlineColor : _color, // done
    outlineStyle : _borderOutlineStyle, // done
    outlineOffset : _unitedAttr, // done

    USETEXT : t.boolean, // done
    leadingContent : t.string, // done
    trailingContent : t.string, // done
    placeholder : t.string, // done
    typeStyle : _typographyStyle, // we have to condense all of these stuff into a single attribute because we have an overlay controlling it. And that requires a single, condensed attr.
    color : _color, // done

    display: _displayTypes,

    // FLEX ONLY (implement in public preview 2.0)
    justifyContent: _flexAlignment, // done, kinda
    alignItems: _flexAlignment, // done, kinda
    flexDirection: _flexDirection, // 2.0

    // translateX? : unitedAttr<number>,
    // translateY? : unitedAttr<number>,
    // scaleX? : number,
    // scaleY? : number,  
});


// Global usable types
declare global {
    type units = t.TypeOf<typeof _units>;
    type borderOutlineStyle = t.TypeOf<typeof _borderOutlineStyle>;
    type displayTypes = t.TypeOf<typeof _displayTypes>;
    type textAlignment = t.TypeOf<typeof _textAlignment>;
    type flexAlignment = t.TypeOf<typeof _flexAlignment>;
    type flexDirection = t.TypeOf<typeof _flexDirection>;
    type textTransform = t.TypeOf<typeof _textTransform>;
    type overflow = t.TypeOf<typeof _overflow>;
    type colorNumericType = t.TypeOf<typeof _colorNumericType>;
    type textCasing = t.TypeOf<typeof _textCasing>;
    type textDecoration = t.TypeOf<typeof _textDecoration>;
    type typeCategories = t.TypeOf<typeof _typeCategories>;
    type colorType = t.TypeOf<typeof _colorType>;
    type unitedAttr = t.TypeOf<typeof _unitedAttr>;
    type shadow = t.TypeOf<typeof _shadow>;
    type boxShadow = t.TypeOf<typeof _boxShadow>;
    type fontObject = t.TypeOf<typeof _fontObject>;
    type typographyStyle = t.TypeOf<typeof _typographyStyle>;
    type color = t.TypeOf<typeof _color>;
    type variationURL = t.TypeOf<typeof _variationURL>;


    type elementStyle = t.TypeOf<typeof _elementStyle>;
    
    type strictElementStyle = Required<elementStyle>
    
    // All the styles possible
    type elementStyleKeys = keyof elementStyle
}

export {};