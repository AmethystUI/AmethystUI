<script context="module" lang="ts">
    // define selection data
    export interface multiToggleSelection<T> {
        iconDir : string, // where the app gets the icon image
        val : T, // the value associated with the selected item
        alt : string // description
    };
    
    // define content alignement types
    export enum alignmentType {
        left = "flex-start",
        center = "center",
        right = "flex-end",
        stretch = "space-between"
    }

    // default sets
    export const textAlignment:multiToggleSelection<textAlignment>[] = [
        {
            iconDir : "/src/assets/icons/align-left.svg",
            val : "left",
            alt : "Align Left"
        }, {
            iconDir : "/src/assets/icons/align-center.svg",
            val : "center",
            alt : "Align Center"
        }, {
            iconDir : "/src/assets/icons/align-right.svg",
            val : "right",
            alt : "Align Right"
        }, {
            iconDir : "/src/assets/icons/align-justify.svg",
            val : "justify",
            alt : "Justify Content"
        }
    ]

    export const textCasing:multiToggleSelection<textCasing>[] = [
        {
            iconDir : "/src/assets/icons/lower-case.svg",
            val : "lowercase",
            alt : "All Lowercase"
        }, {
            iconDir : "/src/assets/icons/mix-case.svg",
            val : "none",
            alt : "Mixed Case"
        }, {
            iconDir : "/src/assets/icons/upper-case.svg",
            val : "uppercase",
            alt : "All Uppercase"
        }
    ]
</script>

<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import Title from './Title.svelte';
    const disp = createEventDispatcher();

    // base effects
    export let elements : multiToggleSelection<any>[]; // available selection
    export let selection : number; // self explanatory
    export let name = "" // self explanatory
    export let width = 100; // self explanatory
    export let height = 32; // self explanatory
    
    // visual effects
    export let sub = false // self explanatory
    export let useIcons = true; // self explanatory
    export let useText = false; // self explanatory
    export let radius = 8; // self explanatory
    export let iconSize = 20; // self explanatory
    export let textSize = 10; // self explanatory
    export let textWeight = 500; // self explanatory
    export let textClrOverride = "";
    
    // alignment stuff
    export let contentAlignment: alignmentType = alignmentType.center; // self explanatory
    export let horizontallyAligned = true; // self explanatory

    export let useHoverEffect: boolean = true;

    selection = Math.min(elements.length-1, Math.max(0, selection));

    let container:HTMLElement;
    let selector:HTMLElement;
    
    $: selectorX = horizontallyAligned ? (width / elements.length) * selection : 0;
    $: selectorY = horizontallyAligned ? 0 : (height / elements.length) * selection;
    $: elementWidth = horizontallyAligned ? width / elements.length : width;
    $: elementHeight = horizontallyAligned ? height : height / elements.length;

    const updateValue = (newSelection:number):void => {
        // $store = storeVal;
        selection = newSelection;

        disp("valueChange", {
            index: selection,
            value: elements[selection].val
        })
    };

    // remove selector animation blocker once it's loaded
    $: setTimeout(() => { // push removal to the next execution cycle so that the animation doesnt play
        if(!!selector) selector.classList.remove("no-anim");
    }, 0);
</script>

<!--HTML -->
<main>
    <Title name={name} sub={sub} textClrOverride={textClrOverride}/>
    
    <section
    class="container {useHoverEffect ? "use-hover" : ""} {horizontallyAligned ? "horizontally-aligned" : "vertically-aligned"}"
    style="width: {width}px; height: {height}px; border-radius: {radius}px;"
    bind:this={container}>
    
        {#each elements as ele, i}
            <!-- use elementID to uniquely identify each choice -->
            <div class="toggle-element" title={ele.alt} style="width:{elementWidth-20}px; height:{elementHeight}px;  flex-direction: column; justify-content: {contentAlignment};" on:click={() => updateValue(i)}>
                {#if useIcons}
                    <img src={ele.iconDir} alt={ele.alt} class={selection === i ? "selected" : ""}
                        style="height: {iconSize}px">
                {/if}
                {#if useIcons && useText}
                    <!-- put a divider here if both are shown -->
                    <div style="width: 10px; height: 5px;"></div>
                {/if}
                {#if useText}
                    <p class={`no-drag icon-text ${selection === i ? "selected" : ""}`} style="font-size: {textSize}px; font-weight: {textWeight}">{ele.alt}</p>
                {/if}
            </div>
        {/each}
        
        <!-- the selector -->
        <div
        bind:this={selector}
        class="selector no-anim"
        style=" width:{elementWidth}px; height:{elementHeight}px; transform: translate({selectorX}px, {selectorY}px)"
        ></div>
    </section>
</main>

<!--STYLE -->
<style lang="scss">
    @import "/src/static/stylesheets/guideline";

    .no-anim {
        transition: none !important;
    }

    main{
        display: flex; flex-direction: column;

        .container{
            background-color: hsl(0,0%,100%,0%);
            display: flex; position:relative;
            transition: background-color 300ms ease; transition-delay: 0ms;
            overflow:hidden;
            
            &.horizontallyAligned{
                flex-direction: row;
            } &.vertically-aligned{
                flex-direction: column;
            }

            &.use-hover:hover{
                background-color: hsl(0,0%,100%,10%);
            }
            
            .toggle-element{
                z-index:2;
                display: flex; align-items: center;
                padding: 0px 10px 0px 10px;
                cursor:pointer;
    
                img{
                    margin:0; padding:0;
                    filter: invert(1); opacity: 0.5;
                    user-select: none; -webkit-user-select: none; -webkit-user-drag: none;
                    transition: filter 100ms ease;
                    
                    &.selected{
                        filter: invert(1); opacity: 1 !important;
                    }
                }

                .icon-text{
                    color: $secondarys5;
                    text-align: center;
                    
                    transition: color 100ms ease;

                    &.selected {
                        color: $secondary;
                    }
                }
            }
    
            .selector{
                background: $accent;
                position:absolute;
                border-radius: inherit;
                transition: transform 300ms $normal-ease-out;
            }
        }
    }
</style>