import type { activeStylesType } from "$lib/stores/activeStyles";

const margin: activeStylesType = { marginTop: true, marginBottom: true, marginLeft: true, marginRight: true }
const padding: activeStylesType = { paddingTop: true, paddingBottom: true, paddingLeft: true, paddingRight: true }
const size: activeStylesType = { width: true, height: true }
const overflow: activeStylesType = { overflowX: true, overflowY: true, }
const contentAlignment: activeStylesType = { justifyContent: true, alignItems: true, }
const borderWidth: activeStylesType = { borderWidthTop: true, borderWidthRight: true, borderWidthBottom: true, borderWidthLeft: true }
const borderRadius: activeStylesType = { borderRadiusTop: true, borderRadiusRight: true, borderRadiusBottom: true, borderRadiusLeft: true }
const borderStyle: activeStylesType = { borderStyleTop: true, borderStyleRight: true, borderStyleBottom: true, borderStyleLeft: true } 
const outlineStyle: activeStylesType = { outlineWidth: true, outlineOffset: true, outlineColor: true, outlineStyle: true }

const allStyles: activeStylesType = {
    ...size,
    ...margin,
    ...padding,

    opacity: true,
    ...overflow,
    
    ...contentAlignment,

    USEBACKGROUND: true, backgroundColor: true,

    USEBORDER: true,
    ...borderWidth,
    ...borderRadius,
    borderColor: true,
    ...borderStyle,

    USEOUTLINE: true,
    ...outlineStyle,

    USETEXT: true,
    leadingContent: true, trailingContent: true, placeholder: true,
    color: true,
    typeStyle: true,

    USESHADOW: true,
    boxShadows: true,
}

const textSettings: activeStylesType = { // this has everything except outlines
    width: true, height: true,

    marginTop: true, marginBottom: true, marginLeft: true, marginRight: true,

    paddingTop: true, paddingBottom: true, paddingLeft: true, paddingRight: true,

    opacity: true,
    overflowX: true, overflowY: true,
    justifyContent: true, alignItems: true,

    USEBACKGROUND: true, backgroundColor: true,

    USEBORDER: true,
    borderWidthTop: true, borderWidthRight: true, borderWidthBottom: true, borderWidthLeft: true,
    borderRadiusTop: true, borderRadiusRight: true, borderRadiusBottom: true, borderRadiusLeft: true,
    borderColor: true,
    borderStyleTop: true, borderStyleRight: true, borderStyleBottom: true, borderStyleLeft: true,

    USETEXT: true,
    leadingContent: true, trailingContent: true,
    color: true,
    typeStyle: true,

    USESHADOW: true,
    boxShadows: true,
}

const enabledStyles: Record<HTMLtags, activeStylesType> =
{
    "DIV": {
        ...allStyles,
        placeholder: false,
    },
    SECTION: {
        ...allStyles,
        USETEXT: false,
    },
    SPAN: {
        ...allStyles,
        overflowX: false, overflowY: false,
    },
    CANVAS: {
        ...size,
        ...margin,
        ...padding,

        opacity: true,
        
        USEBORDER: true,
        ...borderWidth,
        ...borderRadius,
        borderColor: true,
        ...borderStyle,

        USEOUTLINE: true,
        ...outlineStyle,

        USESHADOW: true,
        boxShadows: true,
    },
    BODY: {},
    H1: {...allStyles, USEOUTLINE: false,},
    H2: {...allStyles, USEOUTLINE: false,},
    H3: {...allStyles, USEOUTLINE: false,},
    H4: {...allStyles, USEOUTLINE: false,},
    H5: {...allStyles, USEOUTLINE: false,},
    H6: {...allStyles, USEOUTLINE: false,},
    P: {...allStyles, USEOUTLINE: false,},
    A: allStyles,
    BUTTON: allStyles,
    INPUT: {
        ...allStyles,
        leadingContent: false, trailingContent: false,
        justifyContent: false, alignItems: false,
        overflowX: false, overflowY: false,
    },
    TEXTAREA: {
        ...allStyles,
        leadingContent: false, trailingContent: false,
        justifyContent: false, alignItems: false,
        overflowX: false, overflowY: false,
    },
    HR: {
        ...allStyles,
        overflowX: false, overflowY: false,
        justifyContent: false, alignItems: false,
        USEOUTLINE: false,
        USETEXT: false,
    },
    PROGRESS: {},
    UL: {},
    OL: {},
};

const getStyleSetting = (key: HTMLtags): activeStylesType => {
    return enabledStyles[key] ?? {};
}

export default getStyleSetting