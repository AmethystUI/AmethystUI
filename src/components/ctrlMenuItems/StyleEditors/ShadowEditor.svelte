<script lang="ts">
    import { collection, selectedComponent, selectedOverride } from "../../../stores/collection";
    import type { boxShadow, color } from "../../../types/general";
    import type { units } from "../../../types/general";

    import UnitInput from "./Basics/UnitInput.svelte";
    import { setX, setY, mainOverlayData } from "../../../stores/overlayStat";
    import { mainColorPickerData, clearColorPickerRef } from "../../../stores/colorPickerStat";
    
    import { openColorPicker } from "./Advanced/ColorPickerOverlay.svelte";
    import { keepOpenOverlay } from "./Advanced/Overlay.svelte";
    import { activeStyles } from "../../../stores/activeStyles";

    let indicatorOffset = 8.5;

    // reactive
        $: currentStyle = $selectedOverride === -1 ? $collection[$selectedComponent]?.style : $collection[$selectedComponent]?.styleOverrides[$selectedOverride]?.style;

    let shadows:boxShadow[] = [];
    // we don't have a color defined here because we're using muxBoxShadClr as a multiplexer

    // these variables determine which editors will be visible, based on whatever the current active styles are. Here for organization
    $: useShadow = $activeStyles.boxShadows && $activeStyles.USESHADOW; // only active when both are true. We want to make sure that box shadow is used if we want it to be used. A simple check for fish brained developers

    $: if(!!currentStyle && useShadow){ // these variables just make the code look nicer
        // use outline
        currentStyle["USESHADOW"] = !!currentStyle["USESHADOW"]; // boolean initialization weirdness
        // currentStyle["USESHADOW"] = true; // debugging force open

        // update shadows
        if(!currentStyle["boxShadows"]) currentStyle["boxShadows"] = [];
        shadows = currentStyle["boxShadows"];
    }

    const toggleUseShadow = () => {
        currentStyle["USESHADOW"] = !currentStyle["USESHADOW"];
        $collection = $collection;
    }

    const addNewShadow = () => {
        // turn useShadow on first
        currentStyle["USESHADOW"] = true;

        // add the new shadow to shadowList
        currentStyle["boxShadows"].push({
            x: {v:2, u:"px"},
            y: {v:2, u:"px"},
            radius: {v:5, u:"px"},
            color : {
                type : "hsl",
                r : 0, g : 0, b : 0,
                h : 0, s : 0, l : 0,
                a : 50, hex : "00000080"
            },
            grow : {v:0, u:"px"}
        })

        $collection = $collection;
    }
    const removeShadow = (id:number) => {
        currentStyle["boxShadows"] = [...shadows.slice(0,id), ...shadows.slice(id+1)];
        // update everything
        $collection = $collection;
        $mainColorPickerData = $mainColorPickerData;
        shadows = currentStyle["boxShadows"];

        let newID = Math.max(Math.min(demuxID, shadows.length-1), 0);

        if(shadows.length === 0) {
            clearColorPickerRef();
        } else {
            updateDemuxID(newID);
        }
    }


    // we have to add element and overlay tracking to make sure that when the element/override switches, we clear the color references along with the multiplex indexes
    let lastSelectedComponent = $selectedComponent;
    let lastSelectedOverride = $selectedOverride;
    
    
    $: if($selectedComponent !== undefined || $selectedOverride !== undefined){
        
        // during initialization, the last state trackers may be undefined. In that case, we do not want the code to execute
        if((lastSelectedComponent !== $selectedComponent || lastSelectedOverride !== $selectedOverride) && $mainColorPickerData.refName === "muxBoxShadClr"){
            clearColorPickerRef();
        }

        // updating last state. We always want this to run.
        lastSelectedComponent = $selectedComponent;
        lastSelectedOverride = $selectedOverride;
    }

    let demuxID = 0;
    let showEditorIndicator = false;
    let currentColor:color;

    const updateDemuxID = (demuxIndex:number) => {
        demuxID = demuxIndex;
        // grab the current color from the demuxID
        currentColor = shadows[demuxID].color;        
        
        // set mux color to target color. Because this is typescript, we're directly giving the color REFRENCE to the mux. So we don't have to write another funciton for demuxing
        currentStyle["muxBoxShadClr"] = currentColor;
    }

    // color updating. We have to use mutli-plexing for this task as the color picker only works with base level colors.
    let shadowContainer:HTMLElement;
    const openOverlay = (demuxIndex:number) => {
        // keepOpenOverlay();
        // update global demux index
        updateDemuxID(demuxIndex);

        // open picker (after the update if finished)
        openColorPicker("muxBoxShadClr", "Shadow", shadowContainer.children[demuxID], {
            trackContinuously:true,
            showInlineHSL: true
        });
    }

    const updateShadowProp = (attribute:string, value:number, unit:units, isBaseProp = true) => {
        if(isBaseProp) shadows[demuxID][attribute] = {v:value, u:unit}
        else shadows[demuxID][attribute] = {v:value, u:unit}
        $collection = $collection;
    }

    // update color picker based on if the shadow is enabled or not
    $: if(!currentStyle.USESHADOW && $mainColorPickerData.refName === "muxBoxShadClr"){
        // if the current style doesn't use shadow, clear ref
        clearColorPickerRef();
    }
    // if the picker visible and selects the shadow, we should show the indicator. This is true for all cases
    $: if((!!$mainOverlayData.visible || !!$mainOverlayData.dragLocked) && $mainColorPickerData.refName === "muxBoxShadClr" && shadows.length > 0){
        if(!showEditorIndicator) showEditorIndicator = true;
    } else {
        if(showEditorIndicator) showEditorIndicator = false;
    }
