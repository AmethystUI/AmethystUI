<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    const disp = createEventDispatcher();

    export let name:string;

    export let checkboxSize:number = 16;
    export let textOnRight = true;
    export let margin:number = 10;
    export let textSize:number = 16;
    export let textColor:string = "#fff";
    export let letterSpacing: number = 0;
    export let textWeight:number = 400;
    export let checkBoxMargin: string = "0px";

    export let checked:boolean = false;

    const toggleChecked = () => {
        checked = !checked;
        disp("updateValue", {
            v:checked
        })
    }
</script>

<!--HTML -->
<main style="flex-direction: {textOnRight ? "row" : "row-reverse"}; margin: {checkBoxMargin}">
    <!-- <input type="checkbox" checked={checked} on:click={updateChecked}> -->
    <section id="check-container">
        <input type="checkbox" checked={checked} on:click={toggleChecked} style="width: {checkboxSize}px; height: {checkboxSize}px">
        <img src="$assets/icons/checkmark.svg" alt="" style="opacity: {checked ? "1" : "0"};">
    </section>

    {#if !!name}
        <div style="width:{margin}px"></div>
        <p style="font-size: {textSize}px; font-weight: {textWeight}; color:{textColor}; {!!letterSpacing ? `letter-spacing: ${letterSpacing}px` : ""}">{name}</p>
    {/if}
</main>

<!--STYLE -->
<style lang="scss">
    @import "/src/static/stylesheets/guideline";

    main{
        display: flex; align-items: center; width: fit-content;

        #check-container{
            display:flex; align-items:center; height:100%;
            margin:0;
            position: relative;

            img{
                position:absolute;
                height:75%; width:75%;
                top:50%; left:50%; transform: translate(-50%, -50%);
                pointer-events: none;

                filter: invert(1); opacity: 1;
            }

            input{
                /* hide default style */
                -webkit-appearance: none;
                appearance: none;
                background: $primaryl1;
                
                border-radius: 3px;
    
                margin: 0;
                border: 1.5px solid $primaryl5;
    
                &:checked{
                    background: $accent;
                    border:none;
                }
            }
        }
    }
</style>