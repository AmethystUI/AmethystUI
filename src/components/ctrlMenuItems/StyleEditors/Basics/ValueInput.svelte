<script lang="ts">
    export let name:string;
    export let v: any;
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
    let dispatchLocked = true;
    
    const preventNullV = () => {
        if (v === undefined || v.length === 0 || v === "-") v = 0;
        if (v > maxVal) v = maxVal;
        if (v < minVal) v = minVal;
        dispatchLocked = true;
        
        disp("updateValue", {
            v:v
        })
        disp("blurred");
    }
    const keyPress = (e:KeyboardEvent) => {
        dispatchLocked = false;

        if(e.key === "Enter" || e.key === "Escape" || e.key === "Escape"){
            e.preventDefault();
            valueInputField.blur();
        }

        // check when the user use the arrow key
        else if(e.key === "ArrowUp" && v+1 <= maxVal){
            e.preventDefault();
            v++;        
        }
        else if(e.key === "ArrowDown" && v-1 >= minVal){
            e.preventDefault();
            v--;
        }

        if(v !== undefined && String(v).length > 0 && !isNaN(Number(v))){
            disp("updateValue", {
                v: v
            })    
        }
    }

    // dispatch value changes if v changes
    $: if(v !== undefined && v.length > 0 && v !== "-" && !dispatchLocked){ // do not send null
        // clean up every character of v except the first character. Make sure this only runs when V is not undefined        
        for(let i = v.length-1; i > -1; i--){
            // check if regex matches. If not, remove character
            if((i === 0 && !/^\d+$/.test(v[i]) && v[i] !== "-") || (i !== 0 && !/^\d+$/.test(v[i]))) v = v.substring(0,i) + v.substring(i+1,v.length); //remove the letter if it's not a number
        }

        if(!isNaN(Number(v))) {
            v = Math.max(Math.min(v, maxVal), minVal)
        } else {
            v = 0;
        }

        disp("updateValue", {
            v: v
        })
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
            &[type=number] {
                appearance: textfield;
                -moz-appearance: textfield;
            }
        }
    }
</style>