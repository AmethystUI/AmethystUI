<script lang="ts" context="module">
    export const defaultMouseDownAction = (e) => { // root event. Essentially just blurs the selection on the elements
        setTimeout(() => {
            if(get(layerBlurLock) === true){
                // if locked, unlock for next time
                layerBlurLock.set(false);
                return;
            }
            focusedComponent.set(-1);
            focusedOverride.set(-1);
        }, 0);
    }
</script>

<script lang="ts">
    import { get } from "svelte/store";
    import DynamicOverlay from "$src/lib/comp/dynamicOverlay/DynamicOverlay.svelte";
    import LeftMenu from "$lib/comp/ctrlMenus/LeftMenu.svelte";
    import RightMenu from "$lib/comp/ctrlMenus/RightMenu.svelte";
    import TopMenu from "$lib/comp/ctrlMenus/TopMenu.svelte";
    import ComponentDisplay from "$lib/comp/display/ComponentDisplay.svelte";
    import getStyleSetting from "$lib/comp/display/displayElements/elementStyleSettings";
    import ElementDisplay from "$lib/comp/display/ElementDisplay.svelte";
    import { activeStyles } from "$lib/stores/activeStyles";
    import { addComponent, addOverride, collection, focusedComponent, focusedOverride, layerBlurLock, selectedComponent, selectedOverride } from "$lib/stores/collection"
    import { currentView } from "$lib/stores/viewingManager";
    import { mainModalData } from "$src/lib/comp/modals/modalManager";
    import ModalBase from "$lib/comp/modals/Modal.svelte";
    import OverlayBase from "./lib/comp/overlays/Overlay.svelte";
    import { onMount, tick } from "svelte";
    import { initializeColorFromHSLA, initializeColorFromRGBA } from "./lib/util/colorMaths";
    import { mainOverlayData } from "./lib/comp/overlays/overlayManager";

    $: currentStyle = $selectedOverride === -1 ? $collection[$selectedComponent]?.style : $collection[$selectedComponent]?.styleOverrides[$selectedOverride]?.style;

    let leftMenuWidth = 260;
    const leftMenuWidthChange = (evt:CustomEvent<any>):void => {
        leftMenuWidth = evt.detail.width;
    };

    let rightMenuWidth = 330;
    const rightMenuWidthChange = (evt:CustomEvent<any>):void => {
        rightMenuWidth = evt.detail.width;
    };
    
    document.onmousedown = defaultMouseDownAction;

    // DEBUG: 
    // onMount(async () => {
    //     addComponent("DIV", {
    //         USEBORDER: true,
    //         borderWidthTop: {v:69, u:"px"},
    //         borderWidthRight: {v:19, u:"pt"},
    //         borderWidthBottom: {v:0, u:"px"},
    //         borderWidthLeft: {v:84, u:"px"},
    //         borderRadiusTop: {v:18, u:"px"},
    //         borderRadiusRight: {v:38, u:"pt"},
    //         borderRadiusBottom: {v:48, u:"px"},
    //         borderRadiusLeft: {v:38, u:"px"},
    //         // borderStyleTop: "solid",
    //         // borderStyleRight: "dashed",
    //         // borderStyleBottom: "solid",
    //         // borderStyleLeft: "hidden",

    //         USEOUTLINE: true,
            
    //         USETEXT: true,

    //         leadingContent: "Hi mom",
    //         color: initializeColorFromRGBA(0, 0, 0, 100),
            
    //         borderColor: initializeColorFromHSLA(0, 84, 52, 100),

    //         USESHADOW: true,
    //     })
        
    //     await tick();
        
    //     addOverride(0);
        
    //     await tick();
        
    //     // simulate clicking on it
    //     $selectedComponent = 0;
    //     $focusedComponent = 0;
    //     $collection = $collection;
        
    //     await tick();
        
    //     $collection[0].styleOverrides[0].style = {
    //         ...$collection[0].styleOverrides[0].style,
            
    //         borderWidthTop: {v:0, u:"px"},
    //         borderWidthRight: {v:19, u:"px"},
    //         borderWidthBottom: {v:24, u:"px"},
    //         borderWidthLeft: {v:32, u:"px"},
            
    //         borderRadiusTop: {v:100, u:"px"},
    //         borderRadiusRight: {v:100, u:"px"},
    //         borderRadiusBottom: {v:100, u:"px"},
    //         borderRadiusLeft: {v:100, u:"px"},
            
    //         borderColor: initializeColorFromHSLA(102, 84, 51, 100),
            
    //         outlineColor: initializeColorFromHSLA(50, 88, 59, 100),
            
    //         leadingContent: "",
            
    //         outlineOffset: {v: 50, u: "px"}
    //     };
    // });

    $: if(!!currentStyle){
        const currentElement = $collection[get(selectedComponent)];
        $activeStyles = getStyleSetting(currentElement?.type);
    }
</script>

<main>
    <LeftMenu on:widthChange={leftMenuWidthChange}/> 
    <TopMenu leftMenuWidth={leftMenuWidth}/>
    <RightMenu on:widthChange={rightMenuWidthChange}/>

    {#if $currentView === "element"}
        <section>
            <ElementDisplay leftMenuWidth={leftMenuWidth} rightMenuWidth={rightMenuWidth}/>
        </section>
    {:else}
        <section>
            <ComponentDisplay leftMenuWidth={leftMenuWidth} rightMenuWidth={rightMenuWidth}/>
        </section>
    {/if}

    <!-- color picker overlay -->
    <DynamicOverlay />

    {#if $mainModalData.opened && $mainModalData.windowID !== null}
        <ModalBase />
    {/if}

    {#if $mainOverlayData.opened}
        <OverlayBase />
    {/if}
</main>

<style lang="scss">
    @import "/src/static/stylesheets/guideline";

    main{
        width:100vw; height:100vh;
        z-index: 1;
        background-color: $primary;
    }
</style>