<script lang="ts">
    import { collection, selectedComponent, selectedOverride } from "../../../stores/collection";
    import type { color } from "../../../types/general";
    import type { units, borderOutlineStyle } from "../../../types/general";

    import Slider from "./Basics/Slider.svelte";
    import UnitInput from "./Basics/UnitInput.svelte";
    import ColorPicker from "./Advanced/ColorPicker.svelte";
    import Dropdown from "./Basics/Dropdown.svelte";
    import { clearColorPickerRef, mainColorPickerData } from "../../../stores/colorPickerManager";
    import { initializeColorFromHSLA } from "../../../util/colorMaths";
    import { activeStyles } from "../../../stores/activeStyles";
    
    export let currentParentWidth = 360;
    
    // reactive
        $: currentStyle = $selectedOverride === -1 ? $collection[$selectedComponent]?.style : $collection[$selectedComponent]?.styleOverrides[$selectedOverride]?.style;

    let cOW = 0; let cOWu:units = "px"; // cBW = current outline width
    let cOFF = 0; let cOFFu:units = "px"; // cBW = current outline width

    let cBRT = 0; let cBRTu:units = "px"; // cBR = current outline radius
    let cBRR = 0; let cBRRu:units = "px"; // cBR = current outline radius
    let cBRB = 0; let cBRBu:units = "px"; // cBR = current outline radius
    let cBRL = 0; let cBRLu:units = "px"; // cBR = current outline radius
    let cBRAvg = 0;
    
    const initialColor = initializeColorFromHSLA(226, 88, 59, 100);;
    let clr:color = {...initialColor};

    // this has to be a subset of the borderOutlineStyle type set in $collection
    const possibleStyles:borderOutlineStyle[] = ["dotted", "dashed", "solid", "double", "groove", "ridge", "inset", "hidden"];

    let style:borderOutlineStyle = "solid";

    // these variables determine which editors will be visible, based on whatever the current active styles are. Here for organization
    $: useOutline = $activeStyles.USEOUTLINE;
    $: useWidth = $activeStyles.outlineWidth;
    $: useOffset = $activeStyles.outlineOffset;
    $: useRadius = $activeStyles.borderRadiusBottom || $activeStyles.borderRadiusLeft || $activeStyles.borderRadiusRight  || $activeStyles.borderRadiusTop;
    $: useColor = $activeStyles.outlineColor;
    
    $: useStyle = $activeStyles.outlineStyle;

    $: if(!!currentStyle && useOutline){ // these variables just make the code look nicer
        // use outline
        currentStyle["USEOUTLINE"] = !!currentStyle["USEOUTLINE"]; // boolean initialization weirdness
        // currentStyle["USEOUTLINE"] = true; // debugging force open

        // outline width
        if(useWidth){ // we're doing this so that we don't have to worry about accidentally setting properties for elements that shouldn't have this property
            if(!currentStyle["outlineWidth"]) currentStyle["outlineWidth"] = {v:2.5,u:"px"};
            cOW = currentStyle["outlineWidth"].v;
            cOWu = currentStyle["outlineWidth"].u;
        }

        // border radius (yes border radius also control the outline radius for some reason)
        if(useRadius){
            if(!currentStyle["borderRadiusTop"]) currentStyle["borderRadiusTop"] = {v:18,u:"pt"};
            cBRT = currentStyle["borderRadiusTop"].v;
            cBRTu = currentStyle["borderRadiusTop"].u;
            if(!currentStyle["borderRadiusRight"]) currentStyle["borderRadiusRight"] = {v:18,u:"pt"};
            cBRR = currentStyle["borderRadiusRight"].v;
            cBRRu = currentStyle["borderRadiusRight"].u;
            if(!currentStyle["borderRadiusBottom"]) currentStyle["borderRadiusBottom"] = {v:18,u:"pt"};
            cBRB = currentStyle["borderRadiusBottom"].v;
            cBRBu = currentStyle["borderRadiusBottom"].u;
            if(!currentStyle["borderRadiusLeft"]) currentStyle["borderRadiusLeft"] = {v:18,u:"pt"};
            cBRL = currentStyle["borderRadiusLeft"].v;
            cBRLu = currentStyle["borderRadiusLeft"].u;
            cBRAvg = (cBRT + cBRR + cBRB + cBRL) / 4;
        }

        // outline offset
        if(useOffset){
            if(!currentStyle["outlineOffset"]) currentStyle["outlineOffset"] = {v:2,u:"px"};
            cOFF = currentStyle["outlineOffset"].v;
            cOFFu = currentStyle["outlineOffset"].u;
        }

        // outline color
        if(useColor){
            if(!currentStyle["outlineColor"]) currentStyle["outlineColor"] = {...initialColor};
            clr = currentStyle["outlineColor"];
        }

        // outline style
        if(useStyle){
            if(!currentStyle["outlineStyle"]) currentStyle["outlineStyle"] = "solid"
            style = currentStyle["outlineStyle"];
        }
    }

    const toggleUseOutline = () => {
        if($selectedOverride !== -1){ // if no override is selected
            $collection[$selectedComponent].styleOverrides[$selectedOverride].style[`USEOUTLINE`] = !$collection[$selectedComponent].styleOverrides[$selectedOverride].style[`USEOUTLINE`]
        } else {
            $collection[$selectedComponent].style[`USEOUTLINE`] = !$collection[$selectedComponent].style[`USEOUTLINE`]
        }
    }

    const updateOutlineWidth = (evt:CustomEvent<any>) => {
        if($selectedOverride !== -1){ // if no override is selected
            let unit = evt.detail.u ?? $collection[$selectedComponent].styleOverrides[$selectedOverride].style.outlineWidth.u;
            $collection[$selectedComponent].styleOverrides[$selectedOverride].style.outlineWidth = {v: evt.detail.v, u: unit}
        } else {
            let unit = evt.detail.u ?? $collection[$selectedComponent].style.outlineWidth.u;
            $collection[$selectedComponent].style.outlineWidth = {v: evt.detail.v, u: unit}
        }

        updateGeneralAppearance();
    }
    const updateOutlineOffset = (evt:CustomEvent<any>) => {
        if($selectedOverride !== -1){ // if no override is selected
            let unit = evt.detail.u ?? $collection[$selectedComponent].styleOverrides[$selectedOverride].style.outlineOffset.u;
            $collection[$selectedComponent].styleOverrides[$selectedOverride].style["outlineOffset"] = {v: evt.detail.v, u: unit}
        } else {
            let unit = evt.detail.u ?? $collection[$selectedComponent].style["outlineOffset"].u;
            $collection[$selectedComponent].style["outlineOffset"] = {v: evt.detail.v, u: unit}
        }
        
        updateGeneralAppearance();
    }

    const updateGeneralAppearance = () => { // this function basically just tweak the width by 0.01. It makes sure that the outline gets updated in safari
        if($selectedOverride !== -1){ // if no override is selected
            $collection[$selectedComponent].styleOverrides[$selectedOverride].style["width"] = {
                v: $collection[$selectedComponent].styleOverrides[$selectedOverride].style["width"].v+0.01,
                u: $collection[$selectedComponent].styleOverrides[$selectedOverride].style["width"].u
            }
            setTimeout(() => {
                $collection[$selectedComponent].styleOverrides[$selectedOverride].style["width"] = {
                    v: $collection[$selectedComponent].styleOverrides[$selectedOverride].style["width"].v-0.01,
                    u: $collection[$selectedComponent].styleOverrides[$selectedOverride].style["width"].u
                }
            }, 1);
        } else {
            $collection[$selectedComponent].style["width"] = {
                v: $collection[$selectedComponent].style["width"].v+0.01,
                u: $collection[$selectedComponent].style["width"].u
            }
            setTimeout(() => {
                $collection[$selectedComponent].style["width"] = {
                    v: $collection[$selectedComponent].style["width"].v-0.01,
                    u: $collection[$selectedComponent].style["width"].u
                }
            }, 1);
        }
    }

    const updateBorderRadius = (evt:CustomEvent<any>, direction:string) => {
        if($selectedOverride !== -1){ // if no override is selected
            $collection[$selectedComponent].styleOverrides[$selectedOverride].style[`borderRadius${direction}`] = {v: evt.detail.v, u: evt.detail.u}
        } else {
            $collection[$selectedComponent].style[`borderRadius${direction}`] = {v: evt.detail.v, u: evt.detail.u}
        }
    }

    const updateBorderRadiusAll = (evt:CustomEvent<any>) => {
        if($selectedOverride !== -1){ // if no override is selected
            $collection[$selectedComponent].styleOverrides[$selectedOverride].style["borderRadiusTop"].v = evt.detail.v;
            $collection[$selectedComponent].styleOverrides[$selectedOverride].style["borderRadiusRight"].v = evt.detail.v;
            $collection[$selectedComponent].styleOverrides[$selectedOverride].style["borderRadiusBottom"].v = evt.detail.v;
            $collection[$selectedComponent].styleOverrides[$selectedOverride].style["borderRadiusLeft"].v = evt.detail.v;
        } else {
            $collection[$selectedComponent].style["borderRadiusTop"].v = evt.detail.v;
            $collection[$selectedComponent].style["borderRadiusRight"].v = evt.detail.v;
            $collection[$selectedComponent].style["borderRadiusBottom"].v = evt.detail.v;
            $collection[$selectedComponent].style["borderRadiusLeft"].v = evt.detail.v;    
        }
    }

    const updateStyle = (evt:CustomEvent<any>) => {
        if($selectedOverride !== -1){ // if no override is selected
            $collection[$selectedComponent].styleOverrides[$selectedOverride].style["outlineStyle"] = evt.detail.v;
        } else {
            $collection[$selectedComponent].style["outlineStyle"] = evt.detail.v;
        }
    }

    // update color picker based on if the shadow is enabled or not
    $: if(!currentStyle.USEOUTLINE && $mainColorPickerData.refName === "outlineColor"){
        // if the current style doesn't use this editor, clear ref
        clearColorPickerRef();
    }
