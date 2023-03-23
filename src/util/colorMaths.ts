import type { color } from "../types/general";

export type colorType = "HEX" | "RGB" | "HSL";

/**
 * Converts an RGB color value to HSL. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
 * Assumes r, g, and b are contained in the set [0, 255] and
 * returns h, s, and l in the set [0, 1].
 */
export const rgbToHsl = (r:number, g:number, b:number):number[] => {
    r /= 255, g /= 255, b /= 255;
    let max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if(max == min){
        h = s = 0; // achromatic
    }else{
        let d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch(max){
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    // return calculated HSL value
    return [Math.min(Math.floor(h*360),360), Math.min(Math.floor(s*100),100), Math.min(Math.floor(l*100),100)];
}

/**
 * Converts an HSL color value to RGB. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
 * Assumes h, s, and l are contained in the set [0, 1] and
 * returns r, g, and b in the set [0, 255].
 */
export const hslToRgb = (h:number, s:number, l:number):number[] => {
    // normalize hsl
    h /= 360, s /= 100, l /= 100;

    let r, g, b;

    if(s == 0){
        r = g = b = l; // achromatic
    }else{
        let hue2rgb = function hue2rgb(p, q, t){
            if(t < 0) t += 1;
            if(t > 1) t -= 1;
            if(t < 1/6) return p + (q - p) * 6 * t;
            if(t < 1/2) return q;
            if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        }

        let q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        let p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }

    return [Math.min(Math.floor(r*256),255), Math.min(Math.floor(g*256),255), Math.min(Math.floor(b*256),255)];
}

export const rgbaToHex = (r:number, g:number, b:number, a:number):string => {
    const colorToHex = (color:number) => {
        let hexadecimal = color.toString(16);
        return hexadecimal.length == 1 ? "0" + hexadecimal : hexadecimal;
    }
    a *= 255/100
    return colorToHex(r) + colorToHex(g) + colorToHex(b) + (Math.round(a) === 255 ? "" : colorToHex(Math.round(a))); // always return an 8 form hex
}

export const hexToRgba = (hex:string):number[] => {
    // detect hex type
    if(hex.length === 3){ // 3 form hex: 1 letter per color channel and no alpha channel
        return [parseInt(hex[0], 16)/15*255, parseInt(hex[1], 16)/15*255, parseInt(hex[2], 16)/15*255, 100];
    } else if(hex.length === 4){ // 4 form hex: 1 letter per channel
        return [parseInt(hex[0], 16)/15*255, parseInt(hex[1], 16)/15*255, parseInt(hex[2], 16)/15*255, parseInt(hex[3], 16)/15*100];
    } else if (hex.length == 6){ // 6 form hex: 2 letters per color channel and no alpha channel
        return [parseInt(hex.substring(0,2), 16), parseInt(hex.substring(2,4), 16), parseInt(hex.substring(4,6), 16), 100];
    } else if (hex.length == 8){ // 8 form hex: 2 letter per channel
        return [parseInt(hex.substring(0,2), 16), parseInt(hex.substring(2,4), 16), parseInt(hex.substring(4,6), 16), Math.round(parseInt(hex.substring(6,8), 16) * (100/255))];
    }
}

export const initializeColorFromHSLA = (h:number, s:number, l:number, a:number): color => {
    return {
        type: "hsl",
        r: hslToRgb(h, s, l)[0],
        g: hslToRgb(h, s, l)[1],
        b: hslToRgb(h, s, l)[2],
        h: h,
        s: s,
        l: l,
        a: a,
        hex: rgbaToHex(hslToRgb(h, s, l)[0], hslToRgb(h, s, l)[1], hslToRgb(h, s, l)[2], a)
    }
}

export const initializeColorFromRGBA = (r:number, g:number, b:number, a:number): color => {
    return {
        type: "rgb",
        r: r,
        g: g,
        b: b,
        h: rgbToHsl(r, g, b)[0],
        s: rgbToHsl(r, g, b)[1],
        l: rgbToHsl(r, g, b)[2],
        a: a,
        hex: rgbaToHex(r, g, b, a)
    }
}

export const hsl2hsv = (h,s,l,v=s*Math.min(l,1-l)+l) => [h, v?2-2*l/v:0, v];
export const hsv2hsl = (h,s,v,l=v-v*s/2, m=Math.min(l,1-l)) => [h,m?(v-l)/m:0,l];