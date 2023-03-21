<script lang="ts">
    import { collection, selectedComponent, selectedOverride } from "../../stores/collection";
    import ElementResizer from "./displayControl/ElementResizer.svelte";
    import Canvas from "./displayElements/Canvas.svelte";

    import Div from "./displayElements/Div.svelte";
    import Headings from "./displayElements/Headings.svelte";
    import Section from "./displayElements/Section.svelte";
    import Span from "./displayElements/Span.svelte";

    export let leftMenuWidth:number;
    export let rightMenuWidth:number;

    $: currentComponent = $collection[$selectedComponent];
    $: currentOverride = $selectedOverride !== -1 ? $collection[$selectedComponent].styleOverrides[$selectedOverride] : undefined;
    $: currentStyle = (currentOverride?.style ?? currentComponent?.style) ?? undefined;

    // style={`
    //     width: calc(${currentStyle.width?.v ?? "0"}${currentStyle.width?.u ?? "px"}
    //         + ${currentStyle.paddingLeft?.v ?? "0"}${currentStyle.paddingLeft?.u ?? "px"}
    //         + ${currentStyle.paddingRight?.v ?? "0"}${currentStyle.paddingRight?.u ?? "px"});
    //     height: calc(${currentStyle.height?.v ?? "0"}${currentStyle.height?.u ?? "px"}
    //         + ${currentStyle.paddingTop?.v ?? "0"}${currentStyle.paddingTop?.u ?? "px"}
    //         + ${currentStyle.paddingBottom?.v ?? "0"}${currentStyle.paddingBottom?.u ?? "px"});
    // `}
</script>

<!-- HTML -->
<main class="no-drag" style="position:absolute; width:calc(100vw - {leftMenuWidth+1}px - {rightMenuWidth-1}px); left: {leftMenuWidth+1}px; overflow:visible">
    <!-- if no component or override is selected, show the app hint -->
    {#if $selectedComponent === -1 && $selectedOverride === -1}
    
    <section id="app-hint-add-elmnt">
        <p>Click <span>+</span> to add components for customization</p>
    </section>
    
    {:else} <!-- this is where we display our shit -->

    <!-- render the component -->
    <section class={`
        ${currentComponent.showOutline && ( // these logic are basically saying what needs to be true for the outline to show
            !currentStyle.USEBORDER // all border width needs to be 0
            && (!currentStyle.USEBACKGROUND || !!currentStyle.USEBACKGROUND && currentStyle.backgroundColor.a < 10) // background needs to be disabled OR background enabled with opacity at 0
            || currentStyle.opacity < 10// OR opacity is less than 10, then absolutely show
        ) ? "outlined" : ""}
    `}>
        <ElementResizer />

        {#if currentComponent?.type === "DIV"}
            <Div/>
        {:else if currentComponent?.type === "SECTION"}
            <Section/>
        {:else if currentComponent?.type === "SPAN"}
            <Span/>
        {:else if currentComponent?.type === "CANVAS"}
            <Canvas/>
        {:else if ["H1", "H2", "H3", "H4", "H5", "H6"].includes(currentComponent?.type)}
            <Headings headingType={ currentComponent?.type.toLowerCase() }/>
        {/if}
    </section>
    
    {/if}
</main>

<!-- STYLE -->
<style lang="scss">
    @import "../../../public/guideline";
    $outline-color: $secondarys7;

    main{
        height:calc(100vh - 65px);
        background:none;
        top:65px;
        display: flex; justify-content: center; align-items: center; flex-direction: column;

        #app-hint-add-elmnt{
            position:absolute; top: 50%; left:50%;
            transform: translate3d(-50%, -50%, 0px);
            user-select: none; -webkit-user-select: none;

            p{
                text-align: center;
                color: $secondarys6;
                font-size: 16px;
                line-height: 24px;

                span{
                    background-color: $secondarys6;
                    color: $primaryl1;
                    padding: 0px 9px 0px 9px;
                    border-radius: 5px;
                    font-family: "Fira Code";
                    font-variation-settings: "wght" 600;
                }
            }
        }

        section{
            position:absolute;
        }

        .outlined{
            background: linear-gradient(90deg, $outline-color 50%, transparent 50%), 
                        linear-gradient(90deg, $outline-color 50%, transparent 50%), 
                        linear-gradient(0deg, $outline-color 50%, transparent 50%), 
                        linear-gradient(0deg, $outline-color 50%, transparent 50%);
            background-repeat: repeat-x, repeat-x, repeat-y, repeat-y;
            background-size: 8px 1px, 8px 1px, 1px 8px, 1px 8px;
            background-position: 0% 0%, 100% 100%, 0% 100%, 100% 0%;
            padding:0.5px;
            animation: dash 0.5s linear infinite;
            overflow: visible;
        }

        @keyframes dash {
            to {
                background-position: 16px 0%, calc(100% - 16px) 100%, 0% calc(100% - 16px), 100% 16px;
            }
        }
    }
</style>