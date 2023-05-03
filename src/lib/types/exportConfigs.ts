export type colorFmt = "hsl" | "hex" | "rgb"

/**
 * Represents the default configurations for a project, with options for stylesheets,
 * SCSS, and JSON files.
 */
export default interface exportConfigInterface {
    stylesheets: {
        colorFmt: colorFmt;
        colorUnitInference: boolean;
        fontIntegration: boolean;
        fontLocalization: boolean;
        compressionAmt: number; // 0 is none, 1 is standard, 2 is aggressive
    };
    scss: {
        nestStyles: boolean;
    };
    json: {
        compress: boolean;
    };
}