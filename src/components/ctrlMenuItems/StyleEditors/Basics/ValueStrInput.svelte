<script lang="ts">
    export let name:string;
    export let v: string;
    let lastWorkingV = v;
    let fallbackV = v;
    export let hasMargin: boolean;
    export let maxWidth: string = "";
    export let minWidth: string = "";
    export let sub: boolean;
    export let charLim: number = -1;
    export let align: string = "left";
    export let alignTitle: string = align;
    export let placeHolder: string = "";
    export let allowedCharRegex: RegExp = /^[a-zA-Z0-9]$/;

    import { createEventDispatcher, onMount } from 'svelte';
    import Title from './Title.svelte';
    const disp = createEventDispatcher();
    
    let valueInputField:HTMLInputElement;

    const focused = () => { // executes when the input field is focused
        fallbackV = valueInputField.value; // get a fallback in case the input field is empty or something weird happens
        disp("focused"); // dispatch the focused event so the parent component can react to it

        attemptUpdateInputField();
        disp("updateValue", { // do an initial update to get things going
            v: lastWorkingV
        })
    }

    const blurred = () => {
        if(lastWorkingV.length === 0){
            lastWorkingV = fallbackV;
        }

        valueInputField.value = lastWorkingV; // set the value of the input field to the last working value if it's not a valid number

        disp("updateValue", { // dispatch the updateValue event so the parent component can react to it
            v: lastWorkingV
        })

        disp("blurred"); // dispatch the blurred event so the parent component can react to it
    }

    const keyPress = (e?:KeyboardEvent) => {
        setTimeout(() => { // wait for the content of the input field to be updated. Basically push this event to the next frame.
            // update lastWorking V and filter it thru our regex. Also cut it down to our charLim
            lastWorkingV = v = valueInputField.value;
            for(let i = valueInputField.value.length - 1; i > -1; i--){
                // check if regex matches. If not, remove character
                if(!allowedCharRegex.test(lastWorkingV[i])) lastWorkingV = lastWorkingV.substring(0,i) + lastWorkingV.substring(i+1,lastWorkingV.length)
            }
            // cut down to charLim
            if(charLim !== -1) lastWorkingV = lastWorkingV.substring(0, charLim);
            
            if(e && (e.key === "Enter" || e.key === "Escape")){ // if the user presses enter or escape, blur the input field
                e.preventDefault();
                valueInputField.blur();
                return;
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
    <Title name={name} sub={sub} align={alignTitle}/>
    
    <input bind:this={valueInputField} style={`text-align: ${align}`} on:keydown={keyPress} on:paste={() => keyPress()} on:blur={blurred} on:focus={focused} placeholder={placeHolder}/>
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

            &::placeholder{
                opacity: 0.4;
            }

            // hide arrow
            &::-webkit-outer-spin-button,
            &::-webkit-inner-spin-button {
                -webkit-appearance: none;
                margin: 0;
            }
        }
    }
</style>