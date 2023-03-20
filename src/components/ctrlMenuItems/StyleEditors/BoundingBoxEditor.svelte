<script lang="ts">
    import { get } from "svelte/store";
    import { activeStyles } from "../../../stores/activeStyles";
    import { collection, selectedComponent, selectedOverride } from "../../../stores/collection";
    import type { units } from "../../../types/general";

    import Slider from "./Basics/Slider.svelte";
    import UnitInput from "./Basics/UnitInput.svelte";

    export let currentParentWidth = 360;
    
    // reactive
    $: currentStyle = $selectedOverride === -1 ? $collection[$selectedComponent]?.style : $collection[$selectedComponent]?.styleOverrides[$selectedOverride]?.style;

    let cW = 100; let cWu:units = "px"; 
    let cH = 100; let cHu:units = "px"; 
    let cSAvg = 100;

    let cMT = 0; let cMTu:units = "px"; 
    let cMR = 0; let cMRu:units = "px"; 
    let cMB = 0; let cMBu:units = "px"; 
    let cML = 0; let cMLu:units = "px"; 
    let cMAvg = 0;

    let cPT = 0; let cPTu:units = "px"; 
    let cPR = 0; let cPRu:units = "px"; 
    let cPB = 0; let cPBu:units = "px"; 
    let cPL = 0; let cPLu:units = "px"; 
    let cPAvg = 0;

    // these variables determine which editors will be visible, based on whatever the current active styles are. Here for organization
    $: useWidthAndHeight = $activeStyles.width || $activeStyles.height;
    $: useMargin = $activeStyles.marginTop || $activeStyles.marginBottom || $activeStyles.marginLeft || $activeStyles.marginRight;
    $: usePadding = $activeStyles.paddingTop || $activeStyles.paddingBottom || $activeStyles.paddingLeft || $activeStyles.paddingRight;

    $: if(!!currentStyle){ // these variables just make the code look nicer
        // size
        if(useWidthAndHeight){ // we're doing this so that we don't have to worry about accidentally setting properties for elements that shouldn't have this property
            if(!currentStyle.width) currentStyle.width = {v:100,u:"px"};
            cW = currentStyle.width.v;
            cWu = currentStyle.width.u;
            if(!currentStyle.height) currentStyle.height = {v:100,u:"px"};
            cH = currentStyle.height.v;
            cHu = currentStyle.height.u;
            cSAvg = (cW + cH) / 2;
        }
    
        // margin
        if(useMargin){ // we're doing this so that we don't have to worry about accidentally setting properties for elements that shouldn't have this property
            if(!currentStyle["marginTop"]) currentStyle["marginTop"] = {v:0,u:"px"};
            cMT = currentStyle["marginTop"].v;
            cMTu = currentStyle["marginTop"].u;
            if(!currentStyle["marginRight"]) currentStyle["marginRight"] = {v:0,u:"px"};
            cMR = currentStyle["marginRight"].v;
            cMRu = currentStyle["marginRight"].u;
            if(!currentStyle["marginBottom"]) currentStyle["marginBottom"] = {v:0,u:"px"};
            cMB = currentStyle["marginBottom"].v;
            cMBu = currentStyle["marginBottom"].u;
            if(!currentStyle["marginLeft"]) currentStyle["marginLeft"] = {v:0,u:"px"};
            cML = currentStyle["marginLeft"].v;
            cMLu = currentStyle["marginLeft"].u;
            cMAvg = (cMT + cMR + cMB + cML) / 4;
        }

        // padding
        if(usePadding){ // we're doing this so that we don't have to worry about accidentally setting properties for elements that shouldn't have this property
            if(!currentStyle["paddingTop"]) currentStyle["paddingTop"] = {v:0,u:"px"};
            cPT = currentStyle["paddingTop"].v
            cPTu = currentStyle["paddingTop"].u;
            if(!currentStyle["paddingRight"]) currentStyle["paddingRight"] = {v:0,u:"px"};
            cPR = currentStyle["paddingRight"].v
            cPRu = currentStyle["paddingRight"].u;
            if(!currentStyle["paddingBottom"]) currentStyle["paddingBottom"] = {v:0,u:"px"};
            cPB = currentStyle["paddingBottom"].v
            cPBu = currentStyle["paddingBottom"].u;
            if(!currentStyle["paddingLeft"]) currentStyle["paddingLeft"] = {v:0,u:"px"};
            cPL = currentStyle["paddingLeft"].v
            cPLu = currentStyle["paddingLeft"].u;
            cPAvg = (cPT + cPR + cPB + cPL) / 4;
        }
    }

    const updateWidth = (evt:CustomEvent<any>) => {
        if($selectedOverride !== -1){ // if no override is selected
            $collection[$selectedComponent].styleOverrides[$selectedOverride].style["width"] = {v: evt.detail.v, u: evt.detail.u}
        } else {
            $collection[$selectedComponent].style["width"] = {v: evt.detail.v, u: evt.detail.u}
        }
    }
    const updateHeight = (evt:CustomEvent<any>) => {
        if($selectedOverride !== -1){ // if no override is selected
            $collection[$selectedComponent].styleOverrides[$selectedOverride].style["height"] = {v: evt.detail.v, u: evt.detail.u}
        } else {
            $collection[$selectedComponent].style["height"] = {v: evt.detail.v, u: evt.detail.u}
        }
    }
    const updateSizeAll = (evt:CustomEvent<any>) => {
        if($selectedOverride !== -1){ // if no override is selected
            if(!!$collection[$selectedComponent].styleOverrides[$selectedOverride].style["width"]) $collection[$selectedComponent].styleOverrides[$selectedOverride].style["width"].v = evt.detail.v;
            if(!!$collection[$selectedComponent].styleOverrides[$selectedOverride].style["height"]) $collection[$selectedComponent].styleOverrides[$selectedOverride].style["height"].v = evt.detail.v;
        } else {
            if(!!$collection[$selectedComponent].style["width"]) $collection[$selectedComponent].style["width"].v = evt.detail.v;
            if(!!$collection[$selectedComponent].style["height"]) $collection[$selectedComponent].style["height"].v = evt.detail.v;
        }
    }


    const updateMargin = (evt:CustomEvent<any>, direction:string) => {
        if($selectedOverride !== -1){ // if no override is selected
            $collection[$selectedComponent].styleOverrides[$selectedOverride].style[`margin${direction}`] = {v: evt.detail.v, u: evt.detail.u};
        } else {
            $collection[$selectedComponent].style[`margin${direction}`] = {v: evt.detail.v, u: evt.detail.u};
        }
    }
    const updateMarginAll = (evt:CustomEvent<any>) => { // VALUE ONLY!!!
        if($selectedOverride !== -1){ // if no override is selected
            if(!!$collection[$selectedComponent].styleOverrides[$selectedOverride].style["marginTop"]) $collection[$selectedComponent].styleOverrides[$selectedOverride].style["marginTop"].v = evt.detail.v;
            if(!!$collection[$selectedComponent].styleOverrides[$selectedOverride].style["marginRight"]) $collection[$selectedComponent].styleOverrides[$selectedOverride].style["marginRight"].v = evt.detail.v;
            if(!!$collection[$selectedComponent].styleOverrides[$selectedOverride].style["marginBottom"]) $collection[$selectedComponent].styleOverrides[$selectedOverride].style["marginBottom"].v = evt.detail.v;
            if(!!$collection[$selectedComponent].styleOverrides[$selectedOverride].style["marginLeft"]) $collection[$selectedComponent].styleOverrides[$selectedOverride].style["marginLeft"].v = evt.detail.v;
        } else {
            if(!!$collection[$selectedComponent].style["marginTop"]) $collection[$selectedComponent].style["marginTop"].v = evt.detail.v;
            if(!!$collection[$selectedComponent].style["marginRight"]) $collection[$selectedComponent].style["marginRight"].v = evt.detail.v;
            if(!!$collection[$selectedComponent].style["marginBottom"]) $collection[$selectedComponent].style["marginBottom"].v = evt.detail.v;
            if(!!$collection[$selectedComponent].style["marginLeft"]) $collection[$selectedComponent].style["marginLeft"].v = evt.detail.v;
        }
    }


    const updatePadding = (evt:CustomEvent<any>, direction:string) => {
        if($selectedOverride !== -1){ // if no override is selected
            $collection[$selectedComponent].styleOverrides[$selectedOverride].style[`padding${direction}`] = {v: evt.detail.v, u: evt.detail.u};
        } else {
            $collection[$selectedComponent].style[`padding${direction}`] = {v: evt.detail.v, u: evt.detail.u};
        }
    }
    const updatePaddingAll = (evt:CustomEvent<any>) => { // VALUE ONLY!!!
        if($selectedOverride !== -1){ // if no override is selected
            if(!!$collection[$selectedComponent].styleOverrides[$selectedOverride].style["paddingTop"]) $collection[$selectedComponent].styleOverrides[$selectedOverride].style["paddingTop"].v = evt.detail.v;
            if(!!$collection[$selectedComponent].styleOverrides[$selectedOverride].style["paddingRight"]) $collection[$selectedComponent].styleOverrides[$selectedOverride].style["paddingRight"].v = evt.detail.v;
            if(!!$collection[$selectedComponent].styleOverrides[$selectedOverride].style["paddingBottom"]) $collection[$selectedComponent].styleOverrides[$selectedOverride].style["paddingBottom"].v = evt.detail.v;
            if(!!$collection[$selectedComponent].styleOverrides[$selectedOverride].style["paddingLeft"]) $collection[$selectedComponent].styleOverrides[$selectedOverride].style["paddingLeft"].v = evt.detail.v;
        } else {
            if(!!$collection[$selectedComponent].style["paddingTop"]) $collection[$selectedComponent].style["paddingTop"].v = evt.detail.v;
            if(!!$collection[$selectedComponent].style["paddingRight"]) $collection[$selectedComponent].style["paddingRight"].v = evt.detail.v;
            if(!!$collection[$selectedComponent].style["paddingBottom"]) $collection[$selectedComponent].style["paddingBottom"].v = evt.detail.v;
            if(!!$collection[$selectedComponent].style["paddingLeft"]) $collection[$selectedComponent].style["paddingLeft"].v = evt.detail.v;
        }
    }
