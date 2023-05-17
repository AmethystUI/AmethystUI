type colorFmt = "hsl" | "hex" | "rgb"

type PartialRecord<K extends keyof any, T> = Partial<Record<K, T>>;

/**
 * Represents the default configurations for a project, with options for stylesheets,
 * SCSS, and JSON files.
 */
interface exportConfigInterface extends PartialRecord<colorFmt, Record<string, any>> {
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
    overrideStyles: Record<string, string>
}

interface simpleExportBuffer extends PartialRecord<HTMLtags, styleBufferObject> {
    [] : {
        style: string,
        overrideStyles: {
            name: string;
            style: string;
        }
    }
}

type exportableFileTypes = "css" | "scss" | "less" | "styl" | "svelte" | "json";

// globalScope

declare let colorFmt : colorFmt;
declare let PartialRecord : PartialRecord;
declare let exportConfigInterface : exportConfigInterface;
declare let exportableFileTypes : exportableFileTypes;
declare let simpleExportBuffer : simpleExportBuffer;