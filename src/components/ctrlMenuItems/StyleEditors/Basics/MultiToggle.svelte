<script context="module" lang="ts">
    import type {
        textCasing as textCasingType,
        textAlignment as textAlignmentType
    } from '../../../../stores/collection';
    
    // define selection data
    export interface multiToggleSelection<T> {
        iconDir : string, // where the app gets the icon image
        val : T, // the value associated with the selected item
        alt : string // description
    };

    // default sets
    export const textAlignment:multiToggleSelection<textAlignmentType>[] = [
        {
            iconDir : "./assets/icons/align-left.svg",
            val : "left",
            alt : "Align Left"
        }, {
            iconDir : "./assets/icons/align-center.svg",
            val : "center",
            alt : "Align Center"
        }, {
            iconDir : "./assets/icons/align-right.svg",
            val : "right",
            alt : "Align Right"
        }, {
            iconDir : "./assets/icons/align-justify.svg",
            val : "justify",
            alt : "Justify Content"
        }
    ]

    export const textCasing:multiToggleSelection<textCasingType>[] = [
        {
            iconDir : "./assets/icons/lower-case.svg",
            val : "lower",
            alt : "All Lowercase"
        }, {
            iconDir : "./assets/icons/mix-case.svg",
            val : "mix",
            alt : "Mixed Case"
        }, {
            iconDir : "./assets/icons/upper-case.svg",
            val : "upper",
            alt : "All Uppercase"
        }
    ]
</script>

<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import Title from './Title.svelte';
    const disp = createEventDispatcher();

    export let elements : multiToggleSelection<any>[]; // available selection
    export let selection : number; // self explanatory
    export let name = "" // self explanatory
    export let sub = false // self explanatory
    export let width = 100; // self explanatory
    export let height = 32; // self explanatory
    export let radius = 8; // self explanatory
    export let iconSize = 20; // self explanatory
    selection = Math.min(elements.length-1, Math.max(0, selection));

    let container:HTMLElement;
    let selector:HTMLElement;
    
    $: selectorX = (width / elements.length) * selection;

    const updateValue = (newSelection:number):void => {
        // $store = storeVal;
        selection = newSelection;

        disp("valueChange", {
            index: selection,
            value: elements[selection].val
        })
    };

    // remove selector animation blocker once it's loaded
    $: if(!!selector){
        setTimeout(() => { // push removal to the next execution cycle so that the animation doesnt play
            selector.classList.remove("no-anim");
        }, 0);
    }
</script>

<!--HTML -->
<main>
    <Title name={name} sub={sub}/>
    
    <section class="container" style="width: {width}px; height: {height}px; border-radius: {radius}px" bind:this={container}>
        {#each elements as ele, i}
            <!-- use elementID to uniquely identify each choice -->
            <div class="toggle-element" title={ele.alt} style="width:{width / elements.length}px" on:click={() => updateValue(i)}>
                <img src={ele.iconDir} alt={ele.alt} class={selection === i ? "selected" : ""}
                    style="height: {iconSize}px">
            </div>
        {/each}
        
        <!-- the selector -->
        <div bind:this={selector} class="selector no-anim" style="width:{width / elements.length}px; transform: translateX({selectorX}px)"></div>
    </section>
</main>

<!--STYLE -->
<style lang="scss">
    @import "../public/guideline";

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
            
            &:hover{
                background-color: hsl(0,0%,100%,10%);
            }
            
            .toggle-element{
                z-index:2;
                height:100%;
                display: flex; justify-content: center; align-items: center;
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
            }
    
            .selector{
                height:100%;
                background: $accent;
                position:absolute;
                border-radius: inherit;
                transition: transform 300ms $normal-ease-out;
            }
        }
    }
</style>