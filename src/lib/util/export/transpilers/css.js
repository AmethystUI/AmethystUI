import { collection } from "$src/lib/stores/collection";
import { get } from "svelte/store";
import { encodeAddr, toHex8, toHex } from "./utils/css.util";
import { generateCSSTemplate } from "./templates/css.template";
import { exportConfigs } from "../exportManager";
import cutil from "../../common";
import { systemDefaultStyles } from "$src/lib/@const/element.const";
import setImmediate from "../../setImmediate";
import _ from "lodash";
import { progressController } from "$src/lib/comp/overlays/overlayWindows/progress/progressOverlayManager";
import CleanCSS from "clean-css";
export const estimateSteps = () => {
    return get(collection).length;
};
const exportCSS = async (usePC = true, verbose = false) => {
    // Get current collection
    const coll = get(collection);
    // create new buffer object
    let buffer = {};
    // loop through every element to generate its relevant stylesheet code
    for (let i = 0; i < coll.length; i++) {
        await setImmediate(() => {
            const currentElement = coll[i];
            const elementStyle = currentElement.style;
            const elementType = currentElement.type;
            // generate template tree for current tag
            const rootTemplate = generateCSSTemplate(get(exportConfigs), elementType, elementStyle);
            // initialize buffer object and generate root style string
            buffer[elementType] = {
                style: getStyleString(rootTemplate, verbose),
                psuedoElmnts: {},
                overrideStyles: {}
            };
            // generate styles for pseudo elements first
            if (elementStyle.USETEXT && !!elementStyle.leadingContent) {
                buffer[elementType].psuedoElmnts["before"] = `content: "${elementStyle.leadingContent}";`;
            }
            if (elementStyle.USETEXT && !!elementStyle.trailingContent) {
                buffer[elementType].psuedoElmnts["after"] = `content: "${elementStyle.trailingContent}";`;
            }
            // export all overrides
            for (let j = 0; j < currentElement.styleOverrides.length; j++) {
                const overrideElmnt = currentElement.styleOverrides[j];
                const paddedElmntStyle = _.defaultsDeep(elementStyle, systemDefaultStyles);
                const overrideStyle = cutil.findDiff(overrideElmnt.style, paddedElmntStyle);
                if (Object.keys(overrideStyle).length === 0)
                    continue; // skip if there are no differences in this override. We don't need it.
                // generate style template for override
                const overrideTemplate = generateCSSTemplate({ ...get(exportConfigs), common: { compressionAmt: 0 } }, elementType, overrideStyle, false);
                buffer[elementType].overrideStyles[overrideElmnt.name] = {
                    style: getStyleString(overrideTemplate, verbose),
                    psuedoElmnts: {},
                };
                // generate pseudo elements for override
                if ((overrideStyle.USETEXT || elementStyle.USETEXT) &&
                    (overrideStyle.leadingContent ?? "") !== elementStyle.leadingContent) {
                    buffer[elementType].overrideStyles[overrideElmnt.name].psuedoElmnts["before"] = `content: "${overrideStyle.leadingContent ?? ""}";`;
                }
                if ((overrideStyle.USETEXT || elementStyle.USETEXT) &&
                    (overrideStyle.trailingContent ?? "") !== elementStyle.trailingContent) {
                    buffer[elementType].overrideStyles[overrideElmnt.name].psuedoElmnts["after"] = `content: "${overrideStyle.trailingContent ?? ""}";`;
                }
            }
            // advance progress controller if requested
            if (usePC)
                progressController.advance();
        });
    }
    let finalCSS = "";
    finalCSS += genCSS(buffer);
    if (get(exportConfigs).stylesheets.fontIntegration) {
        const fontCSS = genFontFaces(coll, get(exportConfigs).stylesheets.loadFullTypeface);
        if (!!fontCSS) {
            finalCSS += `\n\n/* ========== FONT DEFINITIONS ========== */\n\n${fontCSS}`;
        }
    }
    // minify css if compression is 2
    if (get(exportConfigs).common.compressionAmt === 2) {
        // TODO: find a not shit package that can do it, or write an API route. But not today. Fuck this.
    }
    return finalCSS;
};
const genFontFaces = (collection, loadFull = false, useBase64 = false) => {
    // find all font families used in the stylesheet
    const getFamily = (style) => {
        if (!style.USETEXT)
            return "";
        const typeStyle = style.typeStyle;
        const fontObj = typeStyle?.fontObj;
        const familyName = fontObj?.family;
        if (!typeStyle || !fontObj || familyName === undefined)
            return "";
        return familyName;
    };
    // this is such a fucking stupid way to do this.
    const getVariationURL = (targetVar, variationURLs) => {
        if (!variationURLs)
            return null;
        for (let i = 0; i < variationURLs.length; i++) {
            if (variationURLs[i].variation === targetVar)
                return variationURLs[i].url;
        }
        return null;
    };
    let fontFace = {};
    let allVariations = {};
    const addNewFontFace = (original, newFamily, typeStyle) => {
        const fontObj = typeStyle.fontObj;
        // do not add new font face if the new family is a web safe font
        if (fontObj.webSafe)
            return original;
        original[newFamily] = Array.from(new Set([...(original[newFamily] ?? []), typeStyle.variation])); // do not include duplicate variations
        return original;
    };
    // cache used font faces
    for (let i = 0; i < collection.length; i++) {
        // find element root fonts
        const currentElement = collection[i];
        const elementStyle = currentElement.style;
        const rootFamily = getFamily(elementStyle);
        if (rootFamily !== "") {
            const typeStyle = elementStyle.typeStyle;
            // update usable font faces
            fontFace = addNewFontFace(fontFace, rootFamily, typeStyle);
            // record all styles
            if (!!typeStyle?.fontObj?.fileURLs && !allVariations[rootFamily])
                allVariations[rootFamily] = typeStyle.fontObj.fileURLs;
        }
        // find fonts in all overrides
        for (let j = 0; j < currentElement.styleOverrides.length; j++) {
            const overrideElmnt = currentElement.styleOverrides[j];
            const overrideStyle = overrideElmnt.style;
            const overrideFamily = getFamily(overrideStyle);
            if (overrideFamily !== "") {
                const typeStyle = overrideStyle.typeStyle;
                // update usable font faces
                fontFace = addNewFontFace(fontFace, overrideFamily, typeStyle);
                // record all styles
                if (!!typeStyle?.fontObj?.fileURLs && !allVariations[overrideFamily])
                    allVariations[overrideFamily] = typeStyle.fontObj.fileURLs;
            }
        }
    }
    // create font face definitions
    let result = "";
    const fontFaceKeys = Object.keys(fontFace);
    const getFontFaceStr = (family, variation, src, srcType) => {
        let result = "";
        result += "@font-face {\n";
        result += `\tfont-family: ${family};\n`;
        result += `\tsrc: url('${src}')`;
        if (!!srcType)
            result += `format('${srcType}')`;
        result += ";\n";
        result += `\tfont-weight: ${variation};\n`;
        result += "}";
        return result;
    };
    for (let i = 0; i < fontFaceKeys.length; i++) {
        const currentFamily = fontFaceKeys[i];
        const currentFontFace = fontFace[currentFamily];
        if (loadFull) {
            for (let j = 0; j < allVariations[currentFamily].length; j++) {
                const targetFontFace = allVariations[currentFamily][j];
                result += getFontFaceStr(currentFamily, targetFontFace.variation, targetFontFace.url) + "\n";
            }
        }
        else {
            for (let j = 0; j < currentFontFace.length; j++) {
                const targetVariation = currentFontFace[j];
                const targetVarURLs = allVariations[currentFamily];
                result += getFontFaceStr(currentFamily, targetVariation, getVariationURL(targetVariation, targetVarURLs)) + "\n";
            }
        }
        result += "\n";
    }
    return result.trim();
};
const genCSS = (buffer) => {
    const tags = Object.keys(buffer);
    let result = "";
    const indentLines = (str) => {
        if (str === undefined)
            return "";
        const lines = str.split("\n");
        return lines.map(line => "\t" + line).join("\n").trimEnd();
    };
    for (let i = 0; i < tags.length; i++) {
        const tag = tags[i];
        const tagStr = tag.toLowerCase();
        const rootBufferObj = buffer[tag];
        // add root style first
        result += `${tagStr} {\n`; // opening bracket
        result += indentLines(rootBufferObj.style);
        result += "\n}"; // closing bracket
        // prep for pseudo elements
        result += "\n";
        const rootPsuedoElmntKeys = Object.keys(rootBufferObj.psuedoElmnts);
        for (let j = 0; j < rootPsuedoElmntKeys.length; j++) {
            const rootPsuedoElmntName = rootPsuedoElmntKeys[j];
            result += `${tagStr}::${rootPsuedoElmntName} {\n`; // opening bracket
            result += indentLines(rootBufferObj.psuedoElmnts[rootPsuedoElmntName]);
            result += "\n}\n"; // closing bracket
        }
        result = result.trimEnd();
        // prep for override classes
        result += "\n\n";
        const overrideKeys = Object.keys(rootBufferObj.overrideStyles);
        for (let j = 0; j < overrideKeys.length; j++) {
            const overrideName = overrideKeys[j];
            const header = `${tagStr}.${overrideName}`;
            const overrideBufferObj = rootBufferObj.overrideStyles[overrideName];
            result += `${header} {\n`; // opening bracket
            result += indentLines(overrideBufferObj.style);
            result += "\n}\n"; // closing bracket
            // generate pseudo elements for override
            const overridePsuedoElmntKeys = Object.keys(overrideBufferObj.psuedoElmnts);
            for (let k = 0; k < overridePsuedoElmntKeys.length; k++) {
                const overridePsuedoElmntName = rootPsuedoElmntKeys[k];
                result += `${header}::${overridePsuedoElmntName} {\n`; // opening bracket
                result += indentLines(overrideBufferObj.psuedoElmnts[overridePsuedoElmntName]);
                result += "\n}\n"; // closing bracket
            }
        }
        result = result.trimEnd();
        // prep for next tag
        result += "\n\n\n";
    }
    return result.trimEnd();
};
/**
 * This is a recursive function where we generate the main stylesheet code. It'll work based on the template and rules defined in `css.template.ts`.
 * It uses the DFS algorithm to generate the stylesheet code.
 */
