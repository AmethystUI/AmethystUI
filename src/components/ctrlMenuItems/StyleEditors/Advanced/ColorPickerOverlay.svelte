<!-- This is the overlay module that can be used with the Overlay component -->

<!-- control functions for the overlay -->
<script lang="ts" context="module">
    import { setColorPickerRef } from "../../../../stores/colorPickerStat";
    import { openOverlayFrame } from "./Overlay.svelte";
    const componentID = crypto.randomUUID();

    /**
     * Opens the color picker as well as the overlay frame and sets the color reference and name.
     * 
     * @param {string} propertyRef - The color reference to set.
     * @param {string} propertyName - The name of the color reference.
     * @param {HTMLElement} trackTarget - The element to track positionally. Tracking behavior is determined by props.showInlineHSL
     * @property {boolean} trackContinuously - Whether to track the element continuously (Default true).
     * @property {boolean} showInlineHSL - Whether to show the inline HSL values  (Default false).
     */
    export function openColorPicker(propertyRef:string, propertyName:string, trackTarget: HTMLElement | Element, props={
        trackContinuously: true,
        showInlineHSL: false
    }){
        setColorPickerRef(propertyRef); // set the color reference
                                    
        mainColorPickerData.update(pickerDat => { // update the picker
            pickerDat.windowName = propertyName; // update color name
            pickerDat.showInlineHSL = props.showInlineHSL; // update whether or not to show the inline HSL
            return pickerDat;
        });

        // open the overlay frame
        openOverlayFrame(trackTarget, updateOverlaySize, componentID, props.trackContinuously, ColorPickerOverlay);
    }

    // ======================== NON EXPORTABLES ========================

    // track if drag is locked or not to update our overlay sizing. We only want to update something when it's necessary
    // also track visible because hiding and showing it is weird
    let dragLocked = get(mainOverlayData).dragLocked;
    let lastDragLocked = get(mainOverlayData).dragLocked;
    let visible = get(mainOverlayData).visible;
    let lastVisible = get(mainOverlayData).visible;

    // these configure the sizing of the window. Manually configure them for now cuz I can't be bothered to write detection code
    let normalOverlayWidth = 250;
    let normalOverlayHeight = 305;
    let titleHeight = 25;
    let inlineHSLHeight = 57;

    // HTML containers for the content
    let mainContainer:HTMLElement;
    let mainTitleContainer:HTMLElement;
    let inlineHSLContainer:HTMLElement;
    
    let targetHeight = normalOverlayHeight;
    let targetCursorOffset = 0;

    let globalContentYOffset = 10;
    let targetYOffset = globalContentYOffset;
    let contentYOffset = tweened(targetYOffset, {
        duration: 500,
		easing: quadOut
    }); // controls how much the content is moved down. Update with height changes

    /**
     * This fucntion handle all size changes for the element. Normally, the overlay size will only update if it's closed. However, this can be changed if forceUpdate is set to true.
     * 
     * @param forceUpdate - force the update regardless of overlay visibility
     */ 
     const updateOverlaySize = (forceUpdate = false) => { // we can forcefully override and update anyways
        setTimeout(() => { // set time out here so that elements have a chance to load
            // we only want to run when there's a change in drag and last dragged, or when an override is called
            dragLocked = get(mainOverlayData).dragLocked; 
            visible = get(mainOverlayData).visible;
    
            // the element checking basically ensures there's something to update
            if(dragLocked === lastDragLocked && visible === lastVisible && !!mainContainer){
                if(!forceUpdate) return;
            }
    
            // code starts executing here, if there is a change between dragLocked
    
            // If the update isn't an override, really only these code should be executed
            mainOverlayData.update(overlayDat => {overlayDat.w = normalOverlayWidth; return overlayDat});
    
            // these determine how to update the sizing based on the mode
            if(dragLocked){ // how to update the overlay when it's dragged out
                targetHeight = normalOverlayHeight + titleHeight; // we add title height because the title will also pop out
                targetCursorOffset = titleHeight/2;
    
                // unhide the title
                if(!!mainTitleContainer) mainTitleContainer.classList.remove("hidden");
    
                targetYOffset = globalContentYOffset + titleHeight/2;
            } else { // how to update the overlay when it's not dragged out
                targetHeight = normalOverlayHeight;
                targetCursorOffset = titleHeight/2;
    
                // hide the title
                if(!!mainTitleContainer) mainTitleContainer.classList.add("hidden");
    
                targetYOffset = globalContentYOffset;
            }
    
            // how to update the overlay regardless of it's dragged out or not
            if(!!get(mainColorPickerData).showInlineHSL || !!dragLocked){ // show inline HSL, make the height larger
                targetHeight += inlineHSLHeight;
                targetYOffset -= inlineHSLHeight/2;
                if(!get(mainColorPickerData).showInlineHSL) targetCursorOffset += inlineHSLHeight/2;
                if(!!inlineHSLContainer) inlineHSLContainer.classList.remove("hidden");
            } else {
                if(!!inlineHSLContainer) inlineHSLContainer.classList.add("hidden");
            }
            
            // update values
            mainOverlayData.update(overlayDat => {
                overlayDat.h = targetHeight;
                overlayDat.cursorOffsetY = targetCursorOffset;
                return overlayDat;
            });
            contentYOffset.set(targetYOffset, {duration: get(mainOverlayData).visible ? 200 : 1});
    
            lastDragLocked = dragLocked;
            lastVisible = visible;
        }, 0);
    }
