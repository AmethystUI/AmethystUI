<script lang="ts">
    import Overlay from "./components/ctrlMenuItems/StyleEditors/Advanced/Overlay.svelte";
    import LeftMenu from "./components/ctrlMenus/LeftMenu.svelte";
    import RightMenu from "./components/ctrlMenus/RightMenu.svelte";
    import TopMenu from "./components/ctrlMenus/TopMenu.svelte";
    import MainDisplay from "./components/display/MainDisplay.svelte";
    import { addComponent, collection, focusedComponent, focusedOverride, layerBlurLock, selectedComponent, selectedOverride } from "./stores/collection"
    import { mainFontPickerData } from "./stores/fontPickerStat";
    import { storedFontData } from "./stores/fontStorageStat";

    let leftMenuWidth = 260;
    const leftMenuWidthChange = (evt:CustomEvent<any>):void => {
        leftMenuWidth = evt.detail.width;
    };

    let rightMenuWidth = 360;
    const rightMenuWidthChange = (evt:CustomEvent<any>):void => {
        rightMenuWidth = evt.detail.width;
    };
    
    document.onmousedown = (e) => { // root event
        setTimeout(() => {
            if($layerBlurLock === true){
                // if locked, unlock for next time
                $layerBlurLock = false;
                return;
            }
            $focusedComponent = -1;
            $focusedOverride = -1;
        }, 0);
    }

    // DEBUG: 
    setTimeout(() => {
        addComponent("DIV", {
            USETEXT: true
        }, true)
        // simulate clicking on it
        $selectedComponent = 0;
        $focusedComponent = 0;
        $selectedOverride = -1;
        $focusedOverride = -1;
    }, 50);
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
        background-color: $primary;
        z-index: 1;
    }
</style>