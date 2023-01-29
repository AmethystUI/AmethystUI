<!-- This is the overlay module that can be used with the Overlay component -->

<!-- control functions for the overlay -->
<script lang="ts" context="module">
    import { openOverlayFrame } from "./Overlay.svelte";
    import { mainFontPickerData } from "../../../../stores/fontPickerStat";

    /**
     * Opens the color picker as well as the overlay frame and sets the color reference and name.
     * 
     * @param {string} propertyRef - The color reference to set.
     * @param {string} propertyName - The name of the color reference.
     * @param {HTMLElement} trackTarget - The element to track positionally. Tracking behavior is determined by props.showInlineHSL
     * @property {boolean} trackContinuously - Whether to track the element continuously (Default true).
     * @property {boolean} showInlineHSL - Whether to show the inline HSL values  (Default false).
     */
    export function openFontPicker(propertyRef:string, propertyName:string, trackTarget: HTMLElement | Element, props={
        trackContinuously: true
    }){
        // setColorPickerRef(propertyRef); // set the color reference
                                    
        mainFontPickerData.update(pickerDat => { // update the picker
            pickerDat.fontRefName = propertyRef; // update color reference
            pickerDat.fontName = propertyName; // update color name
            return pickerDat;
        });

        // open the overlay frame
        openOverlayFrame(trackTarget, updateOverlaySize, props.trackContinuously, FontPickerOverlay);        
    }

    // ======================== NON EXPORTABLES ========================

    // track if drag is locked or not to update our overlay sizing. We only want to update something when it's necessary
    // also track visible because hiding and showing it is weird
    let dragLocked = get(mainOverlayData).dragLocked;
    let lastDragLocked = get(mainOverlayData).dragLocked;
    let visible = get(mainOverlayData).visible;
    let lastVisible = get(mainOverlayData).visible;

    let mainContainer:HTMLElement;
    let mainTitleContainer:HTMLElement;

    // these configure the sizing of the window. Manually configure them for now cuz I can't be bothered to write detection code
    let normalOverlayWidth = 650;
    let normalOverlayHeight = 297;
    let titleHeight = 25;

    let targetHeight = normalOverlayHeight;
    let targetWidth = normalOverlayHeight;
    let targetCursorOffset = 0;

    let globalContentYOffset = 13;
    let targetYOffset = globalContentYOffset;
    let contentYOffset = tweened(targetYOffset, {
        duration: 500,
		easing: cubicOut
    }); // controls how much the content is moved down. Update with height changes

    // UI COMPONENT CONSTANTS

    import type {
        textAlignment as textAlignmentType,
        textCasing as textCasingType,
        textDecoration as textDecorationType
    } from "../../../../stores/collection";

    /**
     * This is an object that maps the alignment values to a certain index.
     * It helps in easily identifying the position of the element on the component UI.
     * Every component might have a different alignmentIndicies object. This one is exclusive to this component.
     */
    const alignmentIndices: { [K in textAlignmentType]: number } = {
        "left": 0,
        "center": 1,
        "right": 2,
        "justify": 3,
    };
    const casingIndices: { [K in textCasingType]: number } = {
        "lower": 0,
        "mix": 1,
        "upper": 2,
    };
    const decorationIndices: { [K in textDecorationType]: number } = {
        "italicize": 0,
        "underline": 1,
        "strike": 2,
    };

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
            if(!!dragLocked){ // how to update the overlay when it's dragged out
                targetHeight = normalOverlayHeight + titleHeight;
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
    
            // update values
            mainOverlayData.update(overlayDat => {
                overlayDat.h = targetHeight;
                overlayDat.cursorOffsetY = targetCursorOffset;
                return overlayDat;
            });
            contentYOffset.set(targetYOffset);
    
            lastDragLocked = dragLocked;
            lastVisible = visible;
        }, 0);
    }
</script>

<!-- Fontpicker overlay backend -->
<script lang="ts">
    import { tweened } from 'svelte/motion';
	import { cubicOut } from 'svelte/easing';
    import FontPickerOverlay from "./FontPickerOverlay.svelte"; // this import causes circular dependency warning in the compiler, but it works for now. It might be an issue in the future, so keep an eye out on this line.
    
    import { typographyStyle, collection } from "../../../../stores/collection";
    import { mainOverlayData } from "../../../../stores/overlayStat";
    import { get } from "svelte/store";
    import MultiSelect, { textDecoration, typeFilters } from "../Basics/MultiSelect.svelte";
    import MultiToggle, { textAlignment, textCasing } from "../Basics/MultiToggle.svelte";
    import UnitInput from "../Basics/UnitInput.svelte";

    $: name = $mainFontPickerData.fontName ?? "Fonts";

    let fontRef:typographyStyle;

    // This try catch tries to retrieve the specified color reference from $collection.
    // If such reference exists, then we point our local colorRef to the $collection reference.
    // If such reference does not exist or no longer exists, we will just duplicate the value we currently have so that the value can persist on and not reset itself.
    // If there is any error during checking or assigning, we can just reset everything for safety.
    
    try {
        if ($mainFontPickerData.fontRefName && $mainOverlayData.elementNumber !== -1) {
            if ($mainOverlayData.overrideNumber !== -1) {
                fontRef = $collection[$mainOverlayData.elementNumber].styleOverrides[$mainOverlayData.overrideNumber].style[$mainFontPickerData.fontRefName]; // there is an overlay, so choose the overlay style
            } else {
                fontRef = $collection[$mainOverlayData.elementNumber].style[$mainFontPickerData.fontRefName];  // there is no overlay, so choose the root style
            }
        } else {
            fontRef = {...fontRef}; // persistence of color even after reference is cleared
        }
    } catch (error) {
        // if there is an error, just reset the overlay because it's probably due to some bad timing between the layers and the picker
        $mainOverlayData.elementNumber = -1;
        $mainOverlayData.overrideNumber = -1;
        $mainFontPickerData.fontRefName = undefined;
        $mainFontPickerData.fontName = "Typography";
    }

    // ====================== UPDATE FUNCTIONS ======================
    
    const updateAlignment = (e:CustomEvent) => {
        const val = e.detail.value;
        // set the value of the alignment to the collection value
        fontRef.alignment = val;
        // update collection so that svelte can update the associated components
        $collection = $collection;
    }

    const updateCasing = (e:CustomEvent) => {
        const val = e.detail.value;
        // set the value of the alignment to the collection value
        fontRef.casing = val;
        // update collection so that svelte can update the associated components
        $collection = $collection;
    }

    const updateDecoration = (e:CustomEvent) => {
        const vals:textDecorationType[] = e.detail.values;
        // set the value of the decorations accordingly
        fontRef.textDecorations = e.detail.values;
        // update collection so that svelte can update the associated components
        $collection = $collection;
    }
