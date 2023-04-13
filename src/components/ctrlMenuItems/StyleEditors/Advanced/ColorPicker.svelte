<script lang="ts">
    import type { color } from "../../../../types/general";
    import ValueInput from "../Basics/ValueInput.svelte";
    import ValueStrInput from "../Basics/ValueStrInput.svelte";
    import { hexToRgba, hslToRgb, rgbaToHex, rgbToHsl } from "../../../../util/colorMaths";
    import { collection } from "../../../../stores/collection";
    import { mainColorPickerData } from "../../../../stores/colorPickerManager";

    import { openColorPicker } from "../../../dynamicOverlay/overlays/ColorPickerOverlay.svelte";
    import { keepOpenOverlay } from "../../../dynamicOverlay/OverlayBase.svelte";

    export let name:string;
    export let sub = false;

    export let propertyName:string;
    export let propertyRef: string;
    export let clr: color;

    let currentColorModeTextClr = "";

    import Title from "../Basics/Title.svelte";

    let colorPreviewSquare:HTMLDivElement;

    const updateValue = (e:CustomEvent, updateValue:string) => {
        let v = e.detail.v;
        // lowercase the updateValue
        updateValue = updateValue.toLowerCase();

        // do a simple range check
        if(updateValue === "h"){
            if(v > 360) v = 360; // set min max
            if(v < 0) v = 0;
        }
        if(updateValue === "s" || updateValue === "l"){
            if(v > 100) v = 100; // set min max
            if(v < 0) v = 0;
        }
        if(updateValue === "r" || updateValue === "g" || updateValue === "b") {
            if(v > 255) v = 255; // set min max
            if(v < 0) v = 0;
        }

        // determine whether to update H or R
        if(clr[updateValue] !== undefined && updateValue !== "type") clr[updateValue] = v;
        else throw `Value "${updateValue}" does not exist. Check what you're trying to update`;

        if (updateValue === "h" || updateValue === "s" || updateValue === "l"){
            // if changes occured to HSL values, update RGB and HEX values
            const rgbVal = hslToRgb(clr.h, clr.s, clr.l);
            clr.r = rgbVal[0];
            clr.g = rgbVal[1];
            clr.b = rgbVal[2];
            const hexCode = rgbaToHex(clr.r, clr.g, clr.b, clr.a);
            clr.hex = hexCode

            $collection = $collection;
            $mainColorPickerData = $mainColorPickerData;
            return; // end update
        } if (updateValue === "r" || updateValue === "g" || updateValue === "b"){
            // if changes occured to RGB values, update HSL and HEX values
            const hslVal = rgbToHsl(clr.r, clr.g, clr.b);
            clr.h = hslVal[0];
            clr.s = hslVal[1];
            clr.l = hslVal[2];
            const hexCode = rgbaToHex(clr.r, clr.g, clr.b, clr.a);
            clr.hex = hexCode

            $collection = $collection;
            $mainColorPickerData = $mainColorPickerData;
            return; // end update
        } if (updateValue === "a"){
            // if changes occured to alpha values, update HEX values
            const hexCode = rgbaToHex(clr.r, clr.g, clr.b, clr.a);
            clr.hex = hexCode;

            $collection = $collection;
            $mainColorPickerData = $mainColorPickerData;
            return; // end update
        } if (updateValue === "hex" && (clr.hex.length === 3 || clr.hex.length === 4 || clr.hex.length === 6 || clr.hex.length === 8)){
            // if changes occured to hex values, update HSL, RGB and ALPHA values
            const rgbaVal = hexToRgba(clr.hex);
            clr.r = rgbaVal[0];
            clr.g = rgbaVal[1];
            clr.b = rgbaVal[2];
            clr.a = rgbaVal[3];
            const hslVal = rgbToHsl(rgbaVal[0], rgbaVal[1], rgbaVal[2]);
            clr.h = hslVal[0];
            clr.s = hslVal[1];
            clr.l = hslVal[2];
            
            $collection = $collection;
            $mainColorPickerData = $mainColorPickerData;
            return; // end update
        }
    }

    const switchClrMode = () => {
        switch (clr.type) {
            case "rgb":
                clr.type = "hsl";
                break;
            case "hsl":
                clr.type = "rgb";
                break;
            default:
                break;
        }
    }

    // update color ref
    const openOverlay = () => {
        openColorPicker(propertyRef, propertyName, colorPreviewSquare);
    }
