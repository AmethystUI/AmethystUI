export default async function flipAnimate(transitionElement, action, duration = 1000, customCleanup) {
    /* This function uses the FLIP transition method to transition an element between any state.
     * For now, this function will only transition the position of the element and nothing more.
     * If we need to transition more in the future, we can just add more features in here.
     *
     * In a nutshell, how this works is we take note of the initial state of the transitionElement.
     * We then apply the action to the transitionElement and take note of the state after action.
     * Then, immediately apply a counter transform to the element so that there look like nothing happened.
     * These three steps should happen within 14ms (60fps) or 7ms (120fps)
     *
     * Then, apply a css transition to move the element to the desired position.
     */
    let initialBoundingBox;
    let finalBoundingBox;
    let deltaX;
    let deltaY;
    const getInitalPosition = () => {
        initialBoundingBox = transitionElement.getBoundingClientRect();
    };
    const getFinalPosition = () => {
        action();
        finalBoundingBox = transitionElement.getBoundingClientRect();
    };
    const invert = () => {
        // compute the delta between initial and final state
        deltaX = initialBoundingBox.x - finalBoundingBox.x;
        deltaY = initialBoundingBox.y - finalBoundingBox.y;
        // apply these delta to transitionElement through css transform
        transitionElement.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
    };
    const play = () => {
        // add transitions to the element
        transitionElement.style.transitionDuration = `${duration}ms`;
        transitionElement.style.transitionProperty = 'transform';
        // reset position with transform
        transitionElement.style.transform = "translate(0px, 0px)";
        return;
    };
    const cleanup = () => {
        // remove transition properties
        transitionElement.style.removeProperty('transform');
        transitionElement.style.removeProperty('transition-duration');
        transitionElement.style.removeProperty('transition-property');
    };
    // we need to check if the moving element as any transitions attached on right now. If it does, we need to get 
    getInitalPosition();
    cleanup();
    getFinalPosition();
    // print out the final and initial positions
    invert();
    // as of testing, these three steps happen within 5ms, which provide us with a lot of overhead to create smooth animations
    setTimeout(() => {
        play();
    }, 0);
    await new Promise(resolve => setTimeout(resolve, duration));
    // cleanup element after the animation completes
    // cleanup();
    if (!!customCleanup)
        customCleanup();
}
//# sourceMappingURL=flipAnimate.js.map