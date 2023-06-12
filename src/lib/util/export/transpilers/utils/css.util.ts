export type hex8 = IntRange<0, 255>;
export type hex4 = IntRange<0, 15>;

export interface weightedPosition {
    p: hex8; // two digit HEX
    w: hex4 // single digit HEX
}

export const encodeAddr = (chunk: weightedPosition, line: weightedPosition, column: weightedPosition) => {
    return [
        toHex8(chunk.p), // ensure we have two digits
        toHex8(line.p), // ensure we have two digits
        toHex8(column.p), // ensure we have two digits
        "x",
        toHex(chunk.w), // ensure we have two digits
        toHex(line.w), // ensure we have two digits
        toHex(column.w) // ensure we have two digits
    ].join("");
}

export const decodeAddr = (addr: string): [weightedPosition, weightedPosition, weightedPosition] => {
    // split the address by seperator
    let position: string, weight: string;
    [position, weight] = addr.split("x");
    
    // read and store positional values
    let decodedAddr: weightedPosition[] = [];
    for(let i = 0; i < 3; i ++){
        let pVal = parseInt(position.substring(i * 2, i * 2 + 2), 16);
        let wVal = parseInt(weight.substring(i, i + 1), 16);
        
        decodedAddr.push({
            p: pVal as hex8,
            w: wVal as hex4
        })
    }

    return decodedAddr as [weightedPosition, weightedPosition, weightedPosition];
}

export const toHex = (n: number): string => {
    return n.toString(16);
}
export const toHex8 = (n: number): string => {
    return toHex(n).padStart(2, "0");
}