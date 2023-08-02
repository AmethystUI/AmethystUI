/**
 * A mapping of HTML tag names to a friendly name and an icon URI.
 */

export const HTMltagInfo: {[K in HTMLtags] : {name: string, iconURI: string}} = {
    "A"         : {"name" : "Anchors", "iconURI" : "$assets/icons/link.svg"},
    "BODY"      : {"name" : "Document body", "iconURI" : "$assets/icons/browser.svg"},
    "BUTTON"    : {"name" : "Button", "iconURI" : "$assets/icons/play-circle.svg"},
    "CANVAS"    : {"name" : "Canvas", "iconURI" : "$assets/icons/canvas.svg"},
    "DIV"       : {"name" : "Division", "iconURI" : "$assets/icons/grid.svg"},
    "H1"        : {"name" : "Title", "iconURI" : "$assets/icons/heading.svg"},
    "H2"        : {"name" : "Subtitle", "iconURI" : "$assets/icons/heading.svg"},
    "H3"        : {"name" : "Heading", "iconURI" : "$assets/icons/heading.svg"},
    "H4"        : {"name" : "Heading 2", "iconURI" : "$assets/icons/heading.svg"},
    "H5"        : {"name" : "Heading 3", "iconURI" : "$assets/icons/heading.svg"},
    "H6"        : {"name" : "Caption", "iconURI" : "$assets/icons/heading.svg"},
    "HR"        : {"name" : "Horizontal line", "iconURI" : "$assets/icons/minus.svg"},
    "INPUT"     : {"name" : "Input", "iconURI" : "$assets/icons/globe.svg"},
    // "LABEL"     : {"name" : "Label", "iconURI" : "$assets/icons/pricetags.svg"},
    "OL"        : {"name" : "Organized list", "iconURI" : "$assets/icons/list.svg"},
    "UL"        : {"name" : "Unorganized list", "iconURI" : "$assets/icons/menu.svg"},
    "PROGRESS"  : {"name" : "Progress", "iconURI" : "$assets/icons/clock.svg"},
    "P"         : {"name" : "Body", "iconURI" : "$assets/icons/paragraph.svg"},
    "SECTION"   : {"name" : "Section", "iconURI" : "$assets/icons/layout.svg"},
    "SPAN"      : {"name" : "Span", "iconURI" : "$assets/icons/flash.svg"},
    "TEXTAREA"  : {"name" : "Textarea", "iconURI" : "$assets/icons/edit-2.svg"},
}