</script>

<!-- Colorpicker overlay backend -->
<script lang="ts">
    import { mainColorPickerData } from "../../../../stores/colorPickerStat"
    import { collection, selectedComponent, selectedOverride } from "../../../../stores/collection"
    import type { color } from "../../../../types/general";
    import { hexToRgba, hslToRgb, rgbaToHex, rgbToHsl } from '../../../../util/colorMaths';
    import { tweened } from 'svelte/motion';
	import { quadOut } from 'svelte/easing';
    
    import { mainOverlayData } from "../../../../stores/overlayStat";
    import ColorPickerOverlay from "./ColorPickerOverlay.svelte"; // This import causes circular dependency warning in the compiler, but it works for now. It might be an issue in the future, so keep an eye out on this line.

    import ValueInput from '../Basics/ValueInput.svelte';
    import { get } from "svelte/store";
    
    let colorRef:color;
    let hslMode = true;
    let currentColorModeTextClr = ""; // for UI purposes only.

    // This try catch tries to retrieve the specified color reference from $collection.
    // If such reference exists, then we point our local colorRef to the $collection reference.
    // If such reference does not exist or no longer exists, we will just duplicate the value we currently have so that the value can persist on and not reset itself.
    // If there is any error during checking or assigning, we can just reset everything for safety.
    
    $: if(get(mainOverlayData).activeComponentID === componentID){ try { // only try to update the reference if the active elemnt ID matches the current one
        if ($mainColorPickerData.refName && $selectedComponent !== -1) {
            if ($selectedOverride !== -1) {
                colorRef = $collection[$selectedComponent].styleOverrides[$selectedOverride].style[$mainColorPickerData.refName]; // there is an overlay, so choose the overlay style
            } else {
                colorRef = $collection[$selectedComponent].style[$mainColorPickerData.refName];  // there is no overlay, so choose the root style
            }
        } else {
            colorRef = {...colorRef}; // persistence of color even after reference is cleared
        }
    } catch (error) {
        // if there is an error, just reset the overlay because it's probably due to some bad timing between the layers and the picker
        $mainColorPickerData.refName = undefined;
        $mainColorPickerData.windowName = "Colors";
    }}

    $: hue = !!colorRef ? colorRef.h : hue ?? 0;
    $: sat = !!colorRef ? colorRef.s : sat ?? 0;
    $: lum = !!colorRef ? colorRef.l : lum ?? 0;
    $: red = !!colorRef ? colorRef.r : red ?? 0;
    $: green = !!colorRef ? colorRef.g : green ?? 0;
    $: blue = !!colorRef ? colorRef.b : blue ?? 0;
    
    $: alpha = !!colorRef ? colorRef.a : alpha ?? 0;

    $: name = $mainColorPickerData.windowName ?? "Colors";

    // hue + alpha slider tracker
    let hueSlider:HTMLDivElement;
    let hueKnob:HTMLDivElement;
    let hueKnobOffset = 0;

    let alphaSlider:HTMLDivElement;
    let alphaKnobOffset = 0;

    let hueCube:HTMLDivElement;
    let hueCubeKnob:HTMLDivElement;
    let cubeOffsetX = 0;
    let cubeOffsetY = 0;

    let initialCursorX = 0;
    let initialCursorY = 0;
    
    $:if(!!hueSlider){
        // update the position of the hue knob
        const sliderLen = 230;
        const knobWidth = 15;
        hueKnobOffset = (hue/360) * (sliderLen - knobWidth)
    }
    $:if(!!alphaSlider){
        // update the position of the alpha knob
        const sliderLen = 230;
        const knobWidth = 15;
        alphaKnobOffset = (alpha/100) * (sliderLen - knobWidth);
    }
    $:if(!!hueCube){
        // update the position of the alpha knob
        const width = 240;
        const height = 200;
        const knobWidth = hueCubeKnob.getBoundingClientRect().width;
        cubeOffsetX = (sat/100) * (width - knobWidth);
        cubeOffsetY = ((100-lum)/100) * (height - knobWidth);
    }

    const startHueDrag = (e:MouseEvent) => {  
        // update value first
        if(!hueSlider) return; // do not track if the slider bg not initialized fully

        const sliderBCR = hueSlider.getBoundingClientRect(); // BCR = bounding client rect

        hue = ((e.clientX - sliderBCR.x)/sliderBCR.width)*360;
        // check v range
        if(hue < 0) hue = 0;
        if(hue > 360) hue = 360;
        // round hue
        hue = Math.round(hue);

        // dispatch an update value
        if (!!colorRef){
            colorRef.h = hue;
            // convert to rgb and update that too
            const rgbVals = hslToRgb(hue, sat, lum);
            colorRef.r = rgbVals[0];
            colorRef.g = rgbVals[1];
            colorRef.b = rgbVals[2];
            // update hex code
            const hexCode = rgbaToHex(rgbVals[0], rgbVals[1], rgbVals[2], alpha);
            colorRef.hex = hexCode;

            $collection = $collection;
        }

        // start tracking mouse position on move
        document.addEventListener('mousemove', trackHueDrag);
        document.addEventListener('mouseup', endHueDrag);
    }
    const trackHueDrag = (e:MouseEvent) => {
        e.preventDefault();

        const sliderBCR = hueSlider.getBoundingClientRect(); // BCR = bounding client rect
        // assign dV
        hue = ((e.clientX - sliderBCR.x)/sliderBCR.width)*360;
        // check v range
        if(hue < 0) hue = 0;
        if(hue > 360) hue = 360;
        // round hue
        hue = Math.round(hue);

        // dispatch an update value
        if (!!colorRef){
            colorRef.h = hue;
            // convert to rgb and update that too
            const rgbVals = hslToRgb(hue, sat, lum);
            colorRef.r = rgbVals[0];
            colorRef.g = rgbVals[1];
            colorRef.b = rgbVals[2];
            // update hex code
            const hexCode = rgbaToHex(rgbVals[0], rgbVals[1], rgbVals[2], alpha);
            colorRef.hex = hexCode;

            $collection = $collection;
        }
    }
    const endHueDrag = () => {
        document.body.style.cursor = "normal";
        document.removeEventListener('mousemove', trackHueDrag);
        document.removeEventListener('mouseup', endHueDrag);
    }

    const startAlphaDrag = (e:MouseEvent) => {  
        // update value first
        if(!alphaSlider) return; // do not track if the slider bg not initialized fully

        const sliderBCR = alphaSlider.getBoundingClientRect(); // BCR = bounding client rect

        alpha = ((e.clientX - sliderBCR.x)/sliderBCR.width)*100;
        // check v range
        if(alpha < 0) alpha = 0;
        if(alpha > 100) alpha = 100;
        // round alpha
        alpha = Math.round(alpha);

        // dispatch an update value
        if (!!colorRef){
            colorRef.a = alpha;
            // update hex code
            const rgbVals = hslToRgb(hue, sat, lum);
            const hexCode = rgbaToHex(rgbVals[0], rgbVals[1], rgbVals[2], alpha);
            colorRef.hex = hexCode;
            $collection = $collection;
        }

        // start tracking mouse position on move
        document.addEventListener('mousemove', trackAlphaDrag);
        document.addEventListener('mouseup', endAlphaDrag);
    }
    const trackAlphaDrag = (e:MouseEvent) => {
        e.preventDefault();

        const sliderBCR = alphaSlider.getBoundingClientRect(); // BCR = bounding client rect
        // assign dV
        alpha = ((e.clientX - sliderBCR.x)/sliderBCR.width)*100;
        // check v range
        if(alpha < 0) alpha = 0;
        if(alpha > 100) alpha = 100;
        // round alpha
        alpha = Math.round(alpha);

        // dispatch an update value
        if (!!colorRef){
            colorRef.a = alpha;
            // update hex code
            const rgbVals = hslToRgb(hue, sat, lum);
            const hexCode = rgbaToHex(rgbVals[0], rgbVals[1], rgbVals[2], alpha);
            colorRef.hex = hexCode;
            $collection = $collection;
        }
    }
    const endAlphaDrag = () => {
        document.body.style.cursor = "normal";
        document.removeEventListener('mousemove', trackAlphaDrag);
        document.removeEventListener('mouseup', endAlphaDrag);
    }

    // color cube movement
    const startCubeDrag = (e:MouseEvent) => {  
        // update value first
        if(!hueCube) return; // do not track if the slider bg not initialized fully

        // record init X and Y
        initialCursorX = e.clientX;
        initialCursorY = e.clientY;

        const cubeBCR = hueCube.getBoundingClientRect(); // BCR = bounding client rect

        sat = ((e.clientX - cubeBCR.x)/cubeBCR.width)*100;
        let tempLum = ((e.clientY - cubeBCR.y)/cubeBCR.height)*100;
        // check sat/val range
        sat = Math.min(Math.max(sat, 0), 100);
        lum = 100-Math.min(Math.max(tempLum, 0), 100);
        // round sat and lum
        sat = Math.round(sat);
        lum = Math.round(lum);

        // dispatch an update value
        // dispatch an update value
        if (!!colorRef){
            colorRef.s = sat;
            colorRef.l = lum;
            // convert to rgb and update that too
            const rgbVals = hslToRgb(hue, sat, lum);
            colorRef.r = rgbVals[0];
            colorRef.g = rgbVals[1];
            colorRef.b = rgbVals[2];
            // update hex code
            const hexCode = rgbaToHex(rgbVals[0], rgbVals[1], rgbVals[2], alpha);
            colorRef.hex = hexCode;

            $collection = $collection;
        }

        // start tracking mouse position on move
        document.addEventListener('mousemove', trackCubeDrag);
        document.addEventListener('mouseup', endCubeDrag);
    }
    const trackCubeDrag = (e:MouseEvent) => {
        e.preventDefault();

        const cubeBCR = hueCube.getBoundingClientRect(); // BCR = bounding client rect

        let currX = e.clientX, currY = e.clientY;
        let snapThreshold = 5;
        let xLocked = false

        // detect if shift is pressed. If so, move only vertically or horizontally
        // this code is a fucking disaster
        if(e.shiftKey){
            // calculate X Y deviation
            let devX = Math.abs(e.clientX - initialCursorX), devY = Math.abs(e.clientY - initialCursorY);
            // find greatest deviation
            let largestDev = Math.max(devX, devY);
            // find which value to lock based on those deviations
            if(largestDev === devY && devY > snapThreshold) {currX = initialCursorX; xLocked=true;} // lock X
            else if(devX > snapThreshold) {currY = initialCursorY; xLocked=false;} // lock Y
            else if(xLocked) currX = initialCursorX // these two cases only execute if no threshold is reached. In this case, follow the last one
            else currY = initialCursorY
        }

        sat = ((currX - cubeBCR.x)/cubeBCR.width)*100;
        let tempLum = ((currY - cubeBCR.y)/cubeBCR.height)*100;
        // check sat/val range
        sat = Math.min(Math.max(sat, 0), 100);
        lum = 100-Math.min(Math.max(tempLum, 0), 100);
        // round sat and lum
        sat = Math.round(sat);
        lum = Math.round(lum);

        // dispatch an update value
        if (!!colorRef){
            colorRef.s = sat;
            colorRef.l = lum;
            // convert to rgb and update that too
            const rgbVals = hslToRgb(hue, sat, lum);
            colorRef.r = rgbVals[0];
            colorRef.g = rgbVals[1];
            colorRef.b = rgbVals[2];
            // update hex code
            const hexCode = rgbaToHex(rgbVals[0], rgbVals[1], rgbVals[2], alpha);
            colorRef.hex = hexCode;

            $collection = $collection;
        }
    }
    const endCubeDrag = () => {
        document.body.style.cursor = "normal";
        document.removeEventListener('mousemove', trackCubeDrag);
        document.removeEventListener('mouseup', endCubeDrag);
    }

    // special cases that requires force updates
    $: if($mainColorPickerData.showInlineHSL !== undefined && get(mainOverlayData).activeComponentID === componentID) updateOverlaySize(true); // when the inlineHSL prop is changed, we want to update.

    // handles all color changes
    const updateClr = (e:CustomEvent, updateValue:string) => {
        let v = e.detail.v;

        // lowercase the updateValue
        updateValue = updateValue.toLowerCase();

        // do a simple range check
        if(updateValue === "h"){
            if(v > 360) v = 360; // set min max
            if(v < 0) v = 0;
        }
        if(updateValue === "s" || updateValue === "l"){
            if(v > 100) v = 100; // set min max
            if(v < 0) v = 0;
        }
        if(updateValue === "r" || updateValue === "g" || updateValue === "b") {
            if(v > 255) v = 255; // set min max
            if(v < 0) v = 0;
        }

        // determine whether to update H or R
        if(!!colorRef && colorRef[updateValue] !== undefined && updateValue !== "type"){
            colorRef[updateValue] = v;
        } else{
            console.error(`Value "${updateValue}" does not exist. Check what you're trying to update`);
            return;
        }

        if (updateValue === "h" || updateValue === "s" || updateValue === "l"){
            // if changes occured to HSL values, update RGB and HEX values
            const rgbVal = hslToRgb(colorRef.h, colorRef.s, colorRef.l);
            colorRef.r = rgbVal[0];
            colorRef.g = rgbVal[1];
            colorRef.b = rgbVal[2];
            const hexCode = rgbaToHex(colorRef.r, colorRef.g, colorRef.b, colorRef.a);
            colorRef.hex = hexCode

            $collection = $collection;
            $mainColorPickerData = $mainColorPickerData;
            return; // end update
        } if (updateValue === "r" || updateValue === "g" || updateValue === "b"){
            // if changes occured to RGB values, update HSL and HEX values
            const hslVal = rgbToHsl(colorRef.r, colorRef.g, colorRef.b);
            colorRef.h = hslVal[0];
            colorRef.s = hslVal[1];
            colorRef.l = hslVal[2];
            const hexCode = rgbaToHex(colorRef.r, colorRef.g, colorRef.b, colorRef.a);
            colorRef.hex = hexCode

            $collection = $collection;
            $mainColorPickerData = $mainColorPickerData;
            return; // end update
        } if (updateValue === "a"){
            // if changes occured to alpha values, update HEX values
            const hexCode = rgbaToHex(colorRef.r, colorRef.g, colorRef.b, colorRef.a);
            colorRef.hex = hexCode;

            $collection = $collection;
            $mainColorPickerData = $mainColorPickerData;
            return; // end update
        } if (updateValue === "hex" && (colorRef.hex.length === 3 || colorRef.hex.length === 4 || colorRef.hex.length === 6 || colorRef.hex.length === 8)){
            // if changes occured to hex values, update HSL, RGB and ALPHA values
            const rgbaVal = hexToRgba(colorRef.hex);
            colorRef.r = rgbaVal[0];
            colorRef.g = rgbaVal[1];
            colorRef.b = rgbaVal[2];
            colorRef.a = rgbaVal[3];
            const hslVal = rgbToHsl(rgbaVal[0], rgbaVal[1], rgbaVal[2]);
            colorRef.h = hslVal[0];
            colorRef.s = hslVal[1];
            colorRef.l = hslVal[2];
            
            $collection = $collection;
            $mainColorPickerData = $mainColorPickerData;
            return; // end update
        }
    }
