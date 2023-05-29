const getStringFor = {
    
    unitedAttr : (val: unitedAttr<number>) => {
        if(val.u === "fit-content") return "fit-content";
        return `${val.v}${val.u}`;
    },

    color : (value: color, compression = 1 as 0 | 1 | 2, colorFmt = "hsl" as colorFmt, preferInference = false): string => { 
        const inferUnits = preferInference || compression === 2;
        let colorStr = "";

        if(colorFmt === "hex"){ // hex format
            colorStr = `#${value.hex}`;
        } else if(colorFmt === "hsl"){ // hsl / hsla format
            const useAlpha = value.a !== 100;
    
            const alpha = `${value.a / (inferUnits ? 100 : 1)}${inferUnits ? "" : "%"}`;
            const sat = `${value.s / (inferUnits ? 100 : 1)}${inferUnits ? "" : "%"}`;
            const lum = `${value.l / (inferUnits ? 100 : 1)}${inferUnits ? "" : "%"}`;
            const hue = `${value.h}deg`;
    
            // if we're not using an alpha value or we're on the aggressive compression mode, we want to infer the units as much as we can
            colorStr = `${useAlpha ? "hsla" : "hsl"}(${hue}, ${sat}, ${lum}`; // the base string
            if(useAlpha) colorStr += `, ${alpha}`; // add alpha value if needed
            colorStr += `)`; // closing parenthesis
        } else if(colorFmt === "rgb"){ // rgb format
            const useAlpha = value.a !== 100;
    
            const alpha = `${value.a / (inferUnits ? 100 : 1)}${inferUnits ? "" : "%"}`;
            
            colorStr = `${useAlpha ? "rgba" : "rgb"}(${value.r}, ${value.g}, ${value.b}`; // the base string
            if(useAlpha) colorStr += `, ${alpha}`; // add alpha value if needed
            colorStr += `)`; // closing parenthesis
        }
    
        return colorStr;
    }
}

export default getStringFor