declare global {
    type colorFmt = "hsl" | "hex" | "rgb"
    
    type PartialRecord<K extends keyof any, T> = Partial<Record<K, T>>
    
    /**
     * Represents the default configurations for a project, with options for stylesheets,
     * SCSS, and JSON files.
     */
    interface exportConfig extends PartialRecord<colorFmt, Record<string, any>> {
        common: {
            compressionAmt: number; // 0 is none, 1 is standard, 2 is aggressive
        }
        stylesheets: {
            colorFmt: colorFmt;
            colorUnitInference: boolean;
            fontIntegration: boolean;
            loadFullTypeface: boolean;
            fontLocalization: boolean;
        };
        scss: {
            nestStyles: boolean;
        };
    }
    
    /**
     * @summary An object structure that can be used in buffering to store an element / override's generated style strings temporarily.
     * 
     * @example let divBuffer: styleBufferObject = {style: ..., overrideStyles: [{override1: ..., override2: ...}]}
     */
    type styleBufferObject = {
        style: string,
        psuedoElmnts: Record<string, string>,
        overrideStyles?: Record<string, styleBufferObject>
    }
    
    type simpleExportBuffer = PartialRecord<HTMLtags, styleBufferObject>
    
    type exportableFileTypes = "css" | "scss" | "less" | "styl" | "svelte" | "json"
}

export {};