</script>

<section bind:this={mainTitleContainer} id="snapped-title-container" class="hidden" style={
    `transform: translate3d(0px, -${128 + titleHeight}px, 0px)`
}>
    <h6>{name}</h6>
</section>

<section bind:this={inlineHSLContainer} id="inline-hsl-container" class="hidden" style={
    `transform: translate3d(0px, ${67.5 + (!!$mainOverlayData.dragLocked ? titleHeight : 0) + inlineHSLHeight - targetYOffset}px, 0px)`
}>
    <ValueInput on:updateValue={(e) => updateClr(e, hslMode ? "h" : "r")}
        name={hslMode ? "Hue" : "Red"}
        v={hslMode ? hue : red}
        hasMargin={true} sub={true} maxVal={hslMode ? 360 : 255} align={"center"} textClrOverride={currentColorModeTextClr}/>

    <ValueInput on:updateValue={(e) => updateClr(e, hslMode ? "s" : "g")}
        name={hslMode ? "Sat" : "Green"}
        v={hslMode ? sat : green}
        hasMargin={true} sub={true} maxVal={hslMode ? 100 : 255} align={"center"} textClrOverride={currentColorModeTextClr}/>

    <ValueInput on:updateValue={(e) => updateClr(e, hslMode ? "l" : "b")}
        name={hslMode ? "Lum" : "Blue"}
        v={hslMode ? lum : blue}
        hasMargin={true} sub={true} maxVal={hslMode ? 100 : 255} align={"center"} textClrOverride={currentColorModeTextClr}/>
    
    <ValueInput
        on:updateValue={(e) => updateClr(e, "a")}
        name={"Alpha"} v={alpha} hasMargin={false} sub={true} maxVal={100} align={"center"}/>

    <!-- bar that hovers over the texts -->
    <div id="hsl-rgb-switcher" title={`Switch to ${!!colorRef ? (colorRef.type === "rgb" ? "HSL" : "RGB") : "HSL"} mode`} on:click={() => hslMode = !hslMode} on:mouseenter={() => {currentColorModeTextClr="hsl(0,0%,80%)"}} on:mouseleave={() => {currentColorModeTextClr=""}}></div>
