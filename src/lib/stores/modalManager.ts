import { writable } from "svelte/store";

export interface modalData {
    opened: boolean;
    modalID: string;
}

export const mainModalData = writable<modalData>({
    opened: true,
    modalID: ""
});
export let openModal = (id: string) => {
    mainModalData.set({
        opened: true,
        modalID: id
    })
}
export let closeModal = () => {
    mainModalData.set({
        opened: false,
        modalID: ""
    })
}

export interface progressModalData extends Partial<modalData> {
    opened: boolean;
    taskName: string;
    totalSteps: number;
    currentStep: number;
    stepDescription?: string;
    state: "inprogress" | "pending" | "success" | "error";
}
export const progressModalData = writable<progressModalData>({
    opened: false,
    taskName: "",
    totalSteps: 0,
    currentStep: 0,
    state: "inprogress"
});
export const progressModalReady = writable<boolean>(false);

export const openProgressModal = (taskName: string, totalSteps: number): Promise<void> => {
    progressModalData.set({
        opened: true,
        taskName: taskName,
        totalSteps: totalSteps,
        currentStep: 0,
        state: "inprogress"
    }); // register initial state and data

    return new Promise((res) => {
        // watch progressModalReady to turn true.
        const unsub = progressModalReady.subscribe(ready => {
            if (ready) { // when ready, resolve with utilFunctions
                // unsubscribe from progressModalReady to prevent memory leaks
                unsub();
                res();
            }
        });
    })
}