<script lang="ts">
    type T = $$Generic;

    export let name:string;
    export let sub: boolean;
    export let v: T;
    export let possibleValues: T[];
    export let hasMargin: boolean;
    export let maxWidth: string = "";
    export let minWidth: string = "";
    export let align: string = "center";
    export let alignTitle: string = "left";
    
    import { createEventDispatcher } from 'svelte';
    import Title from './Title.svelte';
    const disp = createEventDispatcher();
    
    let unitSelOpen = false;

    let dropDownElement:HTMLElement;
    let openDirection = "open-top";
    let trackingDir = false;

    // dispatch value changes if v changes
    $: if(v !== null){ // do not send null
        disp("updateValue", {
            v:v
        })
    }

    const openUnitSel = () => {
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
        if(openDirection == "open-bottom") openDirection = (bbRect.y+bbRect.height+margin > window.innerHeight) ? "open-top" : "open-bottom";
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
</script>

<main style={`${hasMargin ? "margin-right:6px;" : ""} ${maxWidth !== "" ? `max-width:${maxWidth};` : ""} ${minWidth !== "" ? `min-width:${minWidth}` : ""}`}>
    <Title name={name} sub={sub} align={alignTitle}/>

    <div id="main-box" class={`${openDirection} ${unitSelOpen ? "sel-opened" : ""}`} on:click={openUnitSel}>
        <p class={`${sub ? "sub" : ""}`} style={`text-align: ${align}`}>{v}&nbsp;</p>
    </div>

    <!-- the dropdown menu -->
    <section id="unit-sel-container" class={`${openDirection} ${!unitSelOpen ? "hidden" : ""}`} bind:this={dropDownElement}>
        {#each possibleValues.filter(cV => cV !== v) as value (value)}
            <div on:click={() => v=value}><p>
                {value}
            </p></div>
        {/each}
    </section>
</main>

<style lang="scss">
    @import "../../../../../public/guideline";

    $input-pad: 7px;

    main{
        width: 100%;
        position:relative;

        #main-box{
            height:25px; width:calc(100% - $input-pad * 2);
            margin:0; padding: 0 $input-pad 0 $input-pad;
            background-color: $primaryl3;
            outline:none; border:none; border-radius: 4px;
            color:white;
            
            font-family: "Inter";
            font-weight: 400;
            font-size: 12px;

            cursor:pointer;

            display: flex; justify-content: center; align-items: center;
            
            p{
                width:100%;
                font-family: "Inter";
                font-size: 12px;
                color: $secondarys5;
                user-select: none; -webkit-user-select: none;
                white-space: nowrap;
            }

            &:hover, &.selected{
                background-color: $primaryl5;

                p{
                    color: $secondary;
                    font-weight: 600;
                }
            }

            // hide arrow
            &::-webkit-outer-spin-button,
            &::-webkit-inner-spin-button {
                -webkit-appearance: none;
                margin: 0;
            }
        }

        #unit-sel-container{
            position:absolute;
            width:100%; height:fit-content;
            background-color: hsla(200,5%,21%,50%);
            backdrop-filter: blur(20px) !important; -webkit-backdrop-filter: blur(20px) !important;
            overflow:hidden;
            display:flex; flex-direction: column;
            z-index: 1000;

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
                display: flex; justify-content: center; align-items: center;
                
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
                    font-family: "Inter";
                    font-size: 12px;
                    color: $secondarys5;
                    user-select: none; -webkit-user-select: none;
                }
            }
        }

        .sel-opened{
            &#main-box{
                z-index:1001 !important;

                background-color: $primaryl5;

                p{
                    color: $secondary;
                    font-weight: 600;
                }

                &.open-bottom{
                    border-radius: 4px 4px 0 0 !important;
                } &.open-top{
                    border-radius: 0 0 4px 4px !important;
                }
            }
        }
    }
</style>