const getStyleString = (template, verbose = false, currentChunk = { p: 0, w: 0 }, currentLine = { p: 0, w: 0 }, currentColumn = { p: 0, w: 0 }, level = 0, init = true) => {
    let result = "";
    if (verbose)
        console.log(`>>> [ENTERED] Addr: ${encodeAddr(currentChunk, currentLine, currentColumn)}; Lvl: ${level}`);
    if (level === 2) {
        // find the highest priority line with the current address.
        let colWeights = getAddressWeights(template, currentChunk, currentLine, currentColumn, 2, verbose);
        let newResult = null;
        while (colWeights !== null && colWeights.length > 0) {
            const highestWeight = colWeights.pop();
            const currentAddress = encodeAddr(currentChunk, currentLine, { p: currentColumn.p, w: highestWeight });
            const callback = template.get(currentAddress);
            if (callback !== undefined) {
                try {
                    newResult = callback();
                }
                catch (e) {
                    console.warn(`[${currentAddress}] Non-fatal transpilation failure:\n${e}`);
                    // if we haven't reached the end of the weights, continue searching. Otherwise we should move on ot the next attribute
                    newResult = colWeights.length > 0 ? null : "";
                }
                if (newResult !== null) {
                    if (verbose)
                        console.log(`[OK] ${currentAddress}`);
                    result += newResult;
                    break;
                }
            }
            if (verbose)
                console.log(`[FAIL] ${currentAddress}`);
        }
        // after generating the current line, we can move on to the next line
        if (newResult !== null) {
            const fin = result + " " + getStyleString(template, verbose, currentChunk, currentLine, { p: (currentColumn.p + 1), w: 0 }, 2, false);
            if (verbose)
                console.log(`<<< [EXIT] Lvl: ${level}; Res: ${fin}`);
            return fin;
        }
        if (verbose)
            console.log(`<<< [EXIT] Lvl: ${level}; Res: ""`);
        return "";
    }
    if (level === 1) {
        // find the highest priority line with the current address.
        let lineWeights = getAddressWeights(template, currentChunk, currentLine, currentColumn, 1, verbose);
        while (lineWeights !== null && lineWeights.length > 0) {
            // get the highest line weight
            let highestWeight = lineWeights.pop();
            // attempt to generate the current line
            const tRes = getStyleString(template, verbose, currentChunk, { p: currentLine.p, w: highestWeight }, currentColumn, 2, false);
            // assuming everything else works properly, check if tRes is null
            if (tRes !== null && tRes.trim() !== "") { // if tRes is not null, we have a result, and we can break out of the loop
                result += tRes;
                if (verbose)
                    console.log(`[CHANGED] Lvl: ${level}; Val: ${tRes}`);
                break;
            }
        }
        if (lineWeights !== null) {
            // after generating the current line, we can move on to the next line
            const fin = result + "\n" + getStyleString(template, verbose, currentChunk, { p: (currentLine.p + 1), w: 0 }, currentColumn, 1, false);
            if (verbose)
                console.log(`<<< [EXIT] Lvl: ${level}; Res: ${fin.trim()}`);
            return fin.trim();
        }
        if (verbose)
            console.log(`<<< [EXIT] Lvl: ${level}; Res: ${result}`);
        return "";
    }
    // find the highest priority chunk with the current address.
    let chunkWeights = getAddressWeights(template, currentChunk, currentLine, currentColumn, 0, verbose);
    while (chunkWeights !== null && chunkWeights.length > 0) {
        // get the highest chunk weight
        const highestWeight = chunkWeights.pop();
        // attempt to generate a result from this chunk priority
        const tRes = getStyleString(template, verbose, { p: currentChunk.p, w: highestWeight }, currentLine, currentColumn, 1, false);
        // assuming everything else works properly, check if tRes is null
        if (tRes !== null && tRes.trim() !== "") { // if tRes is not null, we have a result, and we can break out of the loop
            result += tRes;
            if (verbose)
                console.log(`[CHANGED] Lvl: ${level};`);
            break;
        }
    }
    if (chunkWeights !== null) {
        // after generating this chunk, we can move on to the next chunk.
        let fin = result + "\n\n" + getStyleString(template, verbose, { p: (currentChunk.p + 1), w: 0 }, currentLine, currentColumn, 0, false);
        if (init)
            return fin.trim(); // get rid of stray new lines
        return fin.trim();
    }
    return "";
};
/**
 * Find the highest priority a particular attribute (chunk, line, column)
 *
 * @param {weightedPosition} currentChunk The chunk to match
 * @param {weightedPosition} currentLine The line to match
 * @param {weightedPosition} currentColumn The column to match
 * @param {number} targetattribute The attribute to target. 0 = Chunk, 1 = Line, 2 = Column
 *
 * @returns {number[]} a list of priority values, sorted from lowest to highest.
 */