</script>

{#if useShadow}
    <main class="no-drag">
        <div id="editing-shadow-indicator" class={`${showEditorIndicator ? "visible" : "hidden"}`}
            style={`transform: translate3d(0px, ${60*demuxID - indicatorOffset}px, 0px)`}></div>

        <!-- title of the editor -->
        <section id="title-container">
            <h1>Shadows</h1>

            <section id="check-container">
                <input type="checkbox" checked={currentStyle.USESHADOW} on:click={toggleUseShadow}>
                <img src="./assets/icons/checkmark.svg" alt="" style="opacity: {currentStyle.USESHADOW ? "1" : "0"}">
            </section>

            <section id="add-container" on:click={addNewShadow} on:mousedown={keepOpenOverlay}>
                <img src="./assets/icons/plus.svg" alt="">
            </section>
        </section>

        <!-- only show editing panel if border is enabled -->
        {#if currentStyle.USESHADOW}
            <!-- show default text if shadow list length is 0 -->
            {#if shadows.length === 0}
                <p id="empty-holder">No shadows currently configured</p>
            {:else}
                <section bind:this={shadowContainer} id="shadow-container">
                    <!-- the list of shadows -->
                    {#each shadows as shadow, i (shadow)}
                        <!-- a single container -->
                        <section class="shadow-editor-container">
                            <!-- the color preview & button. Bind all elements that matches the demux ID. We can also use this feature to highlight the blocks or do something special with it -->
                            {#if i === demuxID}
                                <div class="color-preview">
                                    <div style={`background-color: rgba(${shadow.color.r}, ${shadow.color.g}, ${shadow.color.b}, ${shadow.color.a}%)`} on:mousedown={()=>{openOverlay(i)}}></div>
                                </div>
                            {:else}
                                <div class="color-preview">
                                    <div style={`background-color: rgba(${shadow.color.r}, ${shadow.color.g}, ${shadow.color.b}, ${shadow.color.a}%)`} on:mousedown={()=>{openOverlay(i)}}></div>
                                </div>
                            {/if}
                            
                            <UnitInput
                                name={"X"}
                                v={shadow.x.v} u={shadow.x.u}
                                minWidth={"30px"} maxWidth={"80px"}
                                align={"left"}
                                minVal={-100}
                                maxVal={100}
                                useFC={false}
                                textClrOverride={i === demuxID && showEditorIndicator ? "#fff" : ""}
                                on:updateValue={e=>{updateShadowProp("x", e.detail.v, e.detail.u)}}
                                on:focused={() => {updateDemuxID(i)}}
                                hasMargin={true} sub={true}/>
        
                            <UnitInput
                                name={"Y"}
                                v={shadow.y.v} u={shadow.y.u}
                                minWidth={"30px"} maxWidth={"80px"}
                                align={"left"}
                                minVal={-100}
                                maxVal={100}
                                useFC={false}
                                textClrOverride={i === demuxID && showEditorIndicator ? "#fff" : ""}
                                on:updateValue={e=>{updateShadowProp("y", e.detail.v, e.detail.u)}}
                                on:focused={() => {updateDemuxID(i)}}
                                hasMargin={true} sub={true}/>
                        
                            <UnitInput
                                name={"Blur"}
                                v={shadow.radius.v} u={shadow.radius.u}
                                minWidth={"30px"} maxWidth={"80px"}
                                align={"left"}
                                maxVal={100}
                                useFC={false}
                                textClrOverride={i === demuxID && showEditorIndicator ? "#fff" : ""}
                                on:updateValue={e=>{updateShadowProp("radius", e.detail.v, e.detail.u)}}
                                on:focused={() => {updateDemuxID(i)}}
        
                                hasMargin={true} sub={true}/>
    
                            <UnitInput
                                name={"Grow"}
                                v={shadow.grow.v} u={shadow.grow.u}
                                minWidth={"30px"} maxWidth={"80px"}
                                align={"left"}
                                minVal={-100}
                                maxVal={100}
                                useFC={false}
                                textClrOverride={i === demuxID && showEditorIndicator ? "#fff" : ""}
                                on:updateValue={e=>{updateShadowProp("grow", e.detail.v, e.detail.u, false)}}
                                on:focused={() => {updateDemuxID(i)}}
                                hasMargin={true} sub={true}/>
    
                            <button on:click={() => removeShadow(i)}>
                                <img src="./assets/icons/trash.svg" alt="">
                            </button>
                        </section>
                    {/each}
                </section>
                <div style="height:5px"></div>
            {/if}
        {/if}
    </main>
{/if}

<style lang="scss">
    @import "../../../../public/guideline";
    
    main{
        border-bottom: 1px solid $primaryl3;
        padding: 13px 13px 0px 13px; width: calc(100% - 26px);
        position: relative;

        #editing-shadow-indicator{
            position: absolute;
            top:47.5px; left:5px; margin:0;
            width: calc(100% - 10px); height:60px; border-radius: 7px;
            background-color: hsla(0deg,0%,100%,20%); z-index: -1;
            transition: transform 400ms $normal-ease-out, opacity 200ms ease;
            opacity:1;

            &.hidden{
                opacity:0;
            }
        }

        #shadow-container{
            flex-direction: column; justify-content: flex-start;
            overflow:hidden;
        }

        .shadow-editor-container{
            position: inline;
            width:100%; height:45px;
            display:flex; align-items:center; justify-content: flex-start;
            margin-bottom:15px;

            button{
                height:25px; width:fit-content;
                background-color: transparent; border: none; border-radius: 5px;
                transform: translate3d(0px, 10px, 0px);
                margin:0; cursor:pointer;

                &:hover{
                    background-color: hsl(0, 85%, 44%);
                    
                    img{
                        opacity:1;
                    }
                }

                img{
                    height:70%; opacity:0.5;
                }
            }

            .color-preview{
                width: 25px; height:25px; min-width: 25px; min-height:25px; border-radius: 4px;
                cursor: pointer;
                margin-right: 11px;
                position: relative;
                transform: translate3d(0px, 10px, 0px);

                background-image: url("../assets/svgs/checkerBoardPattern.svg");
                background-size: 50%;

                .activated{
                    transform: translate3d(0px, -100px, 0px) scale(100%) !important; pointer-events: all !important;
                }

                div{
                    width:100%; height:100%;
                    border-radius: inherit;
                }
            }
        }

        #title-container{
            margin: 0px 0px 13px 0px;
            display:flex; align-items:center; height:fit-content;
            position: relative;

            h1{
                font-size: 18px;
                user-select: none; -webkit-user-select: none;
            }

            #add-container{
                display:flex; align-items:center; justify-content: center; height:28px; width:28px;
                margin:0;
                position: absolute; right:0px;
                border-radius: 5px;

                transition: background-color 150ms ease;
                
                img{
                    height:20px;
                    filter: invert(1); opacity: 0.5;
                    transition: filter 150ms ease;
                }

                &:hover{
                    background-color: hsla(0,0%,100%,15%);
                    cursor: pointer;

                    img{
                        height:20.1px;
                        filter: invert(1); opacity: 0.8;
                    }
                }
            }

            #check-container{
                display:flex; align-items:center; height:100%;
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
            display: flex;
        }

        #empty-holder{
            font-size: 14px; width:100%; text-align: center;
            font-variation-settings: "wght" 500;
            color: $primaryl6;
            user-select: none; -webkit-user-select: none;
            margin: 10px 0px 17px 0px;
        }

        img{
            filter: invert(1); opacity: 1;
        }
    }
</style>