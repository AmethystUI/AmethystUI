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
        let rootStyleString = generateStyleString(elementStyle);

        console.log(rootStyleString);
    }
}

/**
 * This is a recursive function where we generate the main stylesheet code. It'll work based on the template and rules defined in `css.template.ts`.
 * It uses the DFS algorithm to generate the stylesheet code.
 */
const generateStyleString = (
    style: elementStyle,
    currentChunk: weightedPosition = {p: 0, w: 0},
    currentLine: weightedPosition = {p: 0, w: 0},
    currentColumn: weightedPosition = {p: 0, w: 0},
): string => {
    let result = "";

    // check if the current address exists, and if it does, execute the function at that address
    // const generatorCallback = CSSTemplate.get();
    // if(generatorCallback === undefined) { // base case scenario 1
    //     return "";
    // }

    // try to generate the style based on the highest priority rule
    let attrPriorities: string[] = generateHighestWeightAttr(currentChunk, currentLine, currentColumn, 2);
    if(attrPriorities !== null) console.log(`found: ${attrPriorities.join(", ")}`);
    else console.log("[LINE END]")

    // detect if we've reached a base case where attrPriorities length is 0
    if(attrPriorities === null) {
        return "";
    }

    // get address base and call callbacks from the highest priority
    let newResult: string;
    while(attrPriorities.length > 0) {
        const currentAddress = attrPriorities.pop();
        console.log(`Trying address: ${currentAddress}`)
        const callback = CSSTemplate.get(currentAddress);
        if(callback !== undefined){
            newResult = callback(style);
            if(newResult !== null){
                console.log("[OK]")
                break;
            }
        }
        console.log("[FAIL]")
    }

    if (newResult !== null){ // if the new result is null, we'll just skip it instead of terminanting this branch of recursion.
        result += newResult + " ";
    }

    // Check for other columns in the same line first
    result += generateStyleString(style, currentChunk, currentLine, {p: (currentColumn.p + 1) as hex8, w: currentColumn.w});
    return result; // return final result
}


/**
 * Find the highest priority a particular attribute (chunk, line, column)
 * 
 * @param {weightedPosition} currentChunk The chunk to match
 * @param {weightedPosition} currentLine The line to match
 * @param {weightedPosition} currentColumn The column to match
 * @param {number} targetattribute The attribute to target. 0 = Chunk, 1 = Line, 2 = Column
 */
const generateHighestWeightAttr = (
    currentChunk: weightedPosition,
    currentLine: weightedPosition,
    currentColumn: weightedPosition,
    targetAttr: number,
): string[] => {
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
    
    console.log(`match addr: ${matchAddress}; match weight: ${matchWeight}`);

    const matchRegex = new RegExp(`^${matchAddress}([0-9,a-f]{2}){0,2}x${matchWeight}[0-9,a-f]{0,2}$`)
    const matchedHashKeys: string[] = Array.from(CSSTemplate.keys()).filter(e => matchRegex.test(e));
    if(matchedHashKeys.length === 0) return null; // no match
    
    // sort matched hash keys based on the target index weight from lowest to highest
    matchedHashKeys.sort((a, b) => {
        const aWeight = parseInt(a.split("x")[1][targetAttr], 16);
        const bWeight = parseInt(b.split("x")[1][targetAttr], 16);
        return aWeight - bWeight;
    });

    return matchedHashKeys;
}

export default exportCSS;