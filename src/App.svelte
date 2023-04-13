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
    import DynamicOverlay from "./components/dynamicOverlay/OverlayBase.svelte";
    import LeftMenu from "./components/ctrlMenus/LeftMenu.svelte";
    import RightMenu from "./components/ctrlMenus/RightMenu.svelte";
    import TopMenu from "./components/ctrlMenus/TopMenu.svelte";
    import ComponentDisplay from "./components/display/ComponentDisplay.svelte";
    import getStyleSetting from "./components/display/displayElements/elementStyleSettings";
    import ElementDisplay from "./components/display/ElementDisplay.svelte";
    import { activeStyles } from "./stores/activeStyles";
    import { collection, focusedComponent, focusedOverride, layerBlurLock, selectedComponent, selectedOverride } from "./stores/collection"
    import { currentView } from "./stores/viewingManager";
    import { mainModalData } from "./stores/modalManager";
    import ModalBase from "./components/modals/Modal.svelte";

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
    setTimeout(() => {
        // addComponent("DIV", {
        //     USEBACKGROUND: true,
        // })
        // // simulate clicking on it
        // $selectedComponent = 0;
        // $focusedComponent = 0;
        // $selectedOverride = -1;
        // $focusedOverride = -1;
        // $collection = $collection;
    }, 50);

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

    {#if $mainModalData.opened}
        <ModalBase />
    {/if}
</main>

<style lang="scss">
    @import "public/guideline";

    main{
        width:100vw; height:100vh;
        z-index: 1;
        background-color: $primary;
    }
</style>