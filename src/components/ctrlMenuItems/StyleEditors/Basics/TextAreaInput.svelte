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
    export let placeHolder: string = "Text";
    export let currentParenteWidth: number = 360;

    import { createEventDispatcher } from 'svelte';
    import Title from './Title.svelte';
    const disp = createEventDispatcher();
    
    let valueInputField:HTMLTextAreaElement;
    let dispatchLocked = true;

    const preventNullV = () => {
        if (!v) v = "";
        dispatchLocked = true;
        disp("blurred");
    }
    const checkEscPress = (e:KeyboardEvent) => {
        dispatchLocked = false;
        
        if(e.key === "Escape"){
            e.preventDefault();
            valueInputField.blur();
            return;
        }
    }
    const autoGrow = () => {
        if(!valueInputField) return;

        valueInputField.style.height = "15px";
        valueInputField.style.height = (valueInputField.scrollHeight-1)+"px";
    }

    // grow based on change in size
    $: if(currentParenteWidth !== undefined){
        autoGrow();
    }

    // grow based on change in value
    let oldValue = "";
    $: if(!!valueInputField && v !== valueInputField.value) {
        valueInputField.value = v; // usually the HTML element will have its value lag behind a bit. So we'll just catch it up here.
        autoGrow(); // auto grow
    }

    // dispatch value changes if v changes
    $: if(v !== null && !dispatchLocked){ // do not send null
        // get substring if charLim exists
        if(charLim !== -1) v = v.substring(0, charLim)

        disp("updateValue", {
            v:v
        })
    }
</script>

<main style={`${hasMargin ? "margin-right:6px" : ""}; ${maxWidth !== "" ? `max-width:${maxWidth}` : ""}; ${minWidth !== "" ? `min-width:${minWidth}` : ""}`}>
    <Title name={name} sub={sub} align={alignTitle}/>

    <textarea bind:this={valueInputField} bind:value={v} style={`text-align: ${align}`} on:keydown={checkEscPress} on:input={autoGrow} on:blur={preventNullV} on:focus={() => disp("focused")} placeholder={placeHolder}/>
</main>

<style lang="scss">
    @import "../../../../../public/guideline";

    $input-pad: 8px;

    main{
        width: 100%;

        textarea{
            resize: none;
            height:22px; width:calc(100% - $input-pad * 2);
            margin:0; padding: 7px $input-pad 0 $input-pad;
            background-color: $primaryl3;
            outline:none; border:none; border-radius: 4px;
            color:white;
            overflow: hidden;
            
            font-family: "Inter";
            font-weight: 400;
            font-size: 12px;
            letter-spacing: 0.2px;

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