const getAddressWeights = (template, currentChunk, currentLine, currentColumn, targetAttr, verbose = false) => {
    // test for base case with regex.
    let matchAddress = [currentChunk.p, currentLine.p, currentColumn.p]
        .map(e => toHex8(e))
        .join("")
        .substring(0, targetAttr * 2 + 2);
    let matchWeight = [currentChunk.w, currentLine.w, currentColumn.w]
        .map(e => toHex(e))
        .join("")
        .substring(0, targetAttr);
    const matchRegex = new RegExp(`^${matchAddress}([0-9,a-f]{2}){0,2}x${matchWeight}[0-9,a-f]{0,3}$`);
    const matchedHashKeys = Array.from(template.keys())
        .filter(e => matchRegex.test(e))
        .map(e => parseInt(e.split("x")[1][targetAttr], 16));
    if (verbose)
        console.log(`match addr: ${matchAddress}; match weight: ${matchWeight}; matched: ${matchedHashKeys.length > 0 ? Array.from(new Set(matchedHashKeys)) : "null"}`);
    if (matchedHashKeys.length === 0)
        return null; // no match
    // sort matched hash keys based on the target index weight from lowest to highest
    matchedHashKeys.sort();
    // get rid of duplicates
    return Array.from(new Set(matchedHashKeys));
};
export default exportCSS;
//# sourceMappingURL=css.js.map