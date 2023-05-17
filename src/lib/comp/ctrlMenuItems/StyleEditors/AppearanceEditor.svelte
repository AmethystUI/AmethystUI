<script lang="ts" context="module">
    // GLOBAL DEFAULT VALUES
    export const defaultOpacity = 100;
    export const defaultOverflow: overflow = "auto";
    export const defaultFlexAlign: flexAlignment = "none";
</script>

<script lang="ts">
    import { collection, selectedComponent, selectedOverride } from "$lib/stores/collection";

    import Slider from "./Basics/Slider.svelte";
    import Dropdown from "./Basics/Dropdown.svelte";
    import ValueInput from "./Basics/ValueInput.svelte";
    import Title from "./Basics/Title.svelte";
    import MultiToggle from "./Basics/MultiToggle.svelte";
    import { activeStyles } from "$lib/stores/activeStyles";
    import type { multiToggleSelection } from "./Basics/MultiToggle.svelte";
    
    export let currentParentWidth = 360;
    
    // reactive
        $: currentStyle = $selectedOverride === -1 ? $collection[$selectedComponent]?.style : $collection[$selectedComponent]?.styleOverrides[$selectedOverride]?.style;

    const possibleOverflowStyles:overflow[] = ["auto", "hidden", "scroll", "visible"];

    let opacity:number;
    let overflowX:overflow;
    let overflowY:overflow;
    let alignX:flexAlignment;
    let alignY:flexAlignment;
    let syncOverflow = false;

    const horizontalAlignments:multiToggleSelection<flexAlignment>[] = [
        {
            iconDir : "/src/assets/icons/none.svg",
            val : "none",
            alt : "No Alignment"
        },{
            iconDir : "/src/assets/icons/flex-align-left.svg",
            val : "flex-start",
            alt : "Align Left"
        }, {
            iconDir : "/src/assets/icons/flex-align-center-h.svg",
            val : "center",
            alt : "Align Center"
        }, {
            iconDir : "/src/assets/icons/flex-align-right.svg",
            val : "flex-end",
            alt : "Align Right"
        },
    ]
    const verticalAlignments:multiToggleSelection<flexAlignment>[] = [
        {
            iconDir : "/src/assets/icons/none.svg",
            val : "none",
            alt : "No Alignment"
        },{
            iconDir : "/src/assets/icons/flex-align-top.svg",
            val : "flex-start",
            alt : "Align Top"
        }, {
            iconDir : "/src/assets/icons/flex-align-center-v.svg",
            val : "center",
            alt : "Align Center"
        }, {
            iconDir : "/src/assets/icons/flex-align-bottom.svg",
            val : "flex-end",
            alt : "Align Bottom"
        },
    ]
    /*
     * These are objects that maps the alignment values to a certain index.
     * It helps in easily identifying the position of the element on the component UI.
     * Every component might have a different indicies object. These are exclusive to this component.
     */
    const alignmentIndices: { [K in flexAlignment]: number } = {
        "none" : 0,
        "flex-start": 1,
        "center": 2,
        "flex-end": 3,
        "space-around": -1,
        "space-between": -1,
        "space-evenly": -1,
    };

    // these variables determine which editors will be visible, based on whatever the current active styles are. Here for organization
    $: useOpacity = $activeStyles.opacity;
    $: useOverflowX = $activeStyles.overflowX;
    $: useOverflowY = $activeStyles.overflowY;
    $: useAlignX = $activeStyles.justifyContent; // might need to change in the future
    $: useAlignY = $activeStyles.alignItems; // might need to change in the future

    $: if(!!currentStyle){ // VARIABLE UPDATING AND INITIALIZING
        // opacity
        if(useOpacity){ // we're doing this so that we don't have to worry about accidentally setting properties for elements that shouldn't have this property
            if(currentStyle.opacity === undefined) currentStyle.opacity = defaultOpacity;
            opacity = currentStyle.opacity;
        }
        
        // overflows
        if(useOverflowX){
            if(!currentStyle.overflowX) currentStyle.overflowX = defaultOverflow;
            overflowX = currentStyle.overflowX;
        } if(useOverflowY){
            if(!currentStyle.overflowY) currentStyle.overflowY = defaultOverflow;
            overflowY = currentStyle.overflowY;
        }

        // alignments
        if(useAlignX){
            if(!currentStyle.justifyContent) currentStyle.justifyContent = defaultFlexAlign;
            alignX = currentStyle.justifyContent;
        } if (useAlignY) {
            if(!currentStyle.alignItems) currentStyle.alignItems = defaultFlexAlign;
            alignY = currentStyle.alignItems;
        }
    }

    const updateOpacity = (evt:CustomEvent<any>, d:string) => {
        currentStyle.opacity = evt.detail.v;
        if($selectedOverride !== -1){ // if no override is selected
            $collection[$selectedComponent].styleOverrides[$selectedOverride].style.opacity = evt.detail.v;
        } else {
            $collection[$selectedComponent].style.opacity = evt.detail.v;
        }
    }

    const updateOverflow = (evt:CustomEvent<any>, axis:string) => {
        if($selectedOverride !== -1){ // if no override is selected
            if(evt.detail.v === "visible" || syncOverflow){ // if the user wants to set overflow visible, set both to make it work properly
                $collection[$selectedComponent].styleOverrides[$selectedOverride].style.overflowX = evt.detail.v;
                $collection[$selectedComponent].styleOverrides[$selectedOverride].style.overflowY = evt.detail.v;
            } else {
                $collection[$selectedComponent].styleOverrides[$selectedOverride].style[`overflow${axis}`] = evt.detail.v;
            }
        } else {
            if(evt.detail.v === "visible" || syncOverflow){ // if the user wants to set overflow visible, set both to make it work properly
                $collection[$selectedComponent].style.overflowX = evt.detail.v;
                $collection[$selectedComponent].style.overflowY = evt.detail.v;
            } else {
                $collection[$selectedComponent].style[`overflow${axis}`] = evt.detail.v;
            }
        }
    }

    const updateOverflowSyncing = () => {
        syncOverflow = !syncOverflow; // update link overflow

        if(!syncOverflow) return;

        if($selectedOverride !== -1){ // if no override is selected
            $collection[$selectedComponent].styleOverrides[$selectedOverride].style.overflowY = $collection[$selectedComponent].styleOverrides[$selectedOverride].style.overflowX;
        } else{
            $collection[$selectedComponent].style.overflowY = $collection[$selectedComponent].style.overflowX;
        }
    }

    // We're seperating these two functions out because they will have different functionalities when we further develop flexbox alignment
    const updateHorizontalAlignnment = (e) => {
        if($selectedOverride !== -1){ // if no override is selected
            $collection[$selectedComponent].styleOverrides[$selectedOverride].style.justifyContent = e.detail.value;
        } else{
            $collection[$selectedComponent].style.justifyContent = e.detail.value;
        }
    }

    const updateVerticalAlignnment = (e) => {
        if($selectedOverride !== -1){ // if no override is selected
            $collection[$selectedComponent].styleOverrides[$selectedOverride].style.alignItems = e.detail.value;
        } else{
            $collection[$selectedComponent].style.alignItems = e.detail.value;
        }
    }
