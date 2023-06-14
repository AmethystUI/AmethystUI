import { collection } from "$src/lib/stores/collection";
import { get } from "svelte/store";

import _ from "../../common";

import { decodeAddr, encodeAddr, toHex8, type hex4, type hex8, type weightedPosition, toHex } from "./utils/css.util";
import CSSTemplate from "./templates/css.template";
import { exportConfigs } from "../exportManager";

const exportCSS = async () => {
    // Get current collection
    const coll: element[] = get(collection);

    // create new buffer object
    let buffer: simpleExportBuffer;

    // loop through every element to generate its relevant stylesheet code
    for(let i = 0; i < coll.length; i++) {
        const currentElement = coll[i];
        const elementStyle: elementStyle = currentElement.style;
        const elementType: HTMLtags = currentElement.type;
        
        // fetch root style
        let rootStyleString = getStyleString(elementStyle);

        console.log(rootStyleString);
    }
}

/**
 * This is a recursive function where we generate the main stylesheet code. It'll work based on the template and rules defined in `css.template.ts`.
 * It uses the DFS algorithm to generate the stylesheet code.
 */
const getStyleString = (
    style: elementStyle,
    currentChunk: weightedPosition = {p: 0, w: 0},
    currentLine: weightedPosition = {p: 0, w: 0},
    currentColumn: weightedPosition = {p: 0, w: 0},
    level: number = 0
): string => {
    let result = "";
    console.log(`>>> [ENTERED] Addr: ${encodeAddr(currentChunk, currentLine, currentColumn)}; Lvl: ${level}`);

    if(level === 2){
        // find the highest priority line with the current address.
        let colWeights: number[] = getAddressWeights(currentChunk, currentLine, currentColumn, 2);
        let newResult: string = null;
        while(colWeights !== null && colWeights.length > 0) {
            const highestWeight = colWeights.pop();
            const currentAddress = encodeAddr(currentChunk, currentLine, {p: currentColumn.p, w: highestWeight as hex4});

            const callback = CSSTemplate.get(currentAddress);
            if(callback !== undefined){
                newResult = callback(style);
                if(newResult !== null){
                    console.log(`[OK] ${currentAddress}`)
                    result += newResult;
                    break;
                }
            }
            console.log(`[FAIL] ${currentAddress}`)
        }
        
        // after generating the current line, we can move on to the next line
        if(newResult !== null){
            return result + " " + getStyleString(style, currentChunk, currentLine, {p: (currentColumn.p + 1) as hex8, w: 0}, 2);
        } else {
            console.log(`<<< [EXIT] Lvl: ${level}`);
            return "";
        }
    }

    if(level === 1){
        // find the highest priority line with the current address.
        let lineWeights: number[] = getAddressWeights(currentChunk, currentLine, currentColumn, 1);
        while(lineWeights !== null && lineWeights.length > 0) {
            // get the highest line weight
            let highestWeight: number = lineWeights.pop();
            // attempt to generate the current line
            const tRes = getStyleString(style, currentChunk, {p: currentLine.p, w: highestWeight as hex4}, currentColumn, 2);
            // assuming everything else works properly, check if tRes is null
            if(tRes !== null) { // if tRes is not null, we have a result, and we can break out of the loop
                result += tRes;
                break;
            }
        }
        
        if(lineWeights !== null){
            // after generating the current line, we can move on to the next line
            return result + "\n" + getStyleString(style, currentChunk, {p: (currentLine.p + 1) as hex8, w: 0}, currentColumn, 2);
        } else {
            console.log(`<<< [EXIT] Lvl: ${level}`);
            return "";
        }
    }

    // find the highest priority chunk with the current address.
    let chunkWeights: number[] = getAddressWeights(currentChunk, currentLine, currentColumn, 0);
    while(chunkWeights !== null && chunkWeights.length > 0) {
        // get the highest chunk weight
        const highestWeight: number = chunkWeights.pop();
        // attempt to generate a result from this chunk priority
        const tRes = getStyleString(style, {p: currentChunk.p, w: highestWeight as hex4}, currentLine, currentColumn, 1);
        // assuming everything else works properly, check if tRes is null
        if(tRes !== null) { // if tRes is not null, we have a result, and we can break out of the loop
            result += tRes;
            break;
        }
    }

    // after generating this chunk, we can move on to the next chunk.
    return result + "\n\n" + getStyleString(style, {p: (currentChunk.p + 1) as hex8, w: 0}, currentLine, currentColumn, 1);
    
    
    
    
    // ====================================================================================
    
    // console.log(`[ENTERED AS ${encodeAddr(currentChunk, currentLine, currentColumn)}]---`);

    // // try to generate the style based on the highest priority rule
    // let attrPriorities: string[] = generateHighestWeightAttr(currentChunk, currentLine, currentColumn, 2);

    // // detect if we've reached a base case where attrPriorities length is 0
    // if(attrPriorities === null) {
    //     return "";
    // } else {
    //     console.log(`found: ${attrPriorities.join(", ")}`);
    // }

    // // get address base and call callbacks from the highest priority
    // let newResult: string;
    // while(attrPriorities.length > 0) {
    //     const currentAddress = attrPriorities.pop();
    //     console.log(`Trying address: ${currentAddress}`)
    //     const callback = CSSTemplate.get(currentAddress);
    //     if(callback !== undefined){
    //         newResult = callback(style);
    //         if(newResult !== null){
    //             console.log("[OK]")
    //             break;
    //         }
    //     }
    //     console.log("[FAIL]")
    // }

    // if (newResult !== null){ // if the new result is null, we'll just skip it instead of terminanting this branch of recursion.
    //     result += newResult + " ";
    // }

    // // Check for other columns in the same line first
    // result += generateStyleString(style, currentChunk, currentLine, {p: (currentColumn.p + 1) as hex8, w: 0});
    // console.log(`[LINE ${currentLine.p} @ CHUNK ${currentChunk.p} END]: Current result: ${result}`);
    // // result += "\n";
    // // After the line is generated, move on to the next line
    // result += generateStyleString(style, currentChunk, {p: (currentLine.p + 1) as hex8, w: 0}, {p:0, w:0});
    // console.log(`[CHUNK ${currentChunk.p} END]: Current result: ${result}`);
    // // result += "\n\n";
    // // After all lines in the chunk is genereated, move on to the next chunk
    // result += generateStyleString(style, {p: (currentChunk.p + 1) as hex8, w: 0}, {p:0, w:0}, {p:0, w:0});
    // console.log("---[FINISHED]: Current result: ${result}");

    // return result; // return final result
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
    console.log(`match addr: ${matchAddress}; match weight: ${matchWeight}; matched: ${matchedHashKeys.length > 0 ? Array.from(new Set(matchedHashKeys)) : "null"}`);
    if(matchedHashKeys.length === 0) return null; // no match
    
    // sort matched hash keys based on the target index weight from lowest to highest
    matchedHashKeys.sort();

    // get rid of duplicates
    return Array.from(new Set(matchedHashKeys));
}

export default exportCSS;