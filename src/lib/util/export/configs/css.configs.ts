export interface weightedPosition {
    p: IntRange<0, 255>; // two digit HEX
    w: IntRange<0, 15>; // single digit HEX
}

export const encodeAddr = (chunk: weightedPosition, line: weightedPosition, attr: weightedPosition) => {
    return [
        chunk.p.toString(16).padStart(2, "0"), // ensure we have two digits
        line.p.toString(16).padStart(2, "0"), // ensure we have two digits
        attr.p.toString(16).padStart(2, "0"), // ensure we have two digits
        "x",
        chunk.w.toString(16), // ensure we have two digits
        line.w.toString(16), // ensure we have two digits
        attr.w.toString(16) // ensure we have two digits
    ].join("");
}