</script>

{#if useOutline}
    <main class="no-drag">
        <!-- title of the editor -->
        <section id="title-container">
            <h1>Outline</h1>

            <section id="check-container">
                <input type="checkbox" checked={currentStyle.USEOUTLINE} on:click={toggleUseOutline}>
                <img src="./assets/icons/checkmark.svg" alt="" style="opacity: {currentStyle.USEOUTLINE ? "1" : "0"}">
            </section>
        </section>

        <!-- only show editing panel if border is enabled -->
        {#if currentStyle.USEOUTLINE}

            <!-- outline width -->
            {#if useWidth}
                <section>
                    <Slider name="Width" min={0} max={200} v={cOW} hasMargin={true} on:updateValue={updateOutlineWidth} currentParentWidth={currentParentWidth} colorRef={clr}/>
                    <UnitInput name="" v={cOW} u={cOWu} on:updateValue={evt => updateOutlineWidth(evt)} hasMargin={false} maxWidth={"120px"} minWidth={"70px"} useFC={false} sub={true}/>
                </section>

            {/if}
            
            <!-- offset -->
            {#if useOffset}
                <div class="spcaer"></div>
                
                <section>
                    <Slider name="Offset" min={0} max={100} v={cOFF} hasMargin={true} on:updateValue={updateOutlineOffset} currentParentWidth={currentParentWidth} colorRef={clr}/>
                    <UnitInput name="" v={cOFF} u={cOFFu} on:updateValue={evt => updateOutlineOffset(evt)} hasMargin={false} maxWidth={"120px"} minWidth={"70px"} useFC={false} sub={true}/>
                </section>
            {/if}

            <!-- border radius (only show when border section isn't open) -->
            {#if !currentStyle.USEBORDER && useRadius}
                <div class="spcaer"></div>
                
                <section>
                    <Slider name="Radius" min={0} max={200} v={cBRAvg} hasMargin={true} on:updateValue={updateBorderRadiusAll} currentParentWidth={currentParentWidth} colorRef={clr}/>
                    <UnitInput name="Top" v={cBRT} u={cBRTu} on:updateValue={evt => updateBorderRadius(evt, "Top")} hasMargin={true} maxWidth={"70px"} useFC={false} usePercent={true} sub={true}/>
                    <UnitInput name="Right" v={cBRR} u={cBRRu} on:updateValue={evt => updateBorderRadius(evt, "Right")} hasMargin={true} maxWidth={"70px"} useFC={false} usePercent={true} sub={true}/>
                    <UnitInput name="Bottom" v={cBRB} u={cBRBu} on:updateValue={evt => updateBorderRadius(evt, "Bottom")} hasMargin={true} maxWidth={"70px"} useFC={false} usePercent={true} sub={true}/>
                    <UnitInput name="Left" v={cBRL} u={cBRLu} on:updateValue={evt => updateBorderRadius(evt, "Left")} hasMargin={false} maxWidth={"70px"} useFC={false} usePercent={true} sub={true}/>
                </section>
            {/if}

            <!-- border color -->
            {#if useColor}
                <div class="spcaer"></div>

                <section>
                    <ColorPicker name="Color" propertyName={"Outline"} propertyRef={"outlineColor"} clr={clr} />
                </section>
            {/if}

            <!-- outline style -->
            {#if useStyle}
                <section>
                    <Dropdown name="Style" sub={false} hasMargin={true} v={style} possibleValues={possibleStyles} on:updateValue={e => updateStyle(e)}/>
                </section>
            {/if}
            
            <div style="height:7px"></div>
        {/if}
    </main>
{/if}

<style lang="scss">
    @import "../../../../public/guideline";
    
    main{
        border-bottom: 1px solid $primaryl3;
        padding: 13px 13px 0px 13px; width: calc(100% - 26px);

        #title-container{
            margin-bottom: 13px;
            display:flex; align-items:center; height:fit-content;

            h1{
                font-size: 18px;
                user-select: none; -webkit-user-select: none;
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
            align-items: flex-end;
            margin-bottom:10px;
        }

        img{
            filter: invert(1); opacity: 1;
        }
    }
</style>