</script>

{#if useOpacity || useOverflowX || useOverflowY || useAlignX || useAlignY}
    <main class="no-drag">
        <!-- title of the editor -->
        <section id="title-container">
            <h1>Appearance</h1>
        </section>

        <!-- opacity -->
        {#if useOpacity}
            <section style="margin-bottom:0px;">
                <Slider name="Opacity" min={0} max={100} v={opacity} hasMargin={true} on:updateValue={e => updateOpacity(e, "sli")} currentParentWidth={currentParentWidth}/>
                <ValueInput name="" v={opacity} on:updateValue={e => updateOpacity(e, "val")} hasMargin={false} maxWidth={"70px"} minWidth={"30px"} maxVal={100} minVal={0} sub={true} align="center"/>
            </section>

            <div class="spacer"></div>
        {/if}

        <!-- Overflow -->
        {#if useOverflowX || useOverflowY}
            <section style="display:flex; align-items: flex-start; margin-bottom:0;">
                <Title name="Overflow" width="fit-content"/>
                
                <!-- Only show the sync button if both X and Y are usable -->
                {#if useOverflowX && useOverflowY}
                    <section id="check-container">
                        <input type="checkbox" checked={syncOverflow} on:click={updateOverflowSyncing}>
                        <img src="/src/assets/icons/chain.svg" alt="" style="opacity: {syncOverflow ? "1" : "0.5"}">
                    </section>
                {/if}
            </section>
            <section>
                <!-- Horizontal overflow (overflowX) -->
                {#if useOverflowX}
                    <Dropdown name="Horizontal" sub={true} hasMargin={true} v={overflowX} possibleValues={possibleOverflowStyles} on:updateValue={e => updateOverflow(e, "X")}/>
                {/if}
                <!-- Vertical overflow (overflowY) -->
                {#if useOverflowY}
                    <Dropdown name="Vertical" sub={true} hasMargin={true} v={overflowY} possibleValues={possibleOverflowStyles} on:updateValue={e => updateOverflow(e, "Y")}/>
                {/if}
            </section>
        {/if}

        <!-- Alignements -->
        {#if useAlignX || useAlignY}
            <Title name="Content Alignement"></Title>
            
            <!-- Horizontal Alignment -->
            {#if useAlignX}
                <MultiToggle
                    name="Horizontal" sub={true}
                    elements={horizontalAlignments}
                    selection={alignmentIndices[alignX]}
                    width={currentParentWidth-27} height={25} radius={4} iconSize={16}
                    on:valueChange={updateHorizontalAlignnment}
                    />
                <div class="spacer"></div>
            {/if}
            <!-- Vertical Alignment -->
            {#if useAlignY}
                <MultiToggle
                    name="Vertical" sub={true}
                    elements={verticalAlignments}
                    selection={alignmentIndices[alignY]}
                    width={currentParentWidth-27} height={25} radius={4} iconSize={16}
                    on:valueChange={updateVerticalAlignnment}
                    />
            {/if}
        {/if}

        <div style="height:14px"></div>
    </main>
{/if}

<style lang="scss">
    @import "/src/static/stylesheets/guideline";
    
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
            align-items: flex-end;
            margin-bottom:10px;
        }

        .spacer{
            height: 7px;
        }

        img{
            filter: invert(1); opacity: 1;
        }
    }
</style>