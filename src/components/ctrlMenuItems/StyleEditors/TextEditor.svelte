<script lang="ts" context="module">
    /*
     * These are objects that maps the alignment values to a certain index.
     * It helps in easily identifying the position of the element on the component UI.
     * Every component might have a different indicies object. These are exclusive to this component.
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
</script>

<script lang="ts">
    import {
        collection,
        selectedComponent,
        selectedOverride,
        units,
        color,
        borderOutlineStyle,
        typographyStyle
    } from "../../../stores/collection";
    import TypefaceFinder from "./Advanced/TypefaceFinder.svelte";
    import Dropdown from "./Basics/Dropdown.svelte";
    import MultiToggle, { textAlignment, textCasing } from "./Basics/MultiToggle.svelte";
    import MultiSelect, { textDecoration, typeFilters } from "./Basics/MultiSelect.svelte";

    import TextAreaInput from "./Basics/TextAreaInput.svelte";
    import Title from "./Basics/Title.svelte";
    import UnitInput from "./Basics/UnitInput.svelte";
    import ValueInput from "./Basics/ValueInput.svelte";

    import { openColorPicker } from "./Advanced/ColorPickerOverlay.svelte";
    import { openFontPicker } from "./Advanced/FontPickerOverlay.svelte";
    import { onMount } from "svelte";
    
    export let currentParentWidth = 360;
    
    // reactive
    $: currentStyle = $selectedOverride === -1 ? $collection[$selectedComponent].style : $collection[$selectedComponent].styleOverrides[$selectedOverride].style;

    // document components
    let colorPreviewSquare:HTMLDivElement;
    let fontPickerTracker:HTMLDivElement;

    // these variables just make the code look nicer
    let clr:color = {type:"hsl", r:10, g:10, b:10, h:0, s:0, l:4, a:100, hex:"0a0a0a"} // default text color

    let fontRef: typographyStyle = {
        fontObj: {
            family: "system-ui",
            appearedName: "System UI",
            category: "sans-serif",
            variations: [400, 700],
            webSafe: true,
        },
        variation: 400,
        textDecorations: [],
        casing: "mix",
        alignment: "center",
        size: {
            v: 14, u: "px"
        },
        lineHeight: {
            v: 100, u: "%"
        },
        tracking: {
            v: 100, u: "%"
        }
    }

    $: if(!!currentStyle){ // Variable update listener. If the current style changes, then update the variables accordingly
        // text color
        if(!currentStyle["color"]) currentStyle["color"] = clr;
        clr = currentStyle["color"];

        // typeface
        if(!currentStyle["typeStyle"]) currentStyle["typeStyle"] = fontRef;
        fontRef = currentStyle["typeStyle"];
    }

    const updateStyle = (evt:CustomEvent<any>) => {
        if($selectedOverride !== -1){ // if no override is selected
            $collection[$selectedComponent].styleOverrides[$selectedOverride].style["outlineStyle"] = evt.detail.v;
        } else {
            $collection[$selectedComponent].style["outlineStyle"] = evt.detail.v;
        }
    }

    // open the color picker
    const openColorOverlay = () => {
        // open picker
        openColorPicker("color", "Text Color", colorPreviewSquare, {
            trackContinuously:true,
            showInlineHSL: true
        });
    }
    // open the font picker
    const openFontOverlay = () => {
        // open picker
        openFontPicker("typeStyle", "Typography", colorPreviewSquare, {
            trackContinuously:true,
        });
    }

    // ====================== UPDATE FUNCTIONS ======================

    import type {
        textAlignment as textAlignmentType,
        textCasing as textCasingType,
        textDecoration as textDecorationType
    } from "../../../stores/collection";
    import { beautifiedFontName, getFontNameValue, standardizedFontName } from "../../../workers/pseudoWorkers/fonts";
    import { keepOpenOverlay } from "./Advanced/Overlay.svelte";

    const toggleUseText = () => {
        if($selectedOverride !== -1){ // if no override is selected
            $collection[$selectedComponent].styleOverrides[$selectedOverride].style.USETEXT = !$collection[$selectedComponent].styleOverrides[$selectedOverride].style.USETEXT
        } else {
            $collection[$selectedComponent].style.USETEXT = !$collection[$selectedComponent].style.USETEXT
        }
    }

    const updateAlignment = (e:CustomEvent) => {
        const val = e.detail.value;
        // set the value of the alignment to the collection value
        fontRef.alignment = val;
        // update collection so that svelte can update the associated components
        $collection = $collection;
    }
    
    const updateCasing = (e:CustomEvent) => {
        const val = e.detail.value;
        // set the value of the casing to the collection value
        fontRef.casing = val;
        // update collection so that svelte can update the associated components
        $collection = $collection;
    }
    
    const updateDecoration = (e:CustomEvent) => {
        // set the value of the decorations accordingly
        fontRef.textDecorations = e.detail.values;
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

    const updateTextWeighting = (e:CustomEvent) => {
        // set the value of the weight accordingly
        fontRef.variation = getFontNameValue(standardizedFontName[e.detail.v], "value") as number;
        // update collection so that svelte can update the associated components
        $collection = $collection;
    }
</script>

<main class="no-drag">
    <!-- title of the editor -->
    <section id="title-container">
        <h1>Text</h1>

        <section id="check-container">
            <input type="checkbox" checked={currentStyle.USETEXT} on:click={toggleUseText}>
            <img src="./assets/icons/checkmark.svg" alt="" style="opacity: {currentStyle.USETEXT ? "1" : "0"}">
        </section>
    </section>

    <!-- only show editing panel if text is enabled -->
    {#if currentStyle.USETEXT}
        <!-- Content -->
        <TextAreaInput name={"Content"} placeHolder={"Lorem ipsum dolor sit amet."} v={""} hasMargin={false} sub={false} currentParenteWidth={currentParentWidth}/>
        <div class="spacer"></div>
        <!-- Placeholder -->
        <TextAreaInput name={"Placeholder"} placeHolder={"Lorem ipsum dolor sit amet."} v={""} hasMargin={false} sub={false} currentParenteWidth={currentParentWidth}/>

        <div class="spacer"></div>

        <!-- Appearance -->
        <Title name="Typography & Appearance"></Title>
        <!-- Text style and font chooser -->
        <section on:mousedown={keepOpenOverlay}>
            <!-- Color picker -->
            <div bind:this={colorPreviewSquare}
                class="preview-square" style="background-color: hsla({clr.h}deg, {clr.s}%, {clr.l}%, {clr.a}%);"
                on:mousedown={openColorOverlay}></div>
            <!-- Font finder -->
            <div bind:this={fontPickerTracker}></div>
            <TypefaceFinder name="Typeface" typeface={fontRef} hasMargin={true} sub={true} minWidth={""} widthGrowPerc={176} on:focused={openFontOverlay}/>
            <!-- Weight -->
            <Dropdown
                name="Weight"
                v={ beautifiedFontName[getFontNameValue(fontRef.variation, "name")] }
                possibleValues={ fontRef.fontObj.variations.map(v => beautifiedFontName[getFontNameValue(v, "name")]) }
                sub={true}
                hasMargin={false}
                on:updateValue={ updateTextWeighting }
                />
        </section>
        
        <div class="spacer"></div>
        
        <!-- Sizing control -->
        <section>
            <UnitInput name={"Size"} sub={true} v={fontRef.size.v} u={fontRef.size.u} hasMargin={true} on:updateValue={e => {
                updateTextSizing("size", e)
            }}/>
            
            <div style="min-height: 2px"></div>
            
            <UnitInput name={"Tracking"} minVal={-100} sub={true} v={fontRef.tracking.v} u={fontRef.tracking.u} hasMargin={true} on:updateValue={e => {
                updateTextSizing("tracking", e)
            }}/>
            
            <div style="min-height: 2px"></div>

            <UnitInput name={"Line Height"} minVal={-100} sub={true} v={fontRef.lineHeight.v} u={fontRef.lineHeight.u} hasMargin={false} on:updateValue={e => {
                updateTextSizing("lineHeight", e)
            }}/>

            <!-- Add later for variable fonts -->
            <!-- <ValueInput name={"Weight"} v={0} sub={true} hasMargin={false} align={"center"} alignTitle={"left"}/> -->
        </section>

        <div class="spacer"></div>

        <!-- Alignment control -->
        <MultiToggle elements={textAlignment} selection={alignmentIndices[fontRef.alignment]}
            name={"Alignment"} sub={true} width={currentParentWidth-27} height={25} radius={4} iconSize={18}
            on:valueChange={updateAlignment}/>

        <div class="spacer"></div>

        <!-- Casing control -->
        <MultiToggle elements={textCasing} selection={casingIndices[fontRef.casing]}
            name={"Text Casing"} sub={true} width={currentParentWidth-27} height={25} radius={4} iconSize={18}
            on:valueChange={updateCasing}/>

        <div class="spacer"></div>

        <!-- Decor control -->
        <MultiSelect elements={textDecoration} selections={fontRef.textDecorations.map(i => decorationIndices[i])}
            name={"Decoration"} sub={true} width={currentParentWidth-27} height={25} radius={4} iconSize={18}
            on:valueChange={updateDecoration}/>

        <div style="height:17px"></div>
    {/if}
</main>

<style lang="scss">
    @import "./public/guideline";
    
    main{
        border-bottom: 1px solid $primaryl3;
        padding: 13px 13px 0px 13px; width: calc(100% - 26px);

        .preview-square{
            height: 25px; width:25px; border-radius: 4px;
            min-height: 25px; min-width:25px;
            cursor:pointer;
            margin-right: 10px;
        }

        #title-container{
            margin: 0px 0px 13px 0px;
            display:flex; align-items:center; height:fit-content;

            h1{
                font-size: 18px;
                color: 1px solid $secondarys2;
                user-select: none; -webkit-user-select: none;
            }

            #check-container{
                display:flex; align-items:center; height:100%; transform: translateY(-0.5px);
                margin:0;
                position: relative;

                img{
                    position:absolute;
                    height:75%; width:75%;
                    top:calc(50% + 0.75px); left:calc(50% + 7.25px); transform: translate(-50%, -50%);
                    pointer-events: none;
                }

                input{
                    /* hide default style */
                    -webkit-appearance: none;
                    appearance: none;
                    background: $primaryl1;
                    
                    height:15px; width:15px;
                    border-radius: 3px;
        
                    margin: 2px 0px 0px 15px;
                    border: 1.5px solid $primaryl5;
        
                    &:checked{
                        background: $accent;
                        border:none;
                    }
                }
            }
        }

        section{
            display: flex; flex-direction: row; align-items: flex-end;
        }

        .spacer{
            height:7px;
        }

        img{
            filter: invert(1); opacity: 1;
        }
    }
</style>