const setImmediate = async (callback) => {
    return new Promise(res => setTimeout(() => {
        res(callback());
    }, 0));
};
export default setImmediate;
//# sourceMappingURL=setImmediate.js.map