<script lang="ts">
    import { collection, selectedComponent, selectedOverride } from "$lib/stores/collection";
    import ElementResizer from "./displayControl/ElementResizer.svelte";
    import Canvas from "./displayElements/Canvas.svelte";

    import Div from "./displayElements/Div.svelte";
    import Headings from "./displayElements/Texts.svelte";
    import Section from "./displayElements/Section.svelte";
    import Span from "./displayElements/Span.svelte";
    import Anchor from "./displayElements/Anchor.svelte";
    import Button from "./displayElements/Button.svelte";
    import Input from "./displayElements/Input.svelte";
    import Textarea from "./displayElements/Textarea.svelte";
    import HorizontalLine from "./displayElements/HorizontalLine.svelte";
    import { canvasStatus } from "$lib/stores/canvasStatus";

    export let leftMenuWidth:number;
    export let rightMenuWidth:number;

    $: currentComponent = $collection[$selectedComponent];
    $: currentOverride = $selectedOverride !== -1 ? $collection[$selectedComponent].styleOverrides[$selectedOverride] : undefined;
    $: currentStyle = (currentOverride?.style ?? currentComponent?.style) ?? undefined;
</script>

<!-- HTML -->
<main class="no-drag {$canvasStatus.darkCanvas ? "darkMode" : "lightMode"}" style="position:absolute; width:calc(100vw - {leftMenuWidth+1}px - {rightMenuWidth-1}px); left: {leftMenuWidth+1}px;">
    <!-- if no component or override is selected, show the app hint -->
    {#if $selectedComponent === -1 && $selectedOverride === -1}
    
    <section id="hinting-text">
        <p>Click <span>+</span> to add elements for customization.</p>
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
        {#if currentComponent?.type === "DIV"}
            <Div/>
        {:else if currentComponent?.type === "SECTION"}
            <Section/>
        {:else if currentComponent?.type === "SPAN"}
            <Span/>
        {:else if currentComponent?.type === "CANVAS"}
            <Canvas/>
        {:else if ["H1", "H2", "H3", "H4", "H5", "H6", "P"].includes(currentComponent?.type)}
            <Headings headingType={ currentComponent?.type.toLowerCase() }/>
        {:else if currentComponent?.type === "A"}
            <Anchor />
        {:else if currentComponent?.type === "BUTTON"}
            <Button />
        {:else if currentComponent?.type === "INPUT"}
            <Input />
        {:else if currentComponent?.type === "TEXTAREA"}
            <Textarea />
        {:else if currentComponent?.type === "HR"}
            <HorizontalLine />
        {/if}
    </section>
    
    {/if}
</main>

<!-- STYLE -->
<style lang="scss">
    @import "/src/static/stylesheets/guideline";
    $outline-color: $secondarys7;

    main{
        $transitionDuration: 200ms;

        height:calc(100vh - 65px); top:65px;
        display: flex; justify-content: center; align-items: center; flex-direction: column;
        transition: background-color $transitionDuration linear;

        &.darkMode{
            background-color: hsla(0deg, 0%, 98%, 0%);
            
            #hinting-text{
                p{
                    color: $primaryl6;

                    span{
                        color: $primary;
                        background-color: $secondarys6;
                    }
                }
            }
        } &.lightMode{
            background-color: hsla(0deg, 0%, 98%, 100%);
            
            #hinting-text{
                p{
                    color: $secondarys4;

                    span{
                        color: hsla(0deg, 0%, 98%, 100%);
                        background-color: $secondarys4;
                    }
                }
            }
        }

        #hinting-text{
            position:absolute; top: 50%; left:50%;
            transform: translate3d(-50%, -50%, 0px);
            user-select: none; -webkit-user-select: none;

            p{
                transition: all $transitionDuration linear;
                text-align: center;
                font-size: 16px;
                line-height: 24px;

                span{
                    transition: all $transitionDuration linear;
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