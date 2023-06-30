import { get, writable } from "svelte/store";
import { openOverlay, overlayReady } from "../../overlayManager";

export interface progressData {
    taskName: string;
    totalSteps: number;
    currentStep: number;
    stepDescription?: string;
    state: "inprogress" | "pending" | "success" | "error";
}
export const progressOverlayData = writable<progressData>({
    taskName: "",
    totalSteps: 0,
    currentStep: 0,
    state: "inprogress"
});

export const openProgressModal = (taskName: string, totalSteps: number): Promise<void> => {
    openOverlay("progress");
    
    progressOverlayData.set({
        taskName: taskName,
        totalSteps: totalSteps,
        currentStep: 0,
        state: "inprogress"
    }); // register initial state and data

    return new Promise((res) => {
        // watch progressModalReady to turn true.
        const unsub = overlayReady.subscribe(ready => {
            if (ready) { // when ready, resolve with utilFunctions
                // unsubscribe from progressModalReady to prevent memory leaks
                unsub();
                // reset overlay ready to false
                overlayReady.set(false);
                res();
            }
        });
    })
}

export const progressController = {
    async set (newStep: number, description = undefined) { // update the progress only. This does not pend result when the total step is reached.
        progressOverlayData.update(dat => {
            dat.currentStep = Math.min(newStep, get(progressOverlayData).totalSteps);
            dat.stepDescription = description;
            return dat;
        });
        // wait for animation finish in case if we're awaiting
        await new Promise(res => setTimeout(res, 300));
    },
    async advance (description = undefined) { // update the progress only. This does not pend result when the total step is reached.
        progressOverlayData.update(dat => {
            dat.currentStep ++;
            dat.stepDescription = description;
            return dat;
        });
        // wait for animation finish in case if we're awaiting
        await new Promise(res => setTimeout(res, 300));
    },
    async pendResult() { // instantly set the current step to the final step, and set the state to "pending"
        this.set(get(progressOverlayData).totalSteps);
        progressOverlayData.update(dat => {
            dat.state = "pending";
            return dat;
        });
        // wait for animation finish in case if we're awaiting
        await new Promise(res => setTimeout(res, 300));
    },
    async successResult() { // set the state to "success"
        // only allow this state to be set when the state is in "pending"
        if (get(progressOverlayData).state === "pending") {
            progressOverlayData.update(dat => {
                dat.state = "success";
                return dat;
            });
        } else {
            console.error("Cannot set the state to success when the state is in " + get(progressOverlayData).state);
        }
    },
    async errorResult() { // set the state to "error"
        // only allow this state to be set when the state is in "pending"
        if (get(progressOverlayData).state === "pending") {
            progressOverlayData.update(dat => {
                dat.state = "error";
                return dat;
            });
        } else {
            console.error("Cannot set the state to success when the state is in " + get(progressOverlayData).state);
        }
    }
}