</script>

<main>
    <!-- the color preview & button -->
    <section>
        <Title name={name} sub={sub}/>
        <div class="color-preview" bind:this={colorPreviewSquare}>
            <div style={`background-color: rgba(${clr.r}, ${clr.g}, ${clr.b}, ${clr.a}%)`} on:mousedown={openOverlay}></div>
        </div>
    </section>

    <!-- the actual selection part -->
    <ValueStrInput name="Hex" v={clr.hex} on:updateValue={e => updateValue(e, "hex")} hasMargin={true} sub={true} charLim={8} align={"center"} alignTitle={"center"} allowedCharRegex={/^[a-fA-F0-9]$/}
        on:focused={openOverlay}/>
    
    <section id="rgbhslInput">
        <div id="hsl-rgb-switcher" title={`Switch to ${clr.type === "rgb" ? "HSL" : "RGB"} mode`} on:click={switchClrMode} on:mouseenter={() => {currentColorModeTextClr="hsl(0,0%,80%)"}} on:mouseleave={() => {currentColorModeTextClr=""}} on:mousedown={keepOpenOverlay}></div>

        <section id="rgb-hsl-input-field">
            <!-- HSLA / RGBA -->
            <ValueInput
                name={clr.type === "rgb" ? "Red" : "Hue"}
                v={clr.type === "rgb" ? clr.r : clr.h}
                on:updateValue={e => updateValue(e, clr.type === "rgb" ? "r" : "h")}
                minWidth={"40px"}
                align={"center"}
                maxVal={clr.type === "rgb" ? 255 : 360}
                hasMargin={true} sub={true} textClrOverride={currentColorModeTextClr}
                on:focused={openOverlay}/>

            <ValueInput
                name={clr.type === "rgb" ? "Green" : "Sat"}
                v={clr.type === "rgb" ? clr.g : clr.s}
                on:updateValue={e => updateValue(e, clr.type === "rgb" ? "g" : "s")}
                minWidth={"40px"}
                align={"center"}
                maxVal={clr.type === "rgb" ? 255 : 100}
                hasMargin={true} sub={true} textClrOverride={currentColorModeTextClr}
                on:focused={openOverlay}/>

            <ValueInput
                name={clr.type === "rgb" ? "Blue" : "Lum"}
                v={clr.type === "rgb" ? clr.b : clr.l}
                on:updateValue={e => updateValue(e, clr.type === "rgb" ? "b" : "l")}
                minWidth={"40px"}
                align={"center"}
                maxVal={clr.type === "rgb" ? 255 : 100}
                hasMargin={true} sub={true} textClrOverride={currentColorModeTextClr}
                on:focused={openOverlay}/>
            
            <ValueInput
                name={"Alpha"}
                v={clr.a}
                on:updateValue={e => updateValue(e, "a")}
                minWidth={"40px"}
                align={"center"}
                maxVal={100}
                hasMargin={false} sub={true}
                on:focused={openOverlay}/>
        </section>
    </section>
</main>

<style lang="scss">
    @import "../../../../../public/guideline";

    main{
        width:100%;
        display:flex; align-items: flex-end;

        .color-preview{
            width: 25px; height:25px; min-width: 25px; min-height:25px; border-radius: 4px;
            cursor: pointer;
            margin-right: 15px;
            position: relative;

            background-image: url("../assets/svgs/checkerBoardPattern.svg");
            background-size: 50%;

            div{
                width:100%; height:100%;
                border-radius: inherit;
            }
        }
        
        #rgbhslInput{
            display:flex; align-items: flex-end; flex-direction: column;
            width:100%; max-width: 200px;
            position: relative;

            #rgb-hsl-input-field{
                display:flex; align-items: flex-end; width:100%;
            }

            #hsl-rgb-switcher{
                width:75%; height:14px; background-color: transparent; opacity:10%;
                position:absolute; top:2px; left:0; z-index: 1;
                border-radius: 15px;

                &:hover{
                    background-color: $secondary
                }
            }
        }
    }
</style>