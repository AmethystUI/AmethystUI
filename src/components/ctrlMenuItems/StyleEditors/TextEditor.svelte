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
        "lowercase": 0,
        "none": 1,
        "uppercase": 2,
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
        selectedOverride
    } from "../../../stores/collection";
    import type {
        color,
        typographyStyle
    } from "../../../types/general"

    import TypefaceFinder from "./Advanced/TypefaceFinder.svelte";
    import Dropdown from "./Basics/Dropdown.svelte";
    import MultiToggle, { textAlignment, textCasing } from "./Basics/MultiToggle.svelte";
    import MultiSelect, { textDecoration, typeFilters } from "./Basics/MultiSelect.svelte";

    import TextAreaInput from "./Basics/TextAreaInput.svelte";
    import Title from "./Basics/Title.svelte";
    import UnitInput from "./Basics/UnitInput.svelte";

    import { openColorPicker } from "./Advanced/ColorPickerOverlay.svelte";
    import { openFontPicker } from "./Advanced/FontPickerOverlay.svelte";
    
    export let currentParentWidth = 360;
    
    // reactive
        $: currentStyle = $selectedOverride === -1 ? $collection[$selectedComponent]?.style : $collection[$selectedComponent]?.styleOverrides[$selectedOverride]?.style;

    // document components
    let colorPreviewSquare:HTMLDivElement;

    // these variables just make the code look nicer
    let clr:color = initializeColorFromHSLA(0, 0, 100, 100); // default text color

    const initialFontRef: typographyStyle = {
        fontObj: {
            family: "system-ui",
            appearedName: "System UI",
            category: "sans-serif",
            variations: [400, 700],
            webSafe: true,
        },
        variation: 400,
        textDecorations: [],
        casing: "none",
        alignment: "left",
        size: {
            v: 14, u: "px"
        },
        lineHeight: {
            v: 100, u: "%"
        },
        tracking: {
            v: 0, u: "px"
        }
    }
    let fontRef = {...initialFontRef};

    let leadingContent: string = "";
    let trailingContent: string = "";
    let placeholder: string = "";

    // these variables determine which editors will be visible, based on whatever the current active styles are. Here for organization
    $: useText = $activeStyles.USETEXT;
    $: useLeadingContent = $activeStyles.leadingContent;
    $: useTrailingContent = $activeStyles.trailingContent;
    $: useContent = useLeadingContent || useTrailingContent;
    $: usePlaceholder = $activeStyles.placeholder;
    $: useTypefaceSettings = $activeStyles.typeStyle && $activeStyles.color;

    $: if(!!currentStyle && useText){ // Variable update listener. If the current style changes, then update the variables accordingly
        currentStyle["USETEXT"] = !!currentStyle["USETEXT"];

        // text color
        if(useTypefaceSettings){ // we're doing this so that we don't have to worry about accidentally setting properties for elements that shouldn't have this property
            if(!currentStyle.color) currentStyle.color = initializeColorFromHSLA(0, 0, 100, 100);
            clr = currentStyle.color;

            // typeface setup. We have to do some special initialization 
            if(!currentStyle.typeStyle){
                currentStyle.typeStyle = {...initialFontRef};
                fontRef = currentStyle.typeStyle;
            } else if (Object.keys(currentStyle.typeStyle).length !== Object.keys(fontRef).length) {
                for(let i = 0; i < Object.keys(currentStyle?.typeStyle ?? {}).length; i++){
                    const currentKey = Object.keys(currentStyle.typeStyle)[i];
                    fontRef[currentKey] = currentStyle.typeStyle[currentKey]; // update our default font object if there is some stuff in the current style already.
                }
                // initialize all values
                currentStyle.typeStyle = fontRef;
                fontRef = currentStyle.typeStyle;
            } else {
                fontRef = currentStyle.typeStyle;
            }
        }

        // initial text
        if(useLeadingContent){
            if(currentStyle.leadingContent === undefined) currentStyle.leadingContent = "";
            leadingContent = currentStyle.leadingContent;
        } if(useTrailingContent){
            if(currentStyle.trailingContent === undefined) currentStyle.trailingContent = "";
            trailingContent = currentStyle.trailingContent;
        }

        // initial place holder
        if(usePlaceholder){
            if(currentStyle.placeholder === undefined) currentStyle.placeholder = "";
            placeholder = currentStyle.placeholder;
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
    } from "../../../types/general";
    import { beautifiedFontName, getFontNameValue, standardizedFontName } from "../../../workers/pseudoWorkers/fonts";
    import { keepOpenOverlay } from "./Advanced/Overlay.svelte";
    import { initializeColorFromHSLA } from "../../../util/colorMaths";
    import { activeStyles } from "../../../stores/activeStyles";

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

    const updateTextContent = (evt:CustomEvent<any>, leading:boolean) => {
        if($selectedOverride !== -1){ // if no override is selected
            $collection[$selectedComponent]
            .styleOverrides[$selectedOverride]
            .style[`${leading ? "leadingContent" : "trailingContent"}`] = evt.detail.v;
        } else {
            $collection[$selectedComponent]
            .style[`${leading ? "leadingContent" : "trailingContent"}`] = evt.detail.v;
        }
    }

    const updatePlaceholder = (evt:CustomEvent<any>) => {
        if($selectedOverride !== -1){ // if no override is selected
            $collection[$selectedComponent].styleOverrides[$selectedOverride].style.placeholder = evt.detail.v;
        } else {
            $collection[$selectedComponent].style.placeholder = evt.detail.v;
        }
    }
</script>

{#if useText}
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
            {#if useContent}
                <Title name="Auxiliary Content"></Title>

                <div style="height: 1px; margin:0; padding:0"></div>

                <TextAreaInput name={"Leading Text"} placeHolder={"Lorem ipsum dolor sit amet."} v={leadingContent} hasMargin={false} sub={true} currentParenteWidth={currentParentWidth} on:updateValue={e => updateTextContent(e, true)}/>
                
                <TextAreaInput name={"Trailing Text"} placeHolder={"Lorem ipsum dolor sit amet."} v={trailingContent} hasMargin={false} sub={true} currentParenteWidth={currentParentWidth} on:updateValue={e => updateTextContent(e, false)}/>
            {/if}
            {#if usePlaceholder}
                <div class="spacer"></div>
                <!-- Placeholder -->
                <TextAreaInput name={"Placeholder"} placeHolder={"Lorem ipsum dolor sit amet."} v={placeholder} hasMargin={false} sub={false} currentParenteWidth={currentParentWidth} on:updateValue={updatePlaceholder}/>
            {/if}

            <!-- Typeface settings. All the text appearnace stuff goes here -->
            {#if useTypefaceSettings}
                <div class="spacer"></div>

                <!-- Appearance -->
                <Title name="Typography & Appearance"></Title>
                <!-- Text style and font chooser -->
                <section on:mousedown={keepOpenOverlay}>
                    <!-- Color picker -->
                    <div bind:this={colorPreviewSquare}
                        class="preview-square" style="background-color: hsla({clr.h}deg, {clr.s}%, {clr.l}%, {clr.a}%);"
                        on:mousedown={openColorOverlay}></div>
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
                    <UnitInput name={"Size"} sub={true} v={fontRef.size.v} u={fontRef.size.u} hasMargin={true} useFC={false} usePercent={true} on:updateValue={e => {
                        updateTextSizing("size", e)
                    }}/>
                    
                    <div style="min-height: 2px"></div>
                    
                    <UnitInput name={"Tracking"} minVal={-100} sub={true} v={fontRef.tracking.v} u={fontRef.tracking.u} hasMargin={true} useFC={false} on:updateValue={e => {
                        updateTextSizing("tracking", e)
                    }}/>
                    
                    <div style="min-height: 2px"></div>

                    <UnitInput name={"Line Height"} minVal={0} sub={true} v={fontRef.lineHeight.v} u={fontRef.lineHeight.u} hasMargin={false} useFC={false} usePercent={true} on:updateValue={e => {
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
            {/if}

            <div style="height:17px"></div>
        {/if}
    </main>
{/if}

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