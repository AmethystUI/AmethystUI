import type { activeStylesType } from "../../../stores/activeStyles";
import type { HTMLtags } from "../../../types/general";

const enabledStyles: Partial<Record<HTMLtags, activeStylesType>> =
{
    "DIV" : {
        width : true,
        height : true,
        
        marginTop : true,
        marginBottom : true,
        marginLeft : true,
        marginRight : true,
        
        paddingTop : true,
        paddingBottom : true,
        paddingLeft : true,
        paddingRight : true,

        opacity : true,
        overflowX : true,
        overflowY : true,
        justifyContent : true,
        alignItems : true,
        
        USEBACKGROUND : true,
        backgroundColor : true,

        USEBORDER : true,
        borderWidthTop : true,
        borderWidthRight : true,
        borderWidthBottom : true,
        borderWidthLeft : true,
        borderRadiusTop : true,
        borderRadiusRight : true,
        borderRadiusBottom : true,
        borderRadiusLeft : true,
        borderColor : true,
        borderStyleTop : true,
        borderStyleRight : true,
        borderStyleBottom : true,
        borderStyleLeft : true,

        USEOUTLINE : true,
        outlineWidth : true,
        outlineOffset : true,
        outlineColor : true,
        outlineStyle : true,

        USETEXT : true,
        content : true,
        placeholder : true,
        color : true,
        typeStyle : true,

        USESHADOW : true,
        boxShadows : true,
    }
};

const getStyleSetting = (key: HTMLtags): activeStylesType => {
    return enabledStyles[key] ?? {};
}

export default getStyleSetting