</section>


<!-- main content (on the top) -->
<main bind:this={mainContainer} style="transform:translate3d(0px, {$contentYOffset}px, 0px)">
    <!-- color cube -->
    <div id="color-gradient" bind:this={hueCube} on:mousedown={startCubeDrag} >
        <div class="grad" id="sat-grad" style={`
            background-image: linear-gradient(90deg, hsl(0,0%,50%) 0%, hsl(${hue}deg,100%,50%) 100%);
        `}></div>
        <div class="grad" id="lum-grad"></div>
    
        <div class="knob outlined-knob" bind:this={hueCubeKnob} style={`
            background-color: hsl(${hue}deg, ${sat}%, ${lum}%);
            transform: translate3d(${cubeOffsetX}px, ${cubeOffsetY}px, 0px)
        `}></div>
    </div>
    
    <!-- sliders -->
    <div class="color-slider" id="hue-slider" bind:this={hueSlider} on:mousedown={startHueDrag}>
        <div bind:this={hueKnob} class="knob outlined-knob" style={`
            background-color: hsl(${hue}deg, 100%, 50%);
            transform: translate3d(${hueKnobOffset}px, 0px, 0px)
        `}></div>
    </div>
    
    <div class="color-slider" id="alpha-slider" bind:this={alphaSlider} on:mousedown={startAlphaDrag}>
        <!-- the gradient -->
        <section style={`background: linear-gradient(to right, hsla(${hue}, ${sat}%, ${lum}%, 0%) 0%, hsla(${hue}, ${sat}%, ${lum}%, 100%) 100%); z-index: 0`}></section>
        <div class="knob outlined-knob" style={`
            background-color: hsl(${hue}deg, ${sat}%, ${lum}%, ${alpha}%);
            transform: translate3d(${alphaKnobOffset}px, 0px, 0px)
        `}></div>
    </div>