</script>

<!-- Accessories -->

<section bind:this={mainTitleContainer} id="snapped-title-container" class="hidden" style={
    `transform: translate3d(0px, -${100 + titleHeight}px, 0px)`
}>
    <h6>{name}</h6>
</section>

<!-- Main content (on the top) -->
<main bind:this={mainContainer} style="transform:translate3d(0px, {$contentYOffset}px, 0px)">
    <!-- top main selection container -->
    <section id="top-selector-container">
        <!-- font filter cotainer -->
        <section style="transform: translate3d(0px,-5px,0px)">
            <MultiSelect elements={typeFilters} alignedHorizontally={false} align={"left"} showAlt={true}
            name={""} sub={true} width={130} height={231} radius={6} iconSize={24} iconMargin={12}/>
        </section>

        <!-- font selection container -->
        <section id="font-selection-container">

        </section>

        <!-- font attribute container -->
        <section id="font-attribute-container" style="transform: translate3d(0px,-5px,0px)">
            <!-- Decoration (underline, italisize, etc...) -->
            <MultiSelect elements={textDecoration} selections={fontRef.textDecorations.map(i => decorationIndices[i])}
            name={""} sub={true} width={140} height={26} radius={6} iconSize={19} iconMargin={0}
            on:valueChange={updateDecoration}/>
            
            <div style="min-height: 2px"></div>

            <!-- Casing -->
            <MultiToggle elements={textCasing} selection={casingIndices[fontRef.casing]}
            name={""} sub={true} width={140} height={26} radius={6} iconSize={19}
            on:valueChange={updateCasing}/>

            <div style="min-height: 2px"></div>
            
            <!-- Alignment -->
            <MultiToggle elements={textAlignment} selection={alignmentIndices[fontRef.alignment]}
            name={""} sub={true} width={140} height={26} radius={6} iconSize={19}
            on:valueChange={updateAlignment}/>

            <div style="min-height: 2px"></div>

            <UnitInput name={"Size"} sub={true} v={0} hasMargin={false} />
            
            <div style="min-height: 2px"></div>
            
            <UnitInput name={"Tracking"} sub={true} v={0} hasMargin={false} />
            
            <div style="min-height: 2px"></div>

            <UnitInput name={"Line Height"} sub={true} v={0} hasMargin={false} />

            <!-- <section id="preview-text" class="no-drag">
                <p class="preview-title">
                    Preview
                </p>
                <p class="preview-body" style={`
                `}>
                    As he was to begin his journey too early on the morrow to see any of the family, the ceremony of leave-taking was performed when the ladies moved for the night; and Mrs. Bennet, with great politeness and cordiality, said how happy they should be to see him at Longbourn again, whenever his engagements might allow him to visit them.
                </p>

                <div id="gradient"></div>
            </section> -->
        </section>
    </section>
    <p id="copyright-msg" class="no-drag">
        Web fonts provided by Google Fonts
        &ensp;⎸&ensp;
        <a href="https://developers.google.com/fonts/faq/privacy" target="_blank">Privacy</a>
        </p>
</main>

<style lang="scss">
    @import "./public/guideline";
    
    main{
        display: flex; justify-content: center; align-items: center; flex-direction: column;

        #top-selector-container{
            height:232px; width:632px;
            display: flex;

            section{
                width: fit-content; height:100%;
                margin-right: 7px;
            }

            #font-selection-container{
                width:100%;
                background-color: $primary;
                opacity: 0.7;
                border-radius: 6px;
            }

            #font-attribute-container{
                margin:0;
                display: flex; flex-direction: column;
            }
        }

        #copyright-msg{
            margin-top: 6px;
            font-size: 12px;
            color: $secondarys6;
            font-variation-settings: "wght" 400;

            a{
                color: $secondarys6;
            }
        }
    }

    #snapped-title-container{
        position: absolute; width:100%;
        // we have to use the flex box method because if we don't there's a bug where the text misaligned from time to time
        display:flex; justify-content: center;
        transition: opacity 200ms linear;
        transition-delay: 100ms;
        opacity:1; pointer-events: none;
        
        &.hidden{ opacity:0 }

        h6{
            font-weight: 700;
            user-select: none; -webkit-user-select: none;
        }
    }
</style>