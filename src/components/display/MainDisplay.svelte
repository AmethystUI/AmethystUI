<script lang="ts">
    import { addOverride, collection, focusedComponent, HTMltagInfo, selectedComponent, selectedOverride, focusedOverride, layerDeleteLock } from "../../stores/collection";
    import ElementResizer from "./displayControl/ElementResizer.svelte";

    import Div from "./displayElements/Div.svelte";

    export let leftMenuWidth:number;
    export let rightMenuWidth:number;

    $: currentComponent = $collection[$selectedComponent];
    $: currentOverride = $selectedOverride !== -1 ? $collection[$selectedComponent].styleOverrides[$selectedOverride] : undefined;
    $: currentStyle = !!currentComponent || !!currentOverride ? ($selectedOverride === -1 ? currentComponent.style : currentOverride.style) : undefined;
</script>

<!-- HTML -->
<main style="position:absolute; width:calc(100vw - {leftMenuWidth+1}px - {rightMenuWidth-1}px); left: {leftMenuWidth+1}px; overflow:visible">
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
    `} style={`
        width: calc(${currentStyle.width ? currentStyle.width.v : 100}${currentStyle.width ? currentStyle.width.u : "px"}
            + ${currentStyle.paddingLeft ? currentStyle.paddingLeft.v : 100}${currentStyle.paddingLeft ? currentStyle.paddingLeft.u : "px"}
            + ${currentStyle.paddingRight ? currentStyle.paddingRight.v : 100}${currentStyle.paddingRight ? currentStyle.paddingRight.u : "px"});
        height: calc(${currentStyle.height ? currentStyle.height.v : 100}${currentStyle.height ? currentStyle.height.u : "px"}
            + ${currentStyle.paddingTop ? currentStyle.paddingTop.v : 0}${currentStyle.paddingTop ? currentStyle.paddingTop.u : "px"}
            + ${currentStyle.paddingBottom ? currentStyle.paddingBottom.v : 0}${currentStyle.paddingBottom ? currentStyle.paddingBottom.u : "px"});
    `}>
        <ElementResizer />

        {#if currentComponent.type === "DIV"}
            <Div/>
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
            border-radius: 5px;
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