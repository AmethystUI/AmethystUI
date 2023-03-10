<script lang="ts">
    import { collection, selectedComponent, selectedOverride } from "../../../stores/collection";
    import type { color } from "../../../types/general";
    import type { units, borderOutlineStyle } from "../../../types/general";

    import Slider from "./Basics/Slider.svelte";
    import UnitInput from "./Basics/UnitInput.svelte";
    import ColorPicker from "./Advanced/ColorPicker.svelte";
    import Dropdown from "./Basics/Dropdown.svelte";
    import Title from "./Basics/Title.svelte";
    import { clearColorPickerRef, mainColorPickerData } from "../../../stores/colorPickerStat";
    import { initializeColorFromHSLA } from "../../../util/colorMaths";
    import { activeStyles } from "../../../stores/activeStyles";
    
    export let currentParentWidth = 360;
    
    // reactive
        $: currentStyle = $selectedOverride === -1 ? $collection[$selectedComponent]?.style : $collection[$selectedComponent]?.styleOverrides[$selectedOverride]?.style;

    let cBWT = 0; let cBWTu:units = "px"; // cBW = current border width
    let cBWR = 0; let cBWRu:units = "px"; // cBW = current border width
    let cBWB = 0; let cBWBu:units = "px"; // cBW = current border width
    let cBWL = 0; let cBWLu:units = "px"; // cBW = current border width
    let cBWAvg = 0;

    let cBRT = 0; let cBRTu:units = "px"; // cBR = current border radius
    let cBRR = 0; let cBRRu:units = "px"; // cBR = current border radius
    let cBRB = 0; let cBRBu:units = "px"; // cBR = current border radius
    let cBRL = 0; let cBRLu:units = "px"; // cBR = current border radius
    let cBRAvg = 0;

    const initialColor:color = initializeColorFromHSLA(0, 0, 100, 100);
    let clr:color = {...initialColor};

    // this has to be a subset of the borderOutlineStyle type set in $collection
    const possibleStyles:borderOutlineStyle[] = ["dotted", "dashed", "solid", "double", "groove", "ridge", "inset", "hidden"];

    let styleTop:borderOutlineStyle = "solid";
    let styleRight:borderOutlineStyle = "solid";
    let styleBottom:borderOutlineStyle = "solid";
    let styleLeft:borderOutlineStyle = "solid";
    let syncStyle = true;

    // these variables determine which editors will be visible, based on whatever the current active styles are. Here for organization
    $: useBorder = $activeStyles.USEBORDER;
    $: useWidth = $activeStyles.borderWidthBottom || $activeStyles.borderWidthLeft || $activeStyles.borderWidthRight  || $activeStyles.borderWidthTop;
    $: useRadius = $activeStyles.borderRadiusBottom || $activeStyles.borderRadiusLeft || $activeStyles.borderRadiusRight  || $activeStyles.borderRadiusTop;
    $: useColor = $activeStyles.borderColor;
    
    $: useStyleBottom = $activeStyles.borderStyleBottom;
    $: useStyleTop = $activeStyles.borderStyleTop;
    $: useStyleLeft = $activeStyles.borderStyleLeft;
    $: useStyleRight = $activeStyles.borderStyleRight;

    $: if(!!currentStyle && useBorder){ // these variables just make the code look nicer
        // use border
        currentStyle["USEBORDER"] = !!currentStyle["USEBORDER"]; // boolean initialization weirdness
        // currentStyle["USEBORDER"] = true; // debugging force open

        // border width
        if(useWidth){ // we're doing this so that we don't have to worry about accidentally setting properties for elements that shouldn't have this property
            if(!currentStyle["borderWidthTop"]) currentStyle["borderWidthTop"] = {v:2,u:"px"};
            cBWT = currentStyle["borderWidthTop"].v;
            cBWTu = currentStyle["borderWidthTop"].u;
            if(!currentStyle["borderWidthRight"]) currentStyle["borderWidthRight"] = {v:2,u:"px"};
            cBWR = currentStyle["borderWidthRight"].v;
            cBWRu = currentStyle["borderWidthRight"].u;
            if(!currentStyle["borderWidthBottom"]) currentStyle["borderWidthBottom"] = {v:2,u:"px"};
            cBWB = currentStyle["borderWidthBottom"].v;
            cBWBu = currentStyle["borderWidthBottom"].u;
            if(!currentStyle["borderWidthLeft"]) currentStyle["borderWidthLeft"] = {v:2,u:"px"};
            cBWL = currentStyle["borderWidthLeft"].v;
            cBWLu = currentStyle["borderWidthLeft"].u;
            cBWAvg = (cBWT + cBWR + cBWB + cBWL) / 4;
        }

        // border radius
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

        // border color
        if(useColor){
            if(!currentStyle["borderColor"]) currentStyle["borderColor"] = {...initialColor};
            clr = currentStyle["borderColor"];
        }

        // border style
        if(useStyleTop){
            if(!currentStyle["borderStyleTop"]) currentStyle["borderStyleTop"] = styleTop;
            styleTop = currentStyle["borderStyleTop"];
        } if(useStyleRight){
            if(!currentStyle["borderStyleRight"]) currentStyle["borderStyleRight"] = styleRight;
            styleRight = currentStyle["borderStyleRight"];
        } if(useStyleBottom){
            if(!currentStyle["borderStyleBottom"]) currentStyle["borderStyleBottom"] = styleBottom;
            styleBottom = currentStyle["borderStyleBottom"];
        } if(useStyleLeft){
            if(!currentStyle["borderStyleLeft"]) currentStyle["borderStyleLeft"] = styleLeft;
            styleLeft = currentStyle["borderStyleLeft"];
        }
    }

    const toggleUseBorder = () => {
        if($selectedOverride !== -1){ // if no override is selected
            $collection[$selectedComponent].styleOverrides[$selectedOverride].style[`USEBORDER`] = !$collection[$selectedComponent].styleOverrides[$selectedOverride].style[`USEBORDER`]
        } else {
            $collection[$selectedComponent].style[`USEBORDER`] = !$collection[$selectedComponent].style[`USEBORDER`]
        }
    }

    const updateBorderWidth = (evt:CustomEvent<any>, direction:string) => {
        if($selectedOverride !== -1){ // if no override is selected
            $collection[$selectedComponent].styleOverrides[$selectedOverride].style[`borderWidth${direction}`] = {v: evt.detail.v, u: evt.detail.u}
        } else {
            $collection[$selectedComponent].style[`borderWidth${direction}`] = {v: evt.detail.v, u: evt.detail.u}
        }
    }
    const updateBorderWidthAll = (evt:CustomEvent<any>) => {
        if($selectedOverride !== -1){ // if no override is selected
            $collection[$selectedComponent].styleOverrides[$selectedOverride].style.borderWidthTop.v = evt.detail.v;
            $collection[$selectedComponent].styleOverrides[$selectedOverride].style.borderWidthRight.v = evt.detail.v;
            $collection[$selectedComponent].styleOverrides[$selectedOverride].style.borderWidthBottom.v = evt.detail.v;
            $collection[$selectedComponent].styleOverrides[$selectedOverride].style.borderWidthLeft.v = evt.detail.v;
        } else {
            $collection[$selectedComponent].style.borderWidthTop.v = evt.detail.v;
            $collection[$selectedComponent].style.borderWidthRight.v = evt.detail.v;
            $collection[$selectedComponent].style.borderWidthBottom.v = evt.detail.v;
            $collection[$selectedComponent].style.borderWidthLeft.v = evt.detail.v;    
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
            $collection[$selectedComponent].styleOverrides[$selectedOverride].style.borderRadiusTop.v = evt.detail.v;
            $collection[$selectedComponent].styleOverrides[$selectedOverride].style.borderRadiusRight.v = evt.detail.v;
            $collection[$selectedComponent].styleOverrides[$selectedOverride].style.borderRadiusBottom.v = evt.detail.v;
            $collection[$selectedComponent].styleOverrides[$selectedOverride].style.borderRadiusLeft.v = evt.detail.v;
        } else {
            $collection[$selectedComponent].style.borderRadiusTop.v = evt.detail.v;
            $collection[$selectedComponent].style.borderRadiusRight.v = evt.detail.v;
            $collection[$selectedComponent].style.borderRadiusBottom.v = evt.detail.v;
            $collection[$selectedComponent].style.borderRadiusLeft.v = evt.detail.v;    
        }
    }

    const updateStyle = (evt:CustomEvent<any>, dir:string) => {
        if($selectedOverride !== -1){ // if no override is selected
            if(syncStyle){ // synchronize all styles
                $collection[$selectedComponent].styleOverrides[$selectedOverride].style.borderStyleLeft = evt.detail.v;
                $collection[$selectedComponent].styleOverrides[$selectedOverride].style.borderStyleTop = evt.detail.v;
                $collection[$selectedComponent].styleOverrides[$selectedOverride].style.borderStyleRight = evt.detail.v;
                $collection[$selectedComponent].styleOverrides[$selectedOverride].style.borderStyleBottom = evt.detail.v;
            } else {
                $collection[$selectedComponent].styleOverrides[$selectedOverride].style[`borderStyle${dir}`] = evt.detail.v;
            }
        } else {
            if(syncStyle){ // synchronize all styles
                $collection[$selectedComponent].style.borderStyleLeft = evt.detail.v;
                $collection[$selectedComponent].style.borderStyleTop = evt.detail.v;
                $collection[$selectedComponent].style.borderStyleRight = evt.detail.v;
                $collection[$selectedComponent].style.borderStyleBottom = evt.detail.v;
            } else {
                $collection[$selectedComponent].style[`borderStyle${dir}`] = evt.detail.v;
            }
        }
    }
    
    // update color picker based on if the shadow is enabled or not
    $: if(!currentStyle.USEBORDER && $mainColorPickerData.refName === "borderColor"){
        // if the current style doesn't use this editor, clear ref
        clearColorPickerRef();
    }


    const updateStyleSyncing = () => {
        syncStyle = !syncStyle; // update link overflow

        if(!syncStyle) return;

        if($selectedOverride !== -1){ // if no override is selected
            const topStyle = $collection[$selectedComponent].styleOverrides[$selectedOverride].style.borderStyleTop;
            $collection[$selectedComponent].styleOverrides[$selectedOverride].style.borderStyleLeft = topStyle;
            $collection[$selectedComponent].styleOverrides[$selectedOverride].style.borderStyleRight = topStyle;
            $collection[$selectedComponent].styleOverrides[$selectedOverride].style.borderStyleBottom = topStyle;
        } else{
            const topStyle = $collection[$selectedComponent].style.borderStyleTop;
            $collection[$selectedComponent].style.borderStyleLeft = topStyle;
            $collection[$selectedComponent].style.borderStyleRight = topStyle;
            $collection[$selectedComponent].style.borderStyleBottom = topStyle;
        }
    }