</script>

<!-- First check if we need to show anything at all. -->
{#if useWidthAndHeight || useMargin || usePadding}
    <main>
        <!-- title of the editor -->
        <h1>Bounding Box</h1>

        <!-- Size control. Activate whenever either width or height is active and used. -->
        {#if useWidthAndHeight}
            <section>
                <Slider name="Size" min={0} max={500} v={cSAvg} hasMargin={true} on:updateValue={updateSizeAll} currentParentWidth={currentParentWidth}/>
                <UnitInput name="Width" usePercent={true} v={cW} u={cWu} on:updateValue={updateWidth} hasMargin={true} sub={true}/>
                <UnitInput name="Height" usePercent={true} v={cH} u={cHu} on:updateValue={updateHeight} hasMargin={false} sub={true}/>
            </section>
        {/if}

        <!-- margin -->
        {#if useMargin}
            <section>
                <Slider name="Margin" min={0} max={200} v={cMAvg} hasMargin={true} on:updateValue={updateMarginAll} currentParentWidth={currentParentWidth}/>
                <UnitInput name="Top" v={cMT} u={cMTu} on:updateValue={evt => updateMargin(evt, "Top")} hasMargin={true} maxWidth={"70px"} useFC={false} sub={true}/>
                <UnitInput name="Right" v={cMR} u={cMRu} on:updateValue={evt => updateMargin(evt, "Right")} hasMargin={true} maxWidth={"70px"} useFC={false} sub={true}/>
                <UnitInput name="Bottom" v={cMB} u={cMBu} on:updateValue={evt => updateMargin(evt, "Bottom")} hasMargin={true} maxWidth={"70px"} useFC={false} sub={true}/>
                <UnitInput name="Left" v={cML} u={cMLu} on:updateValue={evt => updateMargin(evt, "Left")} hasMargin={false} maxWidth={"70px"} useFC={false} sub={true}/>
            </section>
        {/if}

        <!-- padding -->
        {#if usePadding}
            <section>
                <Slider name="Padding" min={0} max={100} v={cPAvg} hasMargin={true} on:updateValue={updatePaddingAll} currentParentWidth={currentParentWidth}/>
                <UnitInput name="Top" v={cPT} u={cPTu} on:updateValue={evt => updatePadding(evt, "Top")} hasMargin={true} maxWidth={"70px"} useFC={false} sub={true}/>
                <UnitInput name="Right" v={cPR} u={cPRu} on:updateValue={evt => updatePadding(evt, "Right")} hasMargin={true} maxWidth={"70px"} useFC={false} sub={true}/>
                <UnitInput name="Bottom" v={cPB} u={cPBu} on:updateValue={evt => updatePadding(evt, "Bottom")} hasMargin={true} maxWidth={"70px"} useFC={false} sub={true}/>
                <UnitInput name="Left" v={cPL} u={cPLu} on:updateValue={evt => updatePadding(evt, "Left")} hasMargin={false} maxWidth={"70px"} useFC={false} sub={true}/>
            </section>
        {/if}
    </main>
{/if}

<style lang="scss">
    @import "../../../../public/guideline";
    
    main{
        border-bottom: 1px solid $primaryl3;
        padding: 13px 13px 0px 13px; width: calc(100% - 26px);

        h1{
            font-size: 18px;
            margin: 0px 0px 13px 0px;
            user-select: none; -webkit-user-select: none;
        }

        section{
            display: flex;
            margin-bottom:10px;
        }
    }
</style>