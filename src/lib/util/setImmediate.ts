const setImmediate = async (callback: () => void): Promise<void> => {
    return new Promise<void>(res => setTimeout(() => {
        callback();
        res();
    }, 0));
};

export default setImmediate;