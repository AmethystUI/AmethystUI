import type { activeStylesType } from "../../../stores/activeStyles";
import type { HTMLtags } from "../../../types/general";

const allStyles: activeStylesType = {
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

    USEOUTLINE: true,
    outlineWidth: true,
    outlineOffset: true,
    outlineColor: true,
    outlineStyle: true,

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
        width: true, height: true,
        marginLeft: true, marginRight: true, marginTop: true, marginBottom: true,
        paddingLeft: true, paddingRight: true, paddingTop: true, paddingBottom: true,

        opacity: true,
        
        USEBORDER: true,
        borderWidthTop: true, borderWidthRight: true, borderWidthBottom: true, borderWidthLeft: true,
        borderRadiusTop: true, borderRadiusRight: true, borderRadiusBottom: true, borderRadiusLeft: true,
        borderColor: true,
        borderStyleTop: true, borderStyleRight: true, borderStyleBottom: true, borderStyleLeft: true,

        USEOUTLINE: true,
        outlineWidth: true,
        outlineOffset: true,
        outlineColor: true,
        outlineStyle: true,

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
    TEXTAREA: {},
    HR: {},
    PROGRESS: {},
    LABEL: {},
    UL: {},
    OL: {},
};

const getStyleSetting = (key: HTMLtags): activeStylesType => {
    return enabledStyles[key] ?? {};
}

export default getStyleSetting