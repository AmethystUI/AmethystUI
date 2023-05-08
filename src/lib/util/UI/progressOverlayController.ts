import { progressModalData } from "$src/lib/stores/modalManager";
import { get } from "svelte/store";

export const progressOverlayController = {
    async set (newStep: number, description = undefined) { // update the progress only. This does not pend result when the total step is reached.
        progressModalData.update(dat => {
            dat.currentStep = newStep;
            dat.stepDescription = description;
            return dat;
        });
    },
    async advance (description = undefined) { // update the progress only. This does not pend result when the total step is reached.
        progressModalData.update(dat => {
            dat.currentStep ++;
            dat.stepDescription = description;
            return dat;
        });
    },
    async pendResult() { // instantly set the current step to the final step, and set the state to "pending"
        this.set(get(progressModalData).totalSteps);
        progressModalData.update(dat => {
            dat.state = "pending";
            return dat;
        });
    },
    async successResult() { // set the state to "success"
        // only allow this state to be set when the state is in "pending"
        if (get(progressModalData).state === "pending") {
            progressModalData.update(dat => {
                dat.state = "success";
                return dat;
            });
        } else {
            console.error("Cannot set the state to success when the state is in " + get(progressModalData).state);
        }
    },
    async errorResult() { // set the state to "error"
        // only allow this state to be set when the state is in "pending"
        if (get(progressModalData).state === "pending") {
            progressModalData.update(dat => {
                dat.state = "error";
                return dat;
            });
        } else {
            console.error("Cannot set the state to success when the state is in " + get(progressModalData).state);
        }
    }
}