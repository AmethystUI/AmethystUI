<!-- This is the overlay module that can be used with the Overlay component -->

<!-- control functions for the overlay -->
<script lang="ts" context="module">
    import { openOverlayFrame } from "./Overlay.svelte";
    import { mainFontPickerData } from "../../../../stores/fontPickerStat";
    import { beautifiedFontName, fontObject, getFontNameValue, searchFontIndex } from "../../../../workers/pseudoWorkers/fonts";

    const componentID = crypto.randomUUID();

    const sessionStorageKey = "fonts";

    let fontListContainer: HTMLElement;
    let variationListContainer: HTMLElement;

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
            pickerDat.refName = propertyRef; // update color reference
            pickerDat.windowName = propertyName; // update color name
            return pickerDat;
        });

        // fetch font files (only if there is no font file)
        processFonts(sessionStorageKey).catch(err => {
            console.error("Failed to cache and load font > ", err);
        });
        
        // open the overlay frame
        openOverlayFrame(trackTarget, updateOverlaySize, componentID, props.trackContinuously, FontPickerOverlay);        
    }

    // attempt to load the fonts from Session storage
    const processFonts = (storageKey: string): Promise<void> => {
        // reset fontFailure in main font picker data
        mainFontPickerData.update(pickerDat => { pickerDat.fontLoadFailed = false; return pickerDat });

        return new Promise(async (res, rej) => {
            let rawFontData = sessionStorage.getItem(storageKey);
            // Try to fetch the font data up to 6 times with a 500ms interval each time (3s)
            for (let i = 0; i < 6 && !rawFontData; i++) {
                await new Promise((res) => setTimeout(res, 500));
                rawFontData = sessionStorage.getItem(storageKey);
            }
            // Reject the promise if the font data is still not fetched after 20 attempts
            if (!rawFontData) {
                // set fontFailure in main font picker data to true
                mainFontPickerData.update(pickerDat => { pickerDat.fontLoadFailed = true; return pickerDat });

                return rej(new Error("Cannot fetch font data from cache."));
            }
            // Try to parse the fetched font data as JSON and resolve the promise on success
            try {
                // update currentFontContent in main font picker data
                mainFontPickerData.update(pickerDat => {
                    pickerDat.currentFontContent = JSON.parse(rawFontData);
                    return pickerDat;
                });

                res();
            } catch (err) {
                // set fontFailure in main font picker data to true
                mainFontPickerData.update(pickerDat => { pickerDat.fontLoadFailed = true; return pickerDat });
                // Reject the promise if the fetched font data is not valid JSON
                rej(`JSON parse error > \n${err}`);
            }
        });
    };


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
    
    import { typographyStyle, collection, selectedComponent, selectedOverride } from "../../../../stores/collection";
    import { mainOverlayData } from "../../../../stores/overlayStat";
    import { get } from "svelte/store";
    import MultiSelect, { textDecoration, typeFilters } from "../Basics/MultiSelect.svelte";
    import MultiToggle, { textAlignment, textCasing } from "../Basics/MultiToggle.svelte";
    import UnitInput from "../Basics/UnitInput.svelte";

    import LoadingSpinner from "../../../ui/LoadingSpinner.svelte";
    import { onMount } from "svelte";

    $: name = $mainFontPickerData.windowName ?? "Fonts";
    $: fontsItalisized = !!fontRef ? fontRef.textDecorations.includes("italicize") : false;

    let fontRef:typographyStyle;

    // This try catch tries to retrieve the specified color reference from $collection.
    // If such reference exists, then we point our local colorRef to the $collection reference.
    // If such reference does not exist or no longer exists, we will just duplicate the value we currently have so that the value can persist on and not reset itself.
    // If there is any error during checking or assigning, we can just reset everything for safety.
    
    $: try { // only try to update the reference if the active elemnt ID matches the current one
        if ($mainFontPickerData.refName && $selectedComponent !== -1) {
            if ($selectedOverride !== -1) {
                fontRef = $collection[$selectedComponent].styleOverrides[$selectedOverride].style[$mainFontPickerData.refName]; // there is an overlay, so choose the overlay style
            } else {
                fontRef = $collection[$selectedComponent].style[$mainFontPickerData.refName];  // there is no overlay, so choose the root style
            }
        } else {
            fontRef = {...fontRef}; // persistence of fonts even after reference is cleared
        }
    } catch (error) {
        // if there is an error, just reset the overlay because it's probably due to some bad timing between the layers and the picker
        $mainFontPickerData.refName = undefined;
        $mainFontPickerData.windowName = "Typography";
    }

    // ====================== ON MOUNT ======================

    let currentFontIndex = 0;
    let typefaceNameContainers: HTMLDivElement[];

    onMount(async () => {
        // search for font first
        currentFontIndex = await searchFontIndex($mainFontPickerData.currentFontContent, fontRef.typeface);

        // set the scroll position to the selection in the font pickers
        if(!!fontListContainer) fontListContainer.scrollTop = currentFontIndex * 35 - 95;

        // start loading in the font previews
        typefaceNameContainers = Array.from( fontListContainer.getElementsByTagName("div") );

        // Increase preview loading load after the first render is complete
        // setTimeout(() => {
        //     previewLoad = 10;
        //     loadTypefacePreview(true);
        // }, 200)
    })

    let focusedTypefaceIndex;
    let previewLoad = 2000;
    const loadTypefacePreview = async (forceLoad?:boolean) => {
        // forceLoad = !!forceLoad; // initialize boolean
        // let scrollHeight = fontListContainer.scrollTop; // if no scroll height is specified, default to scroll top on the font container
        // let newFocusdTypefaceIndex = Math.round((scrollHeight + 95) / 35);

        // // we'll only load previews when the difference in scroll is larger than 5 
        // if(!forceLoad && (newFocusdTypefaceIndex === focusedTypefaceIndex || newFocusdTypefaceIndex < 0 || newFocusdTypefaceIndex > $mainFontPickerData.currentFontContent.length-1)) return;
        
        // // if we do want to load, we update the focus index
        // focusedTypefaceIndex = newFocusdTypefaceIndex;
        // // console.log($mainFontPickerData.currentFontContent[4]);

        // // load permitted amount of fonts
        // let newFontCSS:string = "";
        // for(
        //         let i = Math.max(focusedTypefaceIndex - previewLoad, 0);
        //         i < Math.min(focusedTypefaceIndex + previewLoad, $mainFontPickerData.currentFontContent.length-1);
        //         i++)
        //     {
        //     const currentFont:fontObject = $mainFontPickerData.currentFontContent[i];

        //     // if our current font is a web safe font or has already been loaded, we can skip it
        //     if(currentFont.webSafe) continue;

        //     if(document.querySelector("#custom-font-faces").innerHTML.indexOf(`custom-font${i}`) !== -1){
        //         // if the font is already loaded on the document, we can skip loading it and assign it directly.
        //         typefaceNameContainers[i].querySelector("p").style.fontFamily = `'custom-font${i}', Inter, system-ui, sans-serif`;
        //         continue;
        //     }

        //     // Find preview variation. Some fonts don't have a 400 style, so we have to find the cloesest match
        //     let previewVariation = 400;
        //     if(!currentFont.files[`${previewVariation}`]) {
        //         // if 400 style doesn't exist, find closest match
        //         let i = 0;
        //         for(i; !( currentFont.files[`${previewVariation+i}`] || currentFont.files[`${previewVariation-i}`] ); i+=100);

        //         // after the correct i is found, we assign the new style
        //         if(!!currentFont.files[`${previewVariation+i}`]){ // if the closest match is bigger, we'll use the thicker font
        //             previewVariation += i;
        //         } else { // Otherwise use the thinner one
        //             previewVariation -= i;
        //         }
        //     }
            
        //     // Add the HTML required for custom font previewing
        //     newFontCSS += `
        //         @font-face {
        //             font-family: 'custom-font${i}';
        //             src: url(${currentFont.files[`${previewVariation}`]})
        //         }
        //     `;
        //     // typefaceNameContainers[i].classList.add("preview-loaded");
        // }

        // // add font css
        // document.querySelector("#custom-font-faces").innerHTML += newFontCSS;
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

    const updateTypeface = (newIndex: number) => {
        // update selected font index
        currentFontIndex = newIndex;
        
        // fetch the typeface name from the index
        const newFontObject: fontObject = $mainFontPickerData.currentFontContent[newIndex];
        const newTypefaceName:string = newFontObject.family;
        fontRef.typeface = newTypefaceName; // set the new typeface name
        
        // check to see if the new typeface supports the current variation. If not, switch variation to the closest match
        const newTypefaceVariations:number[] = newFontObject.variations;
        const currentVariation:number = fontRef.variation; // not every font supports a regular variant, so we have to find the closest match
            
        // We can assume that every typeface is guarenteed to have at least 1 variation, so this while loop will not loop forever
        let i = 0;
        if(!newTypefaceVariations.includes(currentVariation)){
            for(i; !( newTypefaceVariations.includes(currentVariation-i) || newTypefaceVariations.includes(currentVariation+i) ); i+=100); // find closest match
        }

        // after left or right has been found, set the new variation
        if(newTypefaceVariations.includes(currentVariation-i)){ // if the closest match is smaller, we'll use the thinner font
            fontRef.variation = currentVariation - i;
        } else { // Otherwise use the thicker one
            fontRef.variation = currentVariation + i;
        }

        // update collection so that svelte can update the associated components
        $collection = $collection;
    }

    const updateVariation = (newVariation: number) => {
        fontRef.variation = newVariation;
        // update collection so that svelte can update the associated components
        $collection = $collection;
    }

    type sizeAttribute = "size" | "tracking" | "lineHeight"; // these correspond to the attributes thats stored in collection
    const updateTextSizing = (att: sizeAttribute, e: CustomEvent) => { // used for font size, tracking and line height only.
        fontRef[att].v = e.detail.v;
        fontRef[att].u = e.detail.u;
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
            <!-- Only show fonts if it's not an empty list -->
            {#if $mainFontPickerData.currentFontContent.length > 0}
                <!-- first section for all the main fonts -->
                <section bind:this={fontListContainer} id="font-list-container" on:scroll={() => loadTypefacePreview()}>
                    <!-- iterate through every font there is -->
                    {#each $mainFontPickerData.currentFontContent as fontObj, i (i)}
                        <div class="text-container {fontRef.typeface === fontObj.family ? "selected" : ""}"
                            on:click={() => updateTypeface(i)}>                            
                            <p class="no-drag">
                                {fontObj.family}
                            </p>
                        </div>
                    {/each}
                    <div style="height: 11px"></div>
                </section>

                <!-- section section for all the font variations avaiable -->
                <section bind:this={variationListContainer} id="variation-list-container">
                    <!-- Iterate through every variation for the chosen font -->
                    {#each $mainFontPickerData.currentFontContent[currentFontIndex].variations as variation}
                        <div class="text-container {fontRef.variation === variation ? "selected" : ""}"
                            on:click={() => updateVariation(variation)}
                            style="font-weight: {variation}; font-style: {fontsItalisized ? "italic" : ""}">

                            <p class="no-drag">{beautifiedFontName[getFontNameValue(variation, "name")]}</p>
                        </div>
                    {/each}
                    <div style="height: 11px"></div>
                </section>
                
            <!-- Show loading spinner if the content hasn't been loaded yet, but it hasn't failed yet -->
            {:else if !$mainFontPickerData.fontLoadFailed}
                <section id="font-load-err-container">
                    <LoadingSpinner />
                </section>
            <!-- Font load failure -->
            {:else}
                <section id="font-load-err-container">
                    <!-- Could not load font for some reason -->
                    <p>Failed to load fonts</p>
                    <button on:click={() => processFonts(sessionStorageKey)}>
                        Retry
                    </button>
                </section>
            {/if}
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

            <UnitInput name={"Size"} sub={true} v={fontRef.size.v} u={fontRef.size.u} hasMargin={false} on:updateValue={e => {
                updateTextSizing("size", e)
            }}/>
            
            <div style="min-height: 2px"></div>
            
            <UnitInput name={"Tracking"} minVal={-100} sub={true} v={fontRef.tracking.v} u={fontRef.tracking.u} hasMargin={false} on:updateValue={e => {
                updateTextSizing("tracking", e)
            }}/>
            
            <div style="min-height: 2px"></div>

            <UnitInput name={"Line Height"} minVal={-100} sub={true} v={fontRef.lineHeight.v} u={fontRef.lineHeight.u} hasMargin={false} on:updateValue={e => {
                updateTextSizing("lineHeight", e)
            }}/>
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

            #font-selection-container{
                width:100%;
                background-color: $primaryl0;
                border-radius: 6px; overflow: hidden;
                display: flex;

                #font-list-container{
                    border-right: 4px solid hsla(0deg, 0%, 0%, 30%);
                    height: 100%; min-width: 200px; max-width: 200px; width: 200px;
                }
                #variation-list-container{
                    height: 100%; width:100%; margin:0; // fill up the rest of the space
                }

                #font-list-container, #variation-list-container{
                    padding: 5px; margin: 0;
                    overflow-y: scroll;

                    .text-container{
                        width: calc(100% - 20px); height: 35px;
                        padding: 0px 10px 0px 10px; border-radius: 5px;
                        display: flex; align-items: center;
                        cursor: pointer;

                        &:hover{
                            &.selected{
                                background-color: $accentl2;
                            }

                            background-color: $primaryl3;
                            p{ color: white }
                        }

                        &.selected{
                            background-color: $accent;
                            p{ color: white }
                        }

                        p{
                            font-size: 14px;
                            width: 100%; height: fit-content;
                            white-space: nowrap; text-overflow: ellipsis; overflow: hidden;
                            color: $secondarys4;
                        }
                    }
                }

                #font-load-err-container{
                    width:100%; height:100%; margin: 0;
                    display: flex; justify-content: center; align-items: center; flex-direction: column;

                    p{
                        padding-top: 20px;
                        font-size: 14px;
                        color: $secondarys1;
                    }

                    button{
                        margin-top: 10px;
                        background: none;
                        padding: 5px 12px 5px 12px;
                        border: 1.5px solid $secondarys1;
                        border-radius: 6px;
                        color: $secondarys1;
                        font-size:  12px;
                        font-variation-settings: "wght" 600;
                        cursor: pointer;

                        &:hover{
                            background: $secondarys1;
                            color: $primary;
                        }
                    }
                }
            }

            section{
                width: fit-content; height:100%;
                margin-right: 7px;
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