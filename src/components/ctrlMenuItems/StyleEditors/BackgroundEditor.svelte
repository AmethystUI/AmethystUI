<script lang="ts">
    import { collection, selectedComponent, selectedOverride } from "../../../stores/collection";
    import type { color } from "../../../types/general";
    import { units } from "../../../types/general";

    import ColorPicker from "./Advanced/ColorPicker.svelte";
    import { clearColorPickerRef, mainColorPickerData } from "../../../stores/colorPickerStat";
    import { initializeColorFromHSLA } from "../../../util/colorMaths";
    import { activeStyles } from "../../../stores/activeStyles";
    
    // reactive
        $: currentStyle = $selectedOverride === -1 ? $collection[$selectedComponent]?.style : $collection[$selectedComponent]?.styleOverrides[$selectedOverride]?.style;

    const initialClr:color = initializeColorFromHSLA(0, 0, 100, 100);
    let clr:color = {...initialClr};

    // these variables determine which editors will be visible, based on whatever the current active styles are. Here for organization
    $: useBackground = $activeStyles.USEBACKGROUND;
    $: useBackgroundColor = $activeStyles.backgroundColor;

    $: if(!!currentStyle && useBackground){ // these variables just make the code look nicer        
        // use background
        currentStyle["USEBACKGROUND"] = !!currentStyle["USEBACKGROUND"]; // boolean initialization weirdness

        // background color
        if(useBackgroundColor){ // we're doing this so that we don't have to worry about accidentally setting properties for elements that shouldn't have this property
            if(!currentStyle["backgroundColor"]) currentStyle["backgroundColor"] = {...initialClr};
            clr = currentStyle["backgroundColor"];
        }
    }

    const toggleUseBackground = () => {
        if($selectedOverride !== -1){ // if no override is selected
            $collection[$selectedComponent].styleOverrides[$selectedOverride].style[`USEBACKGROUND`] = !$collection[$selectedComponent].styleOverrides[$selectedOverride].style[`USEBACKGROUND`]
        } else {
            $collection[$selectedComponent].style[`USEBACKGROUND`] = !$collection[$selectedComponent].style[`USEBACKGROUND`]
        }
    }

    // update color picker based on if the shadow is enabled or not
    $: if(!currentStyle.USEBACKGROUND && $mainColorPickerData.refName === "backgroundColor"){
        // if the current style doesn't use this editor, clear ref
        clearColorPickerRef();
    }
</script>

{#if useBackground}
    <main class="no-drag">
        <!-- title of the editor -->
        <section id="title-container">
            <h1>Background</h1>

            <section id="check-container">
                <input type="checkbox" checked={currentStyle.USEBACKGROUND} on:click={toggleUseBackground}>
                <img src="./assets/icons/checkmark.svg" alt="" style="opacity: {currentStyle.USEBACKGROUND ? "1" : "0"}">
            </section>
        </section>

        <!-- only show editing panel if border is enabled -->
        {#if currentStyle.USEBACKGROUND}
        
            <!-- background color -->
            {#if useBackgroundColor}
                <section>
                    <ColorPicker name="Color" propertyName={"Background"} propertyRef={"backgroundColor"} clr={clr} />
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

        section{
            display: flex;
            margin-bottom:10px;
        }

        img{
            filter: invert(1); opacity: 1;
        }
    }
</style>