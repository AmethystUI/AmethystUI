export type colorFmt = "hsl" | "hex" | "rgb"

type PartialRecord<K extends keyof any, T> = Partial<Record<K, T>>;

/**
 * Represents the default configurations for a project, with options for stylesheets,
 * SCSS, and JSON files.
 */
export default interface exportConfigInterface extends PartialRecord<colorFmt, Record<string, any>> {
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