</script>

{#if useBorder}
    <main class="no-drag">
        <!-- title of the editor -->
        <section id="title-container">
            <h1>Border</h1>

            <section id="check-container">
                <input type="checkbox" checked={currentStyle.USEBORDER} on:click={toggleUseBorder}>
                <img src="./assets/icons/checkmark.svg" alt="" style="opacity: {currentStyle.USEBORDER ? "1" : "0"}">
            </section>
        </section>

        <!-- only show editing panel if border is enabled -->
        {#if currentStyle.USEBORDER}

            <!-- width & height -->
            {#if useWidth}
                <section>
                    <Slider name="Width" min={0} max={200} v={cBWAvg} hasMargin={true} on:updateValue={updateBorderWidthAll} currentParentWidth={currentParentWidth} colorRef={clr}/>
                    <UnitInput name="Top" v={cBWT} u={cBWTu} on:updateValue={evt => updateBorderWidth(evt, "Top")} hasMargin={true} maxWidth={"70px"} useFC={false} sub={true}/>
                    <UnitInput name="Right" v={cBWR} u={cBWRu} on:updateValue={evt => updateBorderWidth(evt, "Right")} hasMargin={true} maxWidth={"70px"} useFC={false} sub={true}/>
                    <UnitInput name="Bottom" v={cBWB} u={cBWBu} on:updateValue={evt => updateBorderWidth(evt, "Bottom")} hasMargin={true} maxWidth={"70px"} useFC={false} sub={true}/>
                    <UnitInput name="Left" v={cBWL} u={cBWLu} on:updateValue={evt => updateBorderWidth(evt, "Left")} hasMargin={false} maxWidth={"70px"} useFC={false} sub={true}/>
                </section>
            {/if}

            <!-- border radius -->
            {#if useRadius}
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
                <section>
                    <ColorPicker name="Color" propertyName={"Border"} propertyRef={"borderColor"} clr={clr} />
                </section>

                <div style="height:7px"></div>
            {/if}

            {#if useStyleTop || useStyleBottom || useStyleLeft || useStyleRight}
                <section style="flex-direction: column; margin-bottom:7px">
                    <section style="display:flex; align-items: flex-start; margin:0;">            
                        <Title name="Style" width="fit-content"/>

                        {#if useStyleTop && (useStyleBottom || useStyleLeft || useStyleRight) || useStyleBottom && (useStyleLeft || useStyleRight) || useStyleLeft && useStyleRight}
                            <section id="check-container">
                                <input type="checkbox" checked={syncStyle} on:click={updateStyleSyncing}>
                                <img src="./assets/icons/chain.svg" alt="" style="opacity: {syncStyle ? "1" : "0.5"}">
                            </section>
                        {/if}
                    </section>

                    <section>
                        {#if useStyleTop}
                            <Dropdown name="Top" sub={true} hasMargin={true} v={styleTop} possibleValues={possibleStyles} on:updateValue={e => updateStyle(e, "Top")}/>
                        {/if}
                        {#if useStyleRight}
                            <Dropdown name="Right" sub={true} hasMargin={true} v={styleRight} possibleValues={possibleStyles} on:updateValue={e => updateStyle(e, "Right")}/>
                        {/if}
                        {#if useStyleBottom}
                            <Dropdown name="Bottom " sub={true} hasMargin={true} v={styleBottom} possibleValues={possibleStyles} on:updateValue={e => updateStyle(e, "Bottom")}/>
                        {/if}
                        {#if useStyleLeft}
                            <Dropdown name="Left" sub={true} hasMargin={false} v={styleLeft} possibleValues={possibleStyles} on:updateValue={e => updateStyle(e, "Left")}/>
                        {/if}
                    </section>  
                </section>
            {/if}
        {/if}
    </main>
{/if}

<style lang="scss">
    @import "../../../../public/guideline";
    
    main{
        border-bottom: 1px solid $primaryl3;
        padding: 13px 13px 0px 13px; width: calc(100% - 26px);

        #title-container{
            margin: 0px 0px 13px 0px;
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

        #check-container{
            display:flex; align-items:center; height:100%; transform: translate3d(-5px, -1px, 0px);
            margin:0;
            position: relative;

            img{
                position:absolute;
                height:80%; width:80%;
                top:calc(50% + 0.75px); left:calc(50% + 7.25px); transform: translate(-50%, -50%);
                pointer-events: none;
            }

            input{
                /* hide default style */
                -webkit-appearance: none;
                appearance: none;
                background: $primaryl4;
                cursor: pointer;
                
                height:20px; width:30px;
                border-radius: 3px;
    
                margin: 2px 0px 0px 15px;
    
                &:checked{
                    background: $accent;
                    border:none;
                }
            }
        }

        section{
            display: flex;
            margin-bottom:10px;
        }

        img{
            filter: invert(1); opacity: 1;
        }
    }
</style>