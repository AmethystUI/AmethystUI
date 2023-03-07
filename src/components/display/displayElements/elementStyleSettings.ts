import type { activeStylesType } from "../../../stores/activeStyles";
import type { HTMLtags } from "../../../types/general";

const enabledStyles: Record<HTMLtags, activeStylesType> =
{
    "DIV": {
        width: true,
        height: true,

        marginTop: true,
        marginBottom: true,
        marginLeft: true,
        marginRight: true,

        paddingTop: true,
        paddingBottom: true,
        paddingLeft: true,
        paddingRight: true,

        opacity: true,
        overflowX: true,
        overflowY: true,
        justifyContent: true,
        alignItems: true,

        USEBACKGROUND: true,
        backgroundColor: true,

        USEBORDER: true,
        borderWidthTop: true,
        borderWidthRight: true,
        borderWidthBottom: true,
        borderWidthLeft: true,
        borderRadiusTop: true,
        borderRadiusRight: true,
        borderRadiusBottom: true,
        borderRadiusLeft: true,
        borderColor: true,
        borderStyleTop: true,
        borderStyleRight: true,
        borderStyleBottom: true,
        borderStyleLeft: true,

        USEOUTLINE: true,
        outlineWidth: true,
        outlineOffset: true,
        outlineColor: true,
        outlineStyle: true,

        USETEXT: true,
        content: true,
        color: true,
        typeStyle: true,

        USESHADOW: true,
        boxShadows: true,
    },
    SECTION: {
        width : true,
        height : true,
        
        marginTop: true,
        marginBottom: true,
        marginLeft: true,
        marginRight: true,

        paddingTop: true,
        paddingBottom: true,
        paddingLeft: true,
        paddingRight: true,

        opacity: true,
        overflowX: true,
        overflowY: true,
        justifyContent: true,
        alignItems: true,

        USEBACKGROUND: true,
        backgroundColor: true,

        USEBORDER: true,
        borderWidthTop: true,
        borderWidthRight: true,
        borderWidthBottom: true,
        borderWidthLeft: true,
        borderRadiusTop: true,
        borderRadiusRight: true,
        borderRadiusBottom: true,
        borderRadiusLeft: true,
        borderColor: true,
        borderStyleTop: true,
        borderStyleRight: true,
        borderStyleBottom: true,
        borderStyleLeft: true,

        USEOUTLINE: true,
        outlineWidth: true,
        outlineOffset: true,
        outlineColor: true,
        outlineStyle: true,

        USESHADOW: true,
        boxShadows: true,
    },
    A: {
        width: true,
        height: true,

        marginTop: true,
        marginBottom: true,
        marginLeft: true,
        marginRight: true,

        paddingTop: true,
        paddingBottom: true,
        paddingLeft: true,
        paddingRight: true,

        opacity: true,
        justifyContent: true,
        alignItems: true,

        USEBACKGROUND: true,
        backgroundColor: true,

        USEBORDER: true,
        borderWidthTop: true,
        borderWidthRight: true,
        borderWidthBottom: true,
        borderWidthLeft: true,
        borderRadiusTop: true,
        borderRadiusRight: true,
        borderRadiusBottom: true,
        borderRadiusLeft: true,
        borderColor: true,
        borderStyleTop: true,
        borderStyleRight: true,
        borderStyleBottom: true,
        borderStyleLeft: true,

        USEOUTLINE: true,
        outlineWidth: true,
        outlineOffset: true,

        USETEXT : true,
        content: true,
        placeholder: true,
        color: true,
        typeStyle: true,

        USESHADOW: true,
        boxShadows: true,
    },
    BODY: {},
    BUTTON: {},
    CANVAS: {},
    H1: {},
    H2: {},
    H3: {},
    H4: {},
    H5: {},
    H6: {},
    HR: {},
    INPUT: {},
    LABEL: {},
    OL: {},
    UL: {},
    PROGRESS: {},
    P: {},
    SPAN: {},
    TEXTAREA: {}
};

const getStyleSetting = (key: HTMLtags): activeStylesType => {
    return enabledStyles[key] ?? {};
}

export default getStyleSetting