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

    $: if(!!currentStyle){ // these variables just make the code look nicer
        // use outline
        currentStyle["USEOUTLINE"] = !!currentStyle["USEOUTLINE"]; // boolean initialization weirdness
        // currentStyle["USEOUTLINE"] = true; // debugging force open

        // opacity
        if(!currentStyle["opacity"]) currentStyle["opacity"] = opacity;
        opacity = currentStyle["opacity"];
        
        // overflows
        if(!currentStyle["overflowX"]) currentStyle["overflowX"] = overflowX;
        overflowX = currentStyle["overflowX"];
        if(!currentStyle["overflowY"]) currentStyle["overflowY"] = overflowY;
        overflowY = currentStyle["overflowY"];
    }

    const updateOpacity = (evt:CustomEvent<any>) => {
        if($selectedOverride !== -1){ // if no override is selected
            $collection[$selectedComponent].styleOverrides[$selectedOverride].style["opacity"] = evt.detail.v;
        } else {
            $collection[$selectedComponent].style["opacity"] = evt.detail.v;
        }
    }

    const updateOverflow = (evt:CustomEvent<any>, axis:string) => {
        if($selectedOverride !== -1){ // if no override is selected
            $collection[$selectedComponent].styleOverrides[$selectedOverride].style[`overflow${axis}`] = evt.detail.v;
        } else {
            $collection[$selectedComponent].style[`overflow${axis}`] = evt.detail.v;
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
        <Slider name="Opacity" min={0} max={100} v={opacity} hasMargin={true} on:updateValue={updateOpacity} currentParentWidth={currentParentWidth}/>
        <ValueInput name="" v={opacity} on:updateValue={updateOpacity} hasMargin={false} maxWidth={"70px"} minWidth={"30px"} maxVal={100} minVal={0} sub={true} align="center"/>
    </section>

    <div class="spacer"></div>

    <!-- Overflow -->
    <Title name="Overflow"/>
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

        section{
            display: flex;
            align-items: flex-end;
            margin-bottom:10px;
        }

        .spacer{
            height: 7px;
        }
    }
</style>