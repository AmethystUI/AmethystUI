<script context="module" lang="ts">
    // define selection data
    export interface multiSelectSelection<T> {
        iconDir : string, // where the app gets the icon image
        val : T, // the value associated with the selected item
        alt : string // description
    };

    export const textDecoration: multiSelectSelection<textDecoration>[] = [
        {
            iconDir : "$assets/icons/italicize.svg",
            val : "italicize",
            alt : "Italicize"
        }, {
            iconDir : "$assets/icons/underline.svg",
            val : "underline",
            alt : "Underline"
        }, {
            iconDir : "$assets/icons/strike-through.svg",
            val : "strike",
            alt : "Strikethrough"
        }
    ]

    export const typeFilters:multiSelectSelection<typeCategories>[] = [
        {
            iconDir : "$assets/icons/sans-serif.svg",
            val : "sans-serif",
            alt : "Sans Serif"
        }, {
            iconDir : "$assets/icons/serif.svg",
            val : "serif",
            alt : "Serif"
        }, {
            iconDir : "$assets/icons/display.svg",
            val : "display",
            alt : "Display"
        }, {
            iconDir : "$assets/icons/handWriting.svg",
            val : "handwriting",
            alt : "Script"
        }, {
            iconDir : "$assets/icons/monospace.svg",
            val : "monospace",
            alt : "Monospace"
        }
    ]
</script>

<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import Title from "./Title.svelte";
    const disp = createEventDispatcher();

    export let name: string = "";

    export let elements: multiSelectSelection<any>[];
    export let selections: number[] = []; // self explanatory

    export let maxWidth: string = "";
    export let minWidth: string = "";
    export let width = 100; // self explanatory
    export let height = 32; // self explanatory
    export let radius = 8; // self explanatory
    export let iconSize = 20; // self explanatory

    export let alignedHorizontally = true;
    export let sub: boolean;
    export let iconMargin: number = 10;
    export let showAlt: boolean = false;
    export let align: string = "center";
    export let alignTitle: string = "left";

    const alignmentToFlexAlign = {
        "left" : "flex-start",
        "center" : "center",
        "right" : "flex-start; flex-direction: row-reverse",
    }

    const addOrRemoveElements = (index:number) => {
        // check if the index is in the current selections. If so, remove it. Otherwise, add it.
        if(selections.includes(index)) { // remove the index from the current selections
            selections.splice(selections.indexOf(index), 1);
        } else { // add the index to the current selections
            selections.push(index);
        }

        // update svelte
        selections = selections;
        elements = elements;
        // dispatch callback with new values
        updateValue(selections);
    }

    const updateValue = (newSelections:number[]):void => {
        // $store = storeVal;
        selections = newSelections;

        disp("valueChange", {
            selectionIndicies: selections,
            values: selections.map(i => elements[i].val)
        })
    };
</script>

<main style={`${maxWidth !== "" ? `max-width:${maxWidth}` : ""}; ${minWidth !== "" ? `min-width:${minWidth}` : ""}`}>
    <Title name={name} sub={sub} align={alignTitle}/>

    <section class="container" style="width: {width}px; height: {height}px; border-radius: {radius}px; flex-direction: {alignedHorizontally ? "row" : "column"}">
        {#each elements as ele, i}
            <!-- use elementID to uniquely identify each choice. FYI, the ternary operators in selected-background style is kind of nasty, so I would collapse it when working on the HTML -->
            
            
            <div class={`toggle-element ${selections.includes(i) ? "selected" : ""}`} title={ele.alt}
                style={`
                    ${alignedHorizontally ? "width" : "height"}: ${(alignedHorizontally ? width : height) / elements.length}px;
                    justify-content: ${alignmentToFlexAlign[align]};
                `} on:click={() => {addOrRemoveElements(i)}}>

                <!-- the background that slightly grows -->
                <div class="element-selected-background" style="
                {alignedHorizontally ? "width" : "height"}: calc(100% + 1px);
                {alignedHorizontally ? "height" : "width"}: 100%;
                border-radius: {
                    // We have to do some ternary and detection here to get the border radiuses correct. These operators just detect if the selection has neighbors, and if it does how it should style the radius.
                    // The top left and bottom left have the same detection code, and the top right and bottom right have the same detection code.
                    alignedHorizontally ? ( // if aligned horizontally
                        `${selections.includes(i-1) ? 0 : radius}px ${selections.includes(i+1) ? 0 : radius}px ${selections.includes(i+1) ? 0 : radius}px ${selections.includes(i-1) ? 0 : radius}px`
                    ) : ( // if aligned vertically
                        `${selections.includes(i-1) ? 0 : radius}px ${selections.includes(i-1) ? 0 : radius}px ${selections.includes(i+1) ? 0 : radius}px ${selections.includes(i+1) ? 0 : radius}px`
                    )
                }"></div>
                <!-- the highlight that appears on hover -->
                <div class="element-hover-highlights" style="border-radius: {radius}px;"></div>

                <img src={ele.iconDir} alt={ele.alt}
                    style="height: {iconSize}px; margin: 0px {iconMargin}px 0px {iconMargin}px">

                {#if showAlt}
                    <p class="alt-text no-drag">{ele.alt}</p>
                {/if}
            </div>
        {/each}
    </section>
</main>

<style lang="scss">
    @import "/src/static/stylesheets/guideline";
    
    .no-anim {
        transition: none !important;
    }

    main{
        display: flex; flex-direction: column;

        .container{
            background-color: hsl(0,0%,100%,0%);
            margin:0px;
            display: flex; position:relative;
            transition: background-color 300ms ease; transition-delay: 0ms;
            overflow:hidden;
            
            .toggle-element{
                z-index:2;
                height:100%;
                display: flex; justify-content: center; align-items: center;
                cursor:pointer;
                position: relative;

                .element-hover-highlights{
                    width:100%; height:100%;
                    background-color: hsl(0,0%,100%,0%);
                    position: absolute;
                } .element-selected-background{
                    background-color: $accent;
                    opacity: 0;
                    position: absolute;
                }

                &:hover{
                    .element-hover-highlights{
                        background-color: hsl(0,0%,100%,10%);
                    }                    
                }

                &.selected{
                    .element-selected-background{ opacity: 1; }

                    &:hover{
                        .element-hover-highlights{
                            background-color: hsl(0,0%,100%,15%);
                        }
                    }
                    
                    img{
                        filter: invert(1); opacity: 1 !important;
                    }

                    .alt-text{
                        opacity: 1;
                    }
                }
    
                img{
                    padding:0;
                    filter: invert(1); opacity: 0.5;
                    user-select: none; -webkit-user-select: none; -webkit-user-drag: none;
                    transition: filter 100ms ease;
                }

                .alt-text{
                    color: $secondary;
                    opacity: 0.5;
                    font-size: 12px;
                    z-index: 2;
                    font-variation-settings: "wght" 300;
                }
            }
        }
    }
</style>