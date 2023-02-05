<script lang="ts">
    export let name:string;
    export let v: string;
    export let hasMargin: boolean;
    export let maxWidth: string = "";
    export let minWidth: string = "";
    export let sub: boolean;
    export let charLim: number = -1;
    export let align: string = "left";
    export let alignTitle: string = align;
    export let placeHolder: string = "";
    export let allowedCharRegex: RegExp = /^[a-zA-Z0-9]$/;

    import { createEventDispatcher } from 'svelte';
    import Title from './Title.svelte';
    const disp = createEventDispatcher();
    
    let valueInputField:HTMLInputElement;
    let dispatchLocked = true;

    const preventNullV = () => {
        if (!v) v = "";
        dispatchLocked = true;
        disp("blurred");
    }
    const checkEnterPress = (e:KeyboardEvent) => {
        dispatchLocked = false;
        
        if(e.key === "Enter" || e.key === "Escape" || e.key === "Escape"){
            e.preventDefault();
            valueInputField.blur();
            return;
        }
    }

    // dispatch value changes if v changes
    $: if(v !== null && !dispatchLocked){ // do not send null
        // clean up V according to regex 
        for(let i = v.length-1; i > -1; i--){
            // check if regex matches. If not, remove character
            if(!allowedCharRegex.test(v[i])) v = v.substring(0,i) + v.substring(i+1,v.length)
        }
        // get substring if charLim exists
        if(charLim !== -1) v = v.substring(0, charLim)

        disp("updateValue", {
            v:v
        })
    }
</script>

<main style={`${hasMargin ? "margin-right:6px" : ""}; ${maxWidth !== "" ? `max-width:${maxWidth}` : ""}; ${minWidth !== "" ? `min-width:${minWidth}` : ""}`}>
    <Title name={name} sub={sub} align={alignTitle}/>
    
    <input bind:this={valueInputField} bind:value={v} style={`text-align: ${align}`} on:keydown={checkEnterPress} on:blur={preventNullV} on:focus={() => disp("focused")} placeholder={placeHolder}/>
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