</main>

<style lang="scss">
    @import "./public/guideline";

    #inline-hsl-container{
        position: absolute; width:90%; height:50px;
        transition: opacity 500ms $normal-ease-out;
        opacity: 1; background: none;   
        transform-origin: center;
        pointer-events: all;
        display:flex; justify-content: center; align-items: center;

        &.hidden{
            transform: translate3d(0px, 120px, 0px) !important;

            opacity:0;
            pointer-events: none;
        }

        #hsl-rgb-switcher{
            position:absolute; top:5px; left:0; border-radius: 10px;
            height:14px; width:75%;
            opacity:10%;
            background-color: transparent;
            
            &:hover{
                background-color: $secondary
            }
        }
    }
    
    #snapped-title-container{
        position: absolute; width:100%;
        // we have to use the flex box method because if we don't there's a bug where the text misaligned from time to time
        display:flex; justify-content: center;
        transition: opacity 200ms linear;
        opacity:1; pointer-events: none;
        
        &.hidden{ opacity:0 }

        h6{
            font-weight: 700;
            user-select: none; -webkit-user-select: none;
        }
    }

    main{
        display: flex; justify-content: center; align-items: center; flex-direction: column;
    }

    .color-slider{
        position: relative;
        width: 230px; height:15px;
        border-radius: 100px;
        margin: 12.5px 0 0 0;
        background-color: #fff;
        box-shadow: 0 1px 5px hsla(0,0%,0%,50%);
        cursor: inherit;

        &:active{
            cursor:none;
        }

        &#hue-slider{
            background: linear-gradient(to right, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%);
        }

        &#alpha-slider{
            background-image: url("../assets/svgs/checkerBoardPattern.svg");
            background-color: $primary;
            background-size: 17.5px;
            position: relative;

            section{
                width:100%; height:100%; border-radius: inherit;
                position: absolute; top:0; left:0;
            }
        }
    }
    
    #color-gradient{
        width:240px; height:200px;
        position: relative;
        cursor: inherit;
        overflow:hidden;
        transition: all 300ms ease-in-out;
        border-radius: 7.5px;

        &:active{
            cursor:none;
        }

        .grad{
            width: 100%; height:100%;
        } #sat-grad{
            z-index: 1; position: absolute; top:0; left:0
        } #lum-grad{
            background-image: linear-gradient(0deg, rgba(0,0,0,1) 0%, rgba(125,125,125,0) 50%, rgba(255,255,255,1) 100%);
            z-index: 2; position: absolute; top:0; left:0
        }
    }

    .knob{
        height:15px; width:15px; background: none;
        border-radius: 1000px;
        position:absolute; top:0px; left:0px; z-index: 2;
        display: flex; justify-content: center; align-items: center;
        box-shadow: 0px 1px 4px 0.5px hsla(0,0%,0%,70%);
        pointer-events: none;
    }
        
    .outlined-knob{
        border: 1px solid $secondary !important;
        height:13px !important; width:13px !important;
    }
</style>