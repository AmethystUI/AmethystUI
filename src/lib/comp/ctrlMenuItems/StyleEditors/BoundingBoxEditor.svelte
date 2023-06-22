<script lang="ts">
    import setImmediate from "$lib/util/setImmediate";
    import { activeStyles } from "$lib/stores/activeStyles";
    import { collection, focusedComponent, selectedComponent, selectedOverride } from "$lib/stores/collection";

    import Slider from "./Basics/Slider.svelte";
    import UnitInput from "./Basics/UnitInput.svelte";
  import { systemDefaultStyles } from "$src/lib/@const/element.const";

    export let currentParentWidth = 360;
    
    // reactive
    $: currentStyle = $selectedOverride === -1 ? $collection[$selectedComponent]?.style : $collection[$selectedComponent]?.styleOverrides[$selectedOverride]?.style;

    let cW:number; let cWu:units;
    let cH:number; let cHu:units;
    let cSAvg:number;

    let cMT:number; let cMTu:units;
    let cMR:number; let cMRu:units;
    let cMB:number; let cMBu:units;
    let cML:number; let cMLu:units;
    let cMAvg:number;

    let cPT:number; let cPTu:units;
    let cPR:number; let cPRu:units;
    let cPB:number; let cPBu:units;
    let cPL:number; let cPLu:units;
    let cPAvg:number;

    // these variables determine which editors will be visible, based on whatever the current active styles are. Here for organization
    $: useWidthAndHeight = $activeStyles.width || $activeStyles.height;
    $: useMargin = $activeStyles.marginTop || $activeStyles.marginBottom || $activeStyles.marginLeft || $activeStyles.marginRight;
    $: usePadding = $activeStyles.paddingTop || $activeStyles.paddingBottom || $activeStyles.paddingLeft || $activeStyles.paddingRight;

    $: if(!!currentStyle){ // VARIABLE UPDATING AND INITIALIZING
        // update size
        if(useWidthAndHeight){ // we're doing this so that we don't have to worry about accidentally setting properties for elements that shouldn't have this property
            if(!currentStyle.width) currentStyle.width = {...systemDefaultStyles.width};
            if(!currentStyle.height) currentStyle.height = {...systemDefaultStyles.height};
            
            cW = currentStyle.width.v;
            cWu = currentStyle.width.u;
            
            cH = currentStyle.height.v;
            cHu = currentStyle.height.u;
            
            cSAvg = (cW + cH) / 2;
        }
    
        // update margin
        if(useMargin){ // we're doing this so that we don't have to worry about accidentally setting properties for elements that shouldn't have this property
            if(!currentStyle["marginTop"]) currentStyle["marginTop"] = {...systemDefaultStyles.marginTop};
            if(!currentStyle["marginRight"]) currentStyle["marginRight"] = {...systemDefaultStyles.marginRight};
            if(!currentStyle["marginBottom"]) currentStyle["marginBottom"] = {...systemDefaultStyles.marginBottom};
            if(!currentStyle["marginLeft"]) currentStyle["marginLeft"] = {...systemDefaultStyles.marginLeft};
            
            cMT = currentStyle["marginTop"].v;
            cMTu = currentStyle["marginTop"].u;
    
            cMR = currentStyle["marginRight"].v;
            cMRu = currentStyle["marginRight"].u;
            
            cMB = currentStyle["marginBottom"].v;
            cMBu = currentStyle["marginBottom"].u;
            
            cML = currentStyle["marginLeft"].v;
            cMLu = currentStyle["marginLeft"].u;
            
            cMAvg = (cMT + cMR + cMB + cML) / 4;
        }
    
        // update padding
        if(usePadding){ // we're doing this so that we don't have to worry about accidentally setting properties for elements that shouldn't have this property
            if(!currentStyle["paddingTop"]) currentStyle["paddingTop"] = {...systemDefaultStyles.paddingTop};
            if(!currentStyle["paddingRight"]) currentStyle["paddingRight"] = {...systemDefaultStyles.paddingRight};
            if(!currentStyle["paddingBottom"]) currentStyle["paddingBottom"] = {...systemDefaultStyles.paddingBottom};
            if(!currentStyle["paddingLeft"]) currentStyle["paddingLeft"] = {...systemDefaultStyles.paddingLeft};
    
            cPT = currentStyle["paddingTop"].v
            cPTu = currentStyle["paddingTop"].u;
            
            cPR = currentStyle["paddingRight"].v
            cPRu = currentStyle["paddingRight"].u;
            
            cPB = currentStyle["paddingBottom"].v
            cPBu = currentStyle["paddingBottom"].u;
            
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
    @import "/src/static/stylesheets/guideline";
    
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