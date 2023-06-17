/**
 * This is a mapping of HTML tags to their default styles. Each key is an HTML tag, and its value 
 * is an object representing the default styles for that tag. The style object includes CSS properties
 * and their corresponding values.
 *
 * Please note that these are the default styles provided by browsers and may vary between different 
 * browsers. Not all possible default styles are included in this map.
 *
 * @type {Record<HTMLtags, elementStyle>}
 */
export const defaultCSSStyles: Record<HTMLtags | "COM", elementStyle> = {
    COM: {
        opacity: 100,
        marginTop: { v: 0, u: "px" },
        marginRight: { v: 0, u: "px" },
        marginBottom: { v: 0, u: "px" },
        marginLeft: { v: 0, u: "px" },
        paddingTop: { v: 0, u: "px" },
        paddingRight: { v: 0, u: "px" },
        paddingBottom: { v: 0, u: "px" },
        paddingLeft: { v: 0, u: "px" },
        overflowX: "auto",
        overflowY: "auto",

        borderStyleTop: "solid",
        borderStyleRight: "solid",
        borderStyleBottom: "solid",
        borderStyleLeft: "solid",

        borderWidthTop: { v: 0, u: "px" },
        borderWidthRight: { v: 0, u: "px" },
        borderWidthBottom: { v: 0, u: "px" },
        borderWidthLeft: { v: 0, u: "px" },

        borderRadiusTop: { v: 0, u: "px" },
        borderRadiusRight: { v: 0, u: "px" },
        borderRadiusBottom: { v: 0, u: "px" },
        borderRadiusLeft: { v: 0, u: "px" },

        outlineOffset: { v: 0, u: "px" },
    },

    // ==========
    
    A: {
        typeStyle: {
            textDecorations: ["underline"]
        }
    },
    BODY: {
        marginTop: { v: 8, u: "px" },
        marginRight: { v: 8, u: "px" },
        marginBottom: { v: 8, u: "px" },
        marginLeft: { v: 8, u: "px" },
    },
    BUTTON: {},
    CANVAS: {},
    DIV: {
        display: "block",
    },
    H1: {
        display: "block",
        typeStyle: {
            variation: 700,
            size: { v: 2, u: "em" }
        },
        marginTop: { v: 0.67, u: "em" },
        marginRight: { v: 0, u: "px" },
        marginBottom: { v: 0.67, u: "em" },
        marginLeft: { v: 0, u: "px" },
    },
    H2: {
        display: "block",
        typeStyle: {
            variation: 700,
            size: { v: 1.5, u: "em" },
        },
        marginTop: { v: 0.83, u: "em" },
        marginRight: { v: 0, u: "px" },
        marginBottom: { v: 0.83, u: "em" },
        marginLeft: { v: 0, u: "px" },
    },
    H3: {
        display: "block",
        typeStyle: {
            size: { v: 1.17, u: "em" },
            variation: 700
        },
        marginTop: { v: 1, u: "em" },
        marginRight: { v: 0, u: "px" },
        marginBottom: { v: 1, u: "em" },
        marginLeft: { v: 0, u: "px" },
    },
    H4: {
        display: "block",
        typeStyle: {
            size: { v: 1.17, u: "em" },
        },
        marginTop: { v: 1.33, u: "em" },
        marginRight: { v: 0, u: "px" },
        marginBottom: { v: 1.33, u: "em" },
        marginLeft: { v: 0, u: "px" },
    },
    H5: {
        display: "block",
        typeStyle: {
            size: { v: 0.83, u: "em" },
            variation: 700
        },
        marginTop: { v: 1.67, u: "em" },
        marginRight: { v: 0, u: "px" },
        marginBottom: { v: 1.67, u: "em" },
        marginLeft: { v: 0, u: "px" },
    },
    H6: {
        display: "block",
        typeStyle: {
            size: { v: 0.67, u: "em" },
            variation: 700
        },
        marginTop: { v: 2.33, u: "em" },
        marginRight: { v: 0, u: "px" },
        marginBottom: { v: 2.33, u: "em" },
        marginLeft: { v: 0, u: "px" },
    },
    HR: {
        display: "block",
        marginTop: { v: 0.5, u: "em" },
        marginBottom: { v: 0.5, u: "em" },

        borderStyleTop: "inset",
        borderStyleRight: "inset",
        borderStyleBottom: "inset",
        borderStyleLeft: "inset",

        borderWidthTop: { v: 1, u: "px" },
        borderWidthRight: { v: 1, u: "px" },
        borderWidthBottom: { v: 1, u: "px" },
        borderWidthLeft: { v: 1, u: "px" }
    },
    INPUT: {},
    LABEL: {},
    OL: {
        display: "block",
        marginTop: { v: 1, u: "em" },
        marginRight: { v: 0, u: "px" },
        marginBottom: { v: 1, u: "em" },
        marginLeft: { v: 0, u: "px" },
        paddingLeft: { v: 40, u: "px" }
    },
    P: {
        display: "block",
        marginTop: { v: 1, u: "em" },
        marginRight: { v: 0, u: "px" },
        marginBottom: { v: 1, u: "em" },
        marginLeft: { v: 0, u: "px" }
    },
    SECTION: {
        display: "block"
    },
    SPAN: {},
    UL: {
        display: "block",
        marginTop: { v: 1, u: "em" },
        marginRight: { v: 0, u: "px" },
        marginBottom: { v: 1, u: "em" },
        marginLeft: { v: 0, u: "px" },
        paddingLeft: { v: 40, u: "px" }
    },
    PROGRESS: {},
    TEXTAREA: {},
}