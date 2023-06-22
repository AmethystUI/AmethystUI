const setImmediate = async <T>(callback: () => T): Promise<T> => {
    return new Promise<T>(res => setTimeout(() => {
        res(callback());
    }, 0));
};

export default setImmediate;