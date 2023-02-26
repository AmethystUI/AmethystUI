<script lang="ts">
    import { collection, selectedComponent, selectedOverride, units, color, borderOutlineStyle, overflow } from "../../../stores/collection";
    
    import Slider from "./Basics/Slider.svelte";
    import UnitInput from "./Basics/UnitInput.svelte";
    import ColorPicker from "./Advanced/ColorPicker.svelte";
    import Dropdown from "./Basics/Dropdown.svelte";
    import ValueInput from "./Basics/ValueInput.svelte";
    import Title from "./Basics/Title.svelte";
    
    export let currentParentWidth = 360;
    
    // reactive
    $: currentStyle = $selectedOverride === -1 ? $collection[$selectedComponent].style : $collection[$selectedComponent].styleOverrides[$selectedOverride].style;

    const possibleOverflowStyles:overflow[] = ["auto", "hidden", "scroll", "visible"];

    let opacity:number = 100;
    let overflowX:overflow = "auto";
    let overflowY:overflow = "auto";
    let syncOverflow = false;

    $: if(!!currentStyle){ // these variables just make the code look nicer
        // opacity
        if(currentStyle["opacity"] === undefined) currentStyle["opacity"] = opacity;
        opacity = currentStyle["opacity"];
        
        // overflows
        if(!currentStyle["overflowX"]) currentStyle["overflowX"] = overflowX;
        overflowX = currentStyle["overflowX"];
        if(!currentStyle["overflowY"]) currentStyle["overflowY"] = overflowY;
        overflowY = currentStyle["overflowY"];
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

</script>

<main class="no-drag">
    <!-- title of the editor -->
    <section id="title-container">
        <h1>Appearance</h1>
    </section>

    <!-- opacity -->
    <section style="margin-bottom:0px;">
        <Slider name="Opacity" min={0} max={100} v={opacity} hasMargin={true} on:updateValue={e => updateOpacity(e, "sli")} currentParentWidth={currentParentWidth}/>
        <ValueInput name="" v={opacity} on:updateValue={e => updateOpacity(e, "val")} hasMargin={false} maxWidth={"70px"} minWidth={"30px"} maxVal={100} minVal={0} sub={true} align="center"/>
    </section>

    <div class="spacer"></div>

    <!-- Overflow -->
    <section style="display:flex; align-items: flex-start; margin:0;">
        <Title name="Overflow" width="fit-content"/>
        <section id="check-container">
            <input type="checkbox" checked={syncOverflow} on:click={updateOverflowSyncing}>
        <img src="./assets/icons/chain.svg" alt="" style="opacity: {syncOverflow ? "1" : "0.5"}">
        </section>
    </section>
    <section>
        <Dropdown name="Horizontal" sub={true} hasMargin={true} v={overflowX} possibleValues={possibleOverflowStyles} on:updateValue={e => updateOverflow(e, "X")}/>
        <Dropdown name="Vertical" sub={true} hasMargin={true} v={overflowY} possibleValues={possibleOverflowStyles} on:updateValue={e => updateOverflow(e, "Y")}/>
    </section>  
</main>

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
                color: 1px solid $secondarys2;
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