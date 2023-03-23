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

    import { createEventDispatcher, onMount } from 'svelte';
    import Title from './Title.svelte';
    const disp = createEventDispatcher();
    
    let valueInputField:HTMLInputElement;
    
    const focused = () => { // executes when the input field is focused
        disp("focused"); // dispatch the focused event so the parent component can react to it
    }

    const blurred = () => {
        valueInputField.value = lastWorkingV; // set the value of the input field to the last working value if it's not a valid number

        disp("updateValue", { // dispatch the updateValue event so the parent component can react to it
            v: lastWorkingV
        })

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
            
            disp("updateValue", { // dispatch the updateValue event so the parent component can react to it
                v: lastWorkingV
            })
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

    onMount(() => {
        valueInputField.value = v;
    })
</script>

<main style={`${hasMargin ? "margin-right:6px" : ""}; ${maxWidth !== "" ? `max-width:${maxWidth}` : ""}; ${minWidth !== "" ? `min-width:${minWidth}` : ""}`}>
    <Title name={name} sub={sub} align={alignTitle} textClrOverride={textClrOverride}/>

    <input bind:this={valueInputField} style={`text-align: ${align}`} on:keydown={keyPress} on:blur={blurred} on:focus={focused}/>
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