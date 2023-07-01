import { collection } from "$src/lib/stores/collection";
import { get } from "svelte/store";

export const estimateSteps = (): number => {
    return 1;
}

const exportJSON = async (usePC = true, verbose = false): Promise<string> => {
    // Get current collection
    const coll: element[] = get(collection);

    return JSON.stringify(coll);
}

export default exportJSON;