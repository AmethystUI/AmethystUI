export const encodeAddr = (chunk, line, column) => {
    return [
        toHex8(chunk.p),
        toHex8(line.p),
        toHex8(column.p),
        "x",
        toHex(chunk.w),
        toHex(line.w),
        toHex(column.w) // ensure we have two digits
    ].join("");
};
export const decodeAddr = (addr) => {
    // split the address by seperator
    let position, weight;
    [position, weight] = addr.split("x");
    // read and store positional values
    let decodedAddr = [];
    for (let i = 0; i < 3; i++) {
        let pVal = parseInt(position.substring(i * 2, i * 2 + 2), 16);
        let wVal = parseInt(weight.substring(i, i + 1), 16);
        decodedAddr.push({
            p: pVal,
            w: wVal
        });
    }
    return decodedAddr;
};
export const toHex = (n) => {
    return n.toString(16);
};
export const toHex8 = (n) => {
    return toHex(n).padStart(2, "0");
};
//# sourceMappingURL=css.util.js.map