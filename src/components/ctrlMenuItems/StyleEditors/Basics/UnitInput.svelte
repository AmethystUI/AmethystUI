<script lang="ts">
    import type { units } from '../../../../types/general';
    import { createEventDispatcher, onMount } from 'svelte';
    import Title from './Title.svelte';
    const disp = createEventDispatcher();
    
    export let name:string;
    export let v: any;
    let lastWorkingV = v;
    export let u:units = "px";
    let lastWorkingU = u;
    export let hasMargin: boolean;
    export let maxWidth:string = "";
    export let minWidth:string = "";
    export let useFC:boolean = true; // whether or not to use fit-content as an option
    export let usePercent:boolean = false; // whether or not to use percent as an option
    export let sub:boolean = false; // subElement of a slider or whatever
    export let maxVal:number = 5000;
    export let minVal:number = 0;
    export let align: string = "left";
    export let alignTitle: string = align;
    export let textClrOverride: string = undefined;

    let unitSelOpen = false;

    let valueInputField:HTMLInputElement;

    let dropDownElement:HTMLElement;
    let openDirection = "open-top";
    let trackingDir = false;

    const openUnitSel = () => {
        focused(); // focus current input field
        updateSelectionDirection();
        unitSelOpen = true;
        
        // for closing
        document.addEventListener("mouseup", closeUnitSel);
        document.addEventListener("keydown", closeUnitSelOnKey);
        
        // add resize listener for window
        trackingDir = true
        requestAnimationFrame(updateSelectionDirection);
    }

    const updateSelectionDirection = () => {
        // iterCt prevents stack overflowing
        if(!dropDownElement) return; // keep checking until dropDownElement exists
        
        const bbRect = dropDownElement.getBoundingClientRect()
        const margin = 10;
        if(openDirection == "open-bottom") openDirection = (bbRect.y + bbRect.height + margin > window.innerHeight) ? "open-top" : "open-bottom";
        else openDirection = (bbRect.y+25+bbRect.height*2+margin > window.innerHeight) ? "open-top" : "open-bottom";

        if(trackingDir) requestAnimationFrame(updateSelectionDirection);
    }
    const closeUnitSelOnKey = (e: KeyboardEvent) => {
        if(e.key === "Escape") closeUnitSel();
    }
    const closeUnitSel = () => {
        setTimeout(() => {
            unitSelOpen = false;

            // cancel direction tracking
            trackingDir = false;

            // open up so the scrolling isn't weird
            openDirection == "open-top";

            // remove listener
            document.removeEventListener("mouseup", closeUnitSel);
            document.removeEventListener("keydown", closeUnitSelOnKey);
            window.removeEventListener("resize", updateSelectionDirection);
        }, 0);
    }

    // ========================== Input Field ==========================

    const dispatchLastWorkingV = () => {
        disp("updateValue", { // do an initial update to get things going
            v: lastWorkingV, u: u
        })
    }

    const focused = () => { // executes when the input field is focused
        disp("focused"); // dispatch the focused event so the parent component can react to it

        dispatchLastWorkingV();
    }

    const blurred = () => {
        valueInputField.value = lastWorkingV; // set the value of the input field to the last working value if it's not a valid number

        attemptUpdateInputField();
        dispatchLastWorkingV();

        disp("blurred"); // dispatch the blurred event so the parent component can react to it
    }

    const keyPress = (e:KeyboardEvent) => {
        setTimeout(() => { // wait for the content of the input field to be updated. Basically push this event to the next frame.
            let deltaV = 1;
            if(e.metaKey || e.ctrlKey) deltaV = 0.1;
            if(e.shiftKey) deltaV = 10;
    
            // clamp the value V between the min and max range and update lastWorking V
            if(!isNaN(Number(valueInputField.value))) lastWorkingV = Math.min(maxVal, Math.max(minVal, Number(valueInputField.value))); 
            
            if(e.key === "Enter" || e.key === "Escape"){ // if the user presses enter or escape, blur the input field
                e.preventDefault();
                valueInputField.blur();
                return;
            }
    
            if(e.key === "ArrowUp"){ // check when the user use the arrow key
                e.preventDefault();
                // change the value of the input field to the last working one first, then nudge it up by deltaV
    
                if(lastWorkingV + deltaV < maxVal){
                    lastWorkingV += deltaV;
                    lastWorkingV = Math.round(lastWorkingV * 100) / 100; // round to 2 decimal place
                } else { // prevent overflow
                    lastWorkingV = maxVal;
                }

                valueInputField.value = lastWorkingV; // update the actual value of the input field
            }
            else if(e.key === "ArrowDown"){
                e.preventDefault();
                if(lastWorkingV - deltaV > minVal){
                    lastWorkingV -= deltaV;
                    lastWorkingV = Math.round(lastWorkingV * 100) / 100; // round to 2 decimal place
                } else {
                    lastWorkingV = minVal;
                }

                valueInputField.value = lastWorkingV; // update the actual value of the input field
            }
            dispatchLastWorkingV();
        }, 0);
    }

    const attemptUpdateInputField = () => {
        // if v and lastWorkingV are not equal, the v change must be coming from an external source. So we have to update the input field.
        if(v !== lastWorkingV){
            lastWorkingV = v;
            valueInputField.value = lastWorkingV;
        }
    }

    $: if(v && valueInputField){ // react to any changes in v.
        attemptUpdateInputField();
    }
    $: if(u !== "fit-content" && !!valueInputField){ // if valueInputField's existance changes, update the value of it
        valueInputField.value = v;
    }

    $: if(u !== lastWorkingU) { // react to any changes in u.
        // if there is changes in u, we need to dispatch the new unit in
        setTimeout(() => { // make sure this unit update happens AFTER the value has been updated.'
            dispatchLastWorkingV();
        }, 0);
    }

    onMount(() => {
        if(valueInputField) valueInputField.value = v;
    })
</script>

<main style={`${hasMargin ? "margin-right:6px" : ""}; ${maxWidth !== "" ? `max-width:${maxWidth}` : ""}; ${minWidth !== "" ? `min-width:${minWidth}` : ""}`}>
    <Title name={name} sub={sub} align={alignTitle} textClrOverride={textClrOverride}/>

    <section class={`${openDirection} ${unitSelOpen ? "sel-opened" : ""}`}>
        
        <!-- do not show input if unit is fit-content -->
        {#if u !== "fit-content"}
            <input bind:this={valueInputField} on:keydown={keyPress} on:blur={blurred} on:focus={focused}/>
        {/if}
        
        <!-- unit selection part -->
        <div id="unit-display" style={`${
            u === "fit-content" ? "width:100%; border-radius:4px" : ""
        }`} class={`${unitSelOpen ? "selected" : ""}`} on:click={openUnitSel}>
            <p>
                {u}
            </p>
        </div>

        <section id="unit-sel-container" class={`${openDirection} ${!unitSelOpen ? "hidden" : ""}`} bind:this={dropDownElement}>
            {#if u !== "px"}
                <div on:click={() => u="px"}><p>
                    px
                </p></div>
            {/if}
            {#if u !== "pt"}
                <div on:click={() => u="pt"}><p>
                    pt
                </p></div>
            {/if}
            {#if u !== "pc"}
                <div on:click={() => u="pc"}><p>
                    pc
                </p></div>
            {/if}
            <!-- Broken but I dont wanna fix it. Not like anyone use this unit anyways -->
            <!-- {#if u !== "em"}
                <div on:click={() => u="em"}><p>
                    em
                </p></div>
            {/if} -->
            {#if u !== "rem"}
                <div on:click={() => u="rem"}><p>
                    rem
                </p></div>
            {/if}
            {#if u !== "vw"}
                <div on:click={() => u="vw"}><p>
                    vw
                </p></div>
            {/if}
            {#if u !== "vh"}
                <div on:click={() => u="vh"}><p>
                    vh
                </p></div>
            {/if}
            <!-- % doesn't work because of the page layout setup. Too lazy to change it rn -->
            {#if u !== "%" && usePercent}
                <div on:click={() => u="%"}><p>
                    %
                </p></div>
            {/if}
            {#if u !== "fit-content" && useFC}
                <div on:click={() => u="fit-content"}><p>
                    Fit Content
                </p></div>
            {/if}
        </section>
    </section>
</main>

<style lang="scss">
    @import "../../../../../public/guideline";

    $input-pad: 7px;
    $unit-sel-size: 28px; // unit selection size

    main{
        width: 100%;

        .sel-opened{
            input{
                z-index:1000;
            }
            #unit-display{
                z-index: 1001;
            }

            &.open-bottom{
                input{
                    border-radius: 4px 0 0 0 !important;
                }
                #unit-display{
                    border-radius: 0 4px 0 0 !important;
                }
            } &.open-top{
                input{
                    border-radius: 0 0 0 4px !important;
                }
                #unit-display{
                    border-radius: 0 0 4px 0 !important;
                }
            }
        }

        section{
            display:flex;
            position:relative;

            #unit-sel-container{
                position: absolute;
                width:calc(100% - 1px); height:fit-content; // the reason why we do -1 px is to account for the rendering gap
                background-color: hsla(200,5%,21%,50%);
                backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
                overflow:hidden;
                display:flex; flex-direction: column;
                z-index: 10000;
                cursor:pointer;

                &.open-bottom{
                    bottom: 0;
                    transform: translate3d(0, calc(100% - 1px), 0);
                    border-radius: 0 0 4px 4px;
                    box-shadow: 0 5px 10px 3px hsla(0deg, 0%, 0%, 25%);
                }
                &.open-top{
                    bottom: 25px;
                    transform: translate3d(0, 1px, 0);
                    border-radius: 4px 4px 0 0;
                    box-shadow: 0 -5px 10px 3px hsla(0deg, 0%, 0%, 25%);
                }

                &.hidden{
                    opacity:0; pointer-events: none;
                }

                div{
                    width:100%; height:25px;
                    display: flex; justify-content: flex-end; align-items: center;
                    
                    &:hover{
                        background-color: $accent;
                        z-index:2;
                        box-shadow: 0 5px 10px hsla(0deg, 0%, 0%, 25%);

                        p{
                            color: $secondary;
                            font-weight: 600;
                        }
                    }

                    p{
                        margin-right: 10px;

                        font-family: "Inter";
                        font-size: 12px;
                        color: $secondarys5;
                        user-select: none; -webkit-user-select: none;
                    }
                }
            }

            input{
                height:25px; width:calc(100% - $input-pad - $unit-sel-size);
                margin:0; padding: 0 0 0 $input-pad;
                background-color: $primaryl3;
                outline:none; border:none; border-radius: 4px 0 0 4px;
                color: $secondary;
                z-index: 2;
                
                font-family: "Inter";
                font-weight: 400;
                font-size: 12px;
    
                // hide arrow
                &::-webkit-outer-spin-button,
                &::-webkit-inner-spin-button {
                    -webkit-appearance: none;
                    margin: 0;
                }
            }

            #unit-display{
                display:flex; justify-content: center; align-items: center;
                width: $unit-sel-size; height:25px;
                background-color: $primaryl3;
                outline:none; border:none; border-radius: 0 4px 4px 0;
                transform: translate3d(-1px, 0px, 0px); // for closing the rendering gap
                z-index: 2;
                cursor:pointer;

                &:hover, &.selected{
                    background-color: $primaryl5;

                    p{
                        color: $secondary;
                        font-weight: 600;
                    }
                }

                p{
                    font-family: "Inter";
                    font-size: 12px;
                    color: $secondarys5;
                    user-select: none; -webkit-user-select: none;
                    white-space: nowrap;
                }
            }
        }
    }
</style>