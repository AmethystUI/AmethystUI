import type { color, overflow, boxShadow, unitedAttr, borderOutlineStyle, typographyStyle, displayTypes, flexAlignment, flexDirection } from "./general";

// all caps attributes are used as compilation tags
export interface elementStyle{
    USEBACKGROUND? : boolean; // done
    backgroundColor? : color, // done
    opacity? : number, // done
    overflowX? : overflow, // done
    overflowY? : overflow, // done
    
    USESHADOW? : boolean, // done
    boxShadows? : boxShadow[], // done
    muxBoxShadClr? : color, // done

    USEBORDER? : boolean,
    borderWidthTop? : unitedAttr<number>, // done
    borderWidthRight? : unitedAttr<number>, // done
    borderWidthBottom? : unitedAttr<number>, // done
    borderWidthLeft? : unitedAttr<number>, // done
    borderColor? : color, // done
    borderStyleTop? : borderOutlineStyle, // done
    borderStyleRight? : borderOutlineStyle, // done
    borderStyleBottom? : borderOutlineStyle, // done
    borderStyleLeft? : borderOutlineStyle, // done
    borderRadiusTop? : unitedAttr<number>, // done
    borderRadiusRight? : unitedAttr<number>, // done
    borderRadiusBottom? : unitedAttr<number>, // done
    borderRadiusLeft? : unitedAttr<number>, // done

    marginTop? : unitedAttr<number>, // done
    marginRight? : unitedAttr<number>, // done
    marginBottom? : unitedAttr<number>, // done
    marginLeft? : unitedAttr<number>, // done

    paddingTop? : unitedAttr<number>, // done
    paddingRight? : unitedAttr<number>, // done
    paddingBottom? : unitedAttr<number>, // done
    paddingLeft? : unitedAttr<number>, // done
    
    height? : unitedAttr<number>, // done
    width? : unitedAttr<number>, // done
    
    // outline radius is controlled by border radius. That's why it doesn't exist here
    // outline also only accept one type of style
    USEOUTLINE? : boolean, // done
    outlineWidth? : unitedAttr<number>, // done
    outlineColor? : color, // done
    outlineStyle? : borderOutlineStyle, // done
    outlineOffset? : unitedAttr<number>, // done

    USETEXT? : boolean, // done
    leadingContent? : string, // done
    trailingContent? : string, // done
    placeholder? : string, // done
    typeStyle? : typographyStyle, // we have to condense all of these stuff into a single attribute because we have an overlay controlling it. And that requires a single, condensed attr.
    color? : color, // done

    display?: displayTypes,

    // FLEX ONLY (implement in public preview 2.0)
    justifyContent?: flexAlignment, // done, kinda
    alignItems?: flexAlignment, // done, kinda
    flexDirection?: flexDirection, // 2.0

    // translateX? : unitedAttr<number>,
    // translateY? : unitedAttr<number>,
    // scaleX? : number,
    // scaleY? : number,  
};

// All the styles possible
export type elementStyleType = keyof elementStyle;