import { get, writable } from "svelte/store";
import { openOverlay, overlayClosable, overlayReady } from "../../overlayManager";
export const progressOverlayData = writable({
    taskName: "",
    totalSteps: 0,
    currentStep: 0,
    state: "inprogress"
});
export const openProgressOverlay = (taskName, totalSteps) => {
    progressController.reset(); // reset all controls first
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
    });
};
export const progressController = {
    set: async function (newStep, description = undefined) {
        progressOverlayData.update(dat => {
            dat.currentStep = Math.min(newStep, get(progressOverlayData).totalSteps);
            dat.stepDescription = description;
            return dat;
        });
        // wait for animation finish in case if we're awaiting
        await new Promise(res => setTimeout(res, 500));
    },
    advance: async function (description = undefined) {
        progressOverlayData.update(dat => {
            dat.currentStep++;
            dat.stepDescription = description;
            return dat;
        });
        // wait for animation finish in case if we're awaiting
        await new Promise(res => setTimeout(res, 500));
    },
    pendResult: async function () {
        this.set(get(progressOverlayData).totalSteps);
        progressOverlayData.update(dat => {
            dat.state = "pending";
            return dat;
        });
        // wait for animation finish in case if we're awaiting
        await new Promise(res => setTimeout(res, 500));
    },
    successResult: async function () {
        // pend result first
        await this.pendResult();
        // update to success 
        if (get(progressOverlayData).state === "pending") {
            progressOverlayData.update(dat => {
                dat.state = "success";
                return dat;
            });
        }
    },
    errorResult: async function (err, msg) {
        // pend result first
        await this.pendResult();
        overlayClosable.set(true);
        // update to err
        progressOverlayData.update(dat => {
            dat.taskName = msg;
            dat.stepDescription = `Reason: ${err}`;
            dat.state = "error";
            return dat;
        });
    },
    reset: function () {
        progressOverlayData.set({
            taskName: "",
            totalSteps: 0,
            currentStep: 0,
            state: "inprogress"
        }); // register initial state and data
    }
};
//# sourceMappingURL=progressOverlayManager.js.map