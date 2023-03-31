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
    import Overlay from "./components/ctrlMenuItems/StyleEditors/Advanced/Overlay.svelte";
    import LeftMenu from "./components/ctrlMenus/LeftMenu.svelte";
    import RightMenu from "./components/ctrlMenus/RightMenu.svelte";
    import TopMenu from "./components/ctrlMenus/TopMenu.svelte";
    import getStyleSetting from "./components/display/displayElements/elementStyleSettings";
    import MainDisplay from "./components/display/MainDisplay.svelte";
    import { activeStyles } from "./stores/activeStyles";
    import { canvasStatus } from "./stores/canvasStatus";
    import { addComponent, collection, focusedComponent, focusedOverride, layerBlurLock, selectedComponent, selectedOverride } from "./stores/collection"
    import type { elementStyle } from "./types/element";

    $: currentStyle = $selectedOverride === -1 ? $collection[$selectedComponent]?.style : $collection[$selectedComponent]?.styleOverrides[$selectedOverride]?.style;

    let leftMenuWidth = 260;
    const leftMenuWidthChange = (evt:CustomEvent<any>):void => {
        leftMenuWidth = evt.detail.width;
    };

    let rightMenuWidth = 360;
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

    <MainDisplay leftMenuWidth={leftMenuWidth} rightMenuWidth={rightMenuWidth}/>

    <!-- color picker overlay -->
    <Overlay />
</main>

<style lang="scss">
    @import "public/guideline";

    main{
        width:100vw; height:100vh;
        z-index: 1;
        background-color: $primary;
    }
</style>