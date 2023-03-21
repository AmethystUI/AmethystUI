import type { activeStylesType } from "../../../stores/activeStyles";
import type { HTMLtags } from "../../../types/general";

const textSettings = { // this has everything except outlines
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
        leadingContent: true, trailingContent: true,
        color: true,
        typeStyle: true,

        USESHADOW: true,
        boxShadows: true,
    },
    SECTION: {
        width : true, height : true,
        
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

        USESHADOW: true,
        boxShadows: true,
    },
    SPAN: {
        width: true, height: true,

        marginTop: true, marginBottom: true, marginLeft: true, marginRight: true,

        paddingTop: true, paddingBottom: true, paddingLeft: true, paddingRight: true,

        opacity: true,

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
        leadingContent: true, trailingContent: true,
        color: true,
        typeStyle: true,

        USESHADOW: true,
        boxShadows: true,
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
    H1: textSettings,
    H2: textSettings,
    H3: textSettings,
    H4: textSettings,
    H5: textSettings,
    H6: textSettings,
    P: textSettings,
    A: {
        ...textSettings,
        
        USEOUTLINE: true,
        outlineWidth: true,
        outlineOffset: true,
        outlineColor: true,
        outlineStyle: true,
    },
    HR: {},
    BUTTON: {},
    INPUT: {},
    LABEL: {},
    OL: {},
    UL: {},
    PROGRESS: {},
    TEXTAREA: {}
};

const getStyleSetting = (key: HTMLtags): activeStylesType => {
    return enabledStyles[key] ?? {};
}

export default getStyleSetting