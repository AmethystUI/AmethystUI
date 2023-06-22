import { collection } from "$src/lib/stores/collection";
import { get } from "svelte/store";

import _ from "../../common";

import { encodeAddr, toHex8, type hex4, type hex8, type weightedPosition, toHex } from "./utils/css.util";
import { CSSTemplate, generateCSSTemplate } from "./templates/css.template";
import { exportConfigs } from "../exportManager";

const exportCSS = async () => {
    // Get current collection
    const coll: element[] = get(collection);

    // create new buffer object
    let buffer: simpleExportBuffer = {};

    // loop through every element to generate its relevant stylesheet code
    for(let i = 0; i < coll.length; i++) {
        const currentElement = coll[i];
        const elementStyle: elementStyle = currentElement.style;
        const elementType: HTMLtags = currentElement.type;
        
        // generate template tree for current tag
        generateCSSTemplate(get(exportConfigs), elementType, elementStyle);
        // initialize buffer object and generate root style string
        buffer[elementType] = {
            style: getStyleString(),
            overrideStyles: {}
        }    
    }

    console.log(buffer);
}

/**
 * This is a recursive function where we generate the main stylesheet code. It'll work based on the template and rules defined in `css.template.ts`.
 * It uses the DFS algorithm to generate the stylesheet code.
 */
const getStyleString = (
    verbose: boolean = false,
    currentChunk: weightedPosition = {p: 0, w: 0},
    currentLine: weightedPosition = {p: 0, w: 0},
    currentColumn: weightedPosition = {p: 0, w: 0},
    level: number = 0, init: boolean = true
): string => {
    let result = "";
    if(verbose) console.log(`>>> [ENTERED] Addr: ${encodeAddr(currentChunk, currentLine, currentColumn)}; Lvl: ${level}`);

    if(level === 2){
        // find the highest priority line with the current address.
        let colWeights: number[] = getAddressWeights(currentChunk, currentLine, currentColumn, 2, verbose);
        let newResult: string = null;
        while(colWeights !== null && colWeights.length > 0) {
            const highestWeight = colWeights.pop();
            const currentAddress = encodeAddr(currentChunk, currentLine, {p: currentColumn.p, w: highestWeight as hex4});

            const callback = CSSTemplate.get(currentAddress);
            if(callback !== undefined){
                newResult = callback();
                if(newResult !== null){
                    if(verbose) console.log(`[OK] ${currentAddress}`)
                    result += newResult;
                    break;
                }
            }
            if(verbose) console.log(`[FAIL] ${currentAddress}`)
        }
        
        // after generating the current line, we can move on to the next line
        if(newResult !== null){
            const fin = result + " " + getStyleString(verbose, currentChunk, currentLine, {p: (currentColumn.p + 1) as hex8, w: 0}, 2, false);
            if(verbose) console.log(`<<< [EXIT] Lvl: ${level}; Res: ${fin}`);
            return fin;
        }
        
        if(verbose) console.log(`<<< [EXIT] Lvl: ${level}; Res: ""`);
        return "";
    }

    if(level === 1){
        // find the highest priority line with the current address.
        let lineWeights: number[] = getAddressWeights(currentChunk, currentLine, currentColumn, 1, verbose);
        while(lineWeights !== null && lineWeights.length > 0) {
            // get the highest line weight
            let highestWeight: number = lineWeights.pop();
            // attempt to generate the current line
            const tRes = getStyleString(verbose, currentChunk, {p: currentLine.p, w: highestWeight as hex4}, currentColumn, 2, false);
            // assuming everything else works properly, check if tRes is null
            if(tRes !== null && tRes.trim() !== "") { // if tRes is not null, we have a result, and we can break out of the loop
                result += tRes;
                if(verbose) console.log(`[CHANGED] Lvl: ${level}; Val: ${tRes}`);
                break;
            }
        }
        
        if(lineWeights !== null){
            // after generating the current line, we can move on to the next line
            const fin = result + "\n" + getStyleString(verbose, currentChunk, {p: (currentLine.p + 1) as hex8, w: 0}, currentColumn, 1, false);
            if(verbose) console.log(`<<< [EXIT] Lvl: ${level}; Res: ${fin.trim()}`);
            return fin.trim();
        }

        if(verbose) console.log(`<<< [EXIT] Lvl: ${level}; Res: ${result}`);
        return "";
    }

    // find the highest priority chunk with the current address.
    let chunkWeights: number[] = getAddressWeights(currentChunk, currentLine, currentColumn, 0, verbose);
    while(chunkWeights !== null && chunkWeights.length > 0) {
        // get the highest chunk weight
        const highestWeight: number = chunkWeights.pop();
        // attempt to generate a result from this chunk priority
        const tRes = getStyleString(verbose, {p: currentChunk.p, w: highestWeight as hex4}, currentLine, currentColumn, 1, false);
        // assuming everything else works properly, check if tRes is null
        if(tRes !== null && tRes.trim() !== "") { // if tRes is not null, we have a result, and we can break out of the loop
            result += tRes;
            if(verbose) console.log(`[CHANGED] Lvl: ${level};`);
            break;
        }
    }

    if(chunkWeights !== null){
        // after generating this chunk, we can move on to the next chunk.
        let fin = result + "\n\n" + getStyleString(verbose, {p: (currentChunk.p + 1) as hex8, w: 0}, currentLine, currentColumn, 0, false);
        
        if(init) return fin.trim(); // get rid of stray new lines
        return fin.trim();
    }
    return "";
}


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
const getAddressWeights = (
    currentChunk: weightedPosition,
    currentLine: weightedPosition,
    currentColumn: weightedPosition,
    targetAttr: number,
    verbose: boolean = false
): number[] => {
    // test for base case with regex.
    let matchAddress: string =
        [currentChunk.p, currentLine.p, currentColumn.p]
        .map(e => toHex8(e))
        .join("")
        .substring(0, targetAttr * 2 + 2);
    let matchWeight: string =
        [currentChunk.w, currentLine.w, currentColumn.w]
        .map(e => toHex(e))
        .join("")
        .substring(0, targetAttr);
    
    const matchRegex = new RegExp(`^${matchAddress}([0-9,a-f]{2}){0,2}x${matchWeight}[0-9,a-f]{0,3}$`)
    const matchedHashKeys: number[] =
        Array.from(CSSTemplate.keys())
        .filter(e => matchRegex.test(e))
        .map(e => parseInt(e.split("x")[1][targetAttr], 16));
    if(verbose) console.log(`match addr: ${matchAddress}; match weight: ${matchWeight}; matched: ${matchedHashKeys.length > 0 ? Array.from(new Set(matchedHashKeys)) : "null"}`);
    if(matchedHashKeys.length === 0) return null; // no match
    
    // sort matched hash keys based on the target index weight from lowest to highest
    matchedHashKeys.sort();

    // get rid of duplicates
    return Array.from(new Set(matchedHashKeys));
}

export default exportCSS;