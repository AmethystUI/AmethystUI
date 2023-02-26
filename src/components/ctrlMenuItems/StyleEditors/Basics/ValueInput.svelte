<script lang="ts">
    export let name:string;
    export let v: any;
    let lastWorkingV = v;
    export let hasMargin: boolean;
    export let maxWidth: string = "";
    export let minWidth: string = "";
    export let sub: boolean;
    export let maxVal:number = 5000;
    export let minVal:number = 0;
    export let align: string = "left";
    export let alignTitle: string = align;
    export let textClrOverride:string = "";

    import { createEventDispatcher } from 'svelte';
    import Title from './Title.svelte';
    const disp = createEventDispatcher();
    
    let valueInputField:HTMLInputElement;
    let dispatchLocked = false;
    
    const preventNullV = () => {
        if (v === undefined || v.length === 0 || v === "-") v = 0;
        if (v > maxVal) v = maxVal;
        if (v < minVal) v = minVal;
        dispatchLocked = true;

        if(!isNaN(Number(v))) lastWorkingV = v;
        
        v = lastWorkingV;
        disp("updateValue", {
            v:lastWorkingV
        })
        disp("blurred");
    }

    const keyPress = (e:KeyboardEvent) => {
        
        let deltaV = 1;
        if(e.metaKey || e.ctrlKey) deltaV = 0.1;
        if(e.shiftKey) deltaV = 10;

        dispatchLocked = false;
        
        if(e.key === "Enter" || e.key === "Escape" || e.key === "Escape"){
            e.preventDefault();
            valueInputField.blur();
        }        // check when the user use the arrow key
        else if(e.key === "ArrowUp"){
            e.preventDefault();
            if(v+deltaV < maxVal){
                v += deltaV;
                v = Math.round(v * 100) / 100; // round to 2 decimal place
            } else { // prevent overflow
                v = maxVal;
            }
            if(!isNaN(Number(v))) lastWorkingV = v;
        }
        else if(e.key === "ArrowDown"){
            e.preventDefault();
            if(v-deltaV > minVal){
                v -= deltaV;
                v = Math.round(v * 100) / 100; // round to 2 decimal place
            } else {
                v = minVal;
            }
            if(!isNaN(Number(v))) lastWorkingV = v;
        }
    }

    // Dispatch value changes when v changes
    $: if (v !== undefined && String(v).length > 0 && String(v) !== "-") {
        // Check if v is a valid value and not just a change in unit
        for (let i = v.length - 1; i > -1; i--) { // Clean up every character of v
            const isNumberOrPeriod = /^[0-9\.]$/.test(v[i]); // Check if the character is a number or period
            if ((i === 0 && !isNumberOrPeriod && v[i] !== "-") || (i !== 0 && !isNumberOrPeriod)) { 
                // Remove the character if it's not a number, period, or dash, unless if it's the first character and the first character is a dash.
                v = v.substring(0, i) + v.substring(i + 1, v.length);
            }
        }

        // Check if v is a valid number
        if (!isNaN(Number(v))) {
            // Round v to within the min/max range and update lastWorkingV
            if (String(v)[String(v).length - 1] !== ".") {
                v = Math.max(Math.min(v, maxVal), minVal);
            }
            lastWorkingV = Number(v);
        }

        if(!dispatchLocked) disp("updateValue", {
            v: lastWorkingV,
        });
    }
</script>

<main style={`${hasMargin ? "margin-right:6px" : ""}; ${maxWidth !== "" ? `max-width:${maxWidth}` : ""}; ${minWidth !== "" ? `min-width:${minWidth}` : ""}`}>
    <Title name={name} sub={sub} align={alignTitle} textClrOverride={textClrOverride}/>

    <input bind:this={valueInputField} bind:value={v} style={`text-align: ${align}`} on:keydown={keyPress} on:blur={preventNullV} on:focus={() => disp("focused")}/>
</main>

<style lang="scss">
    @import "../../../../../public/guideline";

    $input-pad: 7px;

    main{
        width: 100%;

        input{
            height:25px; width:calc(100% - $input-pad * 2);
            margin:0; padding: 0 $input-pad 0 $input-pad;
            background-color: $primaryl3;
            outline:none; border:none; border-radius: 4px;
            color:white;
            
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
    }
</style>