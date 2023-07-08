<script lang="ts" context="module">
    export const defaultMouseDownAction = () => { // root event. Essentially just blurs the selection on the elements
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
    import { collection, focusedComponent, focusedOverride, layerBlurLock, selectedComponent, selectedOverride } from "$lib/stores/collection"
    import { currentView } from "$lib/stores/viewingManager";
    import { mainModalData } from "$src/lib/comp/modals/modalManager";
    import ModalBase from "$lib/comp/modals/Modal.svelte";
    import OverlayBase from "./lib/comp/overlays/Overlay.svelte";
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