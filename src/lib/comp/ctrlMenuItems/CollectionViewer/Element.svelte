<script lang="ts">
    import { addOverride, collection, focusedComponent, selectedComponent, selectedOverride, focusedOverride, layerDeleteLock, layerBlurLock } from "$lib/stores/collection";
    import { setSelectedElmnt } from "$lib/stores/dynamicOverlayManager";
    import { HTMltagInfo } from "$src/lib/@const/general.const";
    import { createEventDispatcher } from 'svelte';
    import { fly } from "svelte/transition";
    const disp = createEventDispatcher();

    export let tagType:string;
    export let elmntIndex:number;
    export let height:number;
    export let width:number;
    export let iconURI:string;

    const toggleShow = ():void => {
        $collection[elmntIndex].showing = !$collection[elmntIndex].showing;
        disp("updateElList");
    }

    const focusComponent = () => {
        // turn on blur lock
        $layerBlurLock = true;

        $selectedComponent = elmntIndex;
        $focusedComponent = elmntIndex;
        $selectedOverride = -1;
        $focusedOverride = -1;

        // update the elemnt number for color picker
        setSelectedElmnt($selectedComponent, $selectedOverride);
    }

    // event handler for key delete to delete element
    $: if(($focusedComponent !== -1 || $focusedOverride !== -1) && !$layerDeleteLock){
        document.onkeydown = (e:KeyboardEvent) => {
            if(!( ($focusedComponent !== -1 || $focusedOverride !== -1) && !$layerDeleteLock )) return; // do a second check here so we don't accidentally delete when we're not suppose to

            // if delete is pressed, delete this element or override
            if (e.key === "Backspace") {
                // first detect if any override is selected. If it is, delete the override instead of the element
                if($selectedOverride === -1){ // the case of if override is not selected
                    // check what the number of elements after removal is. If it's 0, reset all selected and focused comp index
                    let selectedComponentSnapshot = $selectedComponent

                    if($collection.length === 1){ // reset selection index
                        $selectedComponent = -1;
                        $focusedComponent = -1;
                    } else {
                        $selectedComponent = $collection.length - 2 < $selectedComponent ? $collection.length-1 : $selectedComponent; // update snapshot

                        // if not empty, set it to be the next one
                        $selectedComponent = $collection.length - 2 < $selectedComponent ? $collection.length-2 : $selectedComponent;
                        $focusedComponent = $collection.length - 2 < $selectedComponent ? $collection.length-2 : $selectedComponent;
                    }
                    
                    // self destruct
                    $collection = [...$collection.slice(0,selectedComponentSnapshot), ...$collection.slice(selectedComponentSnapshot+1,$collection.length)];
                } else { // if override IS selected
                    let styleOverrides = $collection[$selectedComponent].styleOverrides; // create override instance for quick access
                    
                    let styleOverrideSnapshot = $selectedOverride;

                    // update style overrides
                    styleOverrides = $collection[$selectedComponent].styleOverrides;
                    
                    // check what the number of elements after removal is. If it's 0, shift the focus to elmnt, and cancel the selectedOverride
                    if(styleOverrides.length === 1){ // reset selection index (I don't know why the fuck it would be 1 when it's empty, but if it's 0 the thing won't work. Words cannot describe my fucking confusion)
                        $selectedOverride = -1;
                        $focusedOverride = -1;
                        $focusedComponent = $selectedComponent;
                    } else {
                        // if not empty, set it to be the next one
                        styleOverrideSnapshot = styleOverrides.length-2 < $selectedOverride ? styleOverrides.length-1 : $selectedOverride; // update snapshot

                        $selectedOverride = styleOverrides.length-2 < $selectedOverride ? styleOverrides.length-2 : $selectedOverride;
                        
                        $focusedOverride = styleOverrides.length-2 < $selectedOverride ? styleOverrides.length-2 : $selectedOverride;
                    }

                    // remove override
                    $collection[$selectedComponent].styleOverrides = [...styleOverrides.slice(0,styleOverrideSnapshot), ...styleOverrides.slice(styleOverrideSnapshot+1,styleOverrides.length)]
                    $collection = [...$collection];
                }
            }

            if(e.key === "ArrowUp"){
                // move the focus on the override or the elment down
                if($selectedOverride !== -1){
                    // move the override up, given that it can still move up
                    $selectedOverride -= 1;
                    $focusedOverride = $selectedOverride;

                    // check if the selected override is -1. If it is, select the elmnt instead
                    if($selectedOverride === -1){
                        $focusedComponent = $selectedComponent;
                    }
                } else if ($selectedComponent !== 0) { // select the last override of the previous elmnt if there is an elmnt above the current one
                    $selectedComponent -= 1;
                    $focusedComponent = $selectedComponent;

                    // set override to be the last one
                    $selectedOverride = $collection[$selectedComponent].styleOverrides.length-1;
                    $focusedOverride = $selectedOverride;
                } // else do nothing
            } else if (e.key === "ArrowDown"){
                // move the focus on the override or the elment down
                if($selectedOverride !== $collection[$selectedComponent].styleOverrides.length-1 || $selectedComponent !== $collection.length-1){
                    // move the override down, given that it can still move up
                    $selectedOverride += 1;
                    $focusedOverride = $selectedOverride;

                    // check if the selected override is the last one. If it is, select the elmnt instead and set the overrides to -1
                    if($selectedOverride === $collection[$selectedComponent].styleOverrides.length){
                        $focusedOverride = $selectedOverride = -1;

                        // advance to the next elmnt if there is one
                        $selectedComponent += 1
                        $focusedComponent = $selectedComponent;
                    }
                }
            }
        }
    } // otherwise we can just leave the event handler alone and have something else use it if they want. The double checking makes sure we won't accidentally delete anything.
</script>

<main class={
            `layer ${$selectedComponent === elmntIndex ? "selected" : ""}
            ${($focusedComponent !== elmntIndex && $selectedComponent === elmntIndex) || ($selectedOverride !== -1 && $selectedComponent === elmntIndex) ? "blurred" : ""}`
            }
        style="min-height: {height}px; margin-bottom:10px; min-width:{width}px"
        in:fly={{x:50, duration:300}} on:mousedown={focusComponent}>
    <!-- arrow -->
    
    <div on:click={toggleShow}>
        <img src="$assets/icons/arrow-ios-forward.svg" class={$collection[elmntIndex].showing ? "showArrow" : ""} alt=""
        title={$collection[elmntIndex].showing ? "collapse" : "expand"}>
    </div>
    <!-- icon + title -->
    <img src={iconURI} alt="" style="transition:none">
    <p>{HTMltagInfo[tagType].name}</p>

    
    <div style="margin-right:4px; pointer-events: all;" on:click={() => {addOverride(elmntIndex)}} on:mousedown={e => e.stopPropagation()} title="Add Override">
        <img src={"$assets/icons/plus.svg"} alt="">
    </div>
</main>

<style lang="scss">
    @import "/src/static/stylesheets/guideline";

    main{
        background-color: hsla(0,0%,100%,15%);
        backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
        border-radius: 6px;
        display: flex; align-items: center;
        margin: 0px;
        cursor:pointer;
        transition: background-color 200ms ease;

        img{
            transition: 200ms filter ease;
            filter: invert(1); opacity: 0.75;
            user-select: none; -webkit-user-select: none; -webkit-user-drag: none;
            height: 18px;
            margin: 0px 10px 0px 5px;
        }

        p{
            font-size: 14px;
            font-variation-settings: "wght" 600;
            color: $secondarys1;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            width: calc(100% - 80px);
        }
    
        div{
            display: flex; align-items: center; justify-content: center;
            transition: 200ms background-color ease;
            min-height:26px; min-width: 26px;
            border-radius: 5px;
            margin: 0px 0px 0px 4px;

            &:hover{
                background-color: hsl(0,0%,100%,20%);
                
                img{
                    filter: invert(1); opacity: 0.95; // brighten up the icon on hover
                }
            }

            img{
                margin: 0px;
                filter: invert(1); opacity: 0.5; // dim down the arrow icon
                transform: rotate(0deg);
                transition: transform 200ms $normal-ease-out;
            }

            .showArrow{
                transform: rotate(90deg);
            }
        }
    }

    .selected{
        background-color: $accent;

        img{
            filter: invert(1); opacity: 1;
        }
        p{
            color: $secondary;
        }
        
        div{
            &:hover{
                background-color: hsl(0,0%,100%,30%);
                img{
                    filter: invert(1); opacity: 1; // dim down the arrow icon
                }
            }

            img{
                filter: invert(1); opacity: 0.8; // dim down the arrow icon
            }
        }
    }

    .blurred{
        background-color: $accents3;
    }
</style>