import { collection } from "$src/lib/stores/collection";
import { fileSettings } from "$src/lib/stores/fileStatus";
import { get } from "svelte/store";
import { exportConfigs } from "../exportManager";

export const estimateSteps = (): number => {
    return 1;
}

const exportJSON = async (usePC = true, verbose = false): Promise<string> => {
    // Get current collection
    const newProject: project = {
        name: get(fileSettings).name,
        exportDate: Date.now(),
        content: get(collection)
    }

    return JSON.stringify(newProject, null, get(exportConfigs).common.compressionAmt === 0 ? 4 : 0);
}

export default exportJSON;