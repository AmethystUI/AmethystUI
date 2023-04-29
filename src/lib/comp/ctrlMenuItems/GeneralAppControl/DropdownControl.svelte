<script lang="ts" context="module">
    export type optionTypes = "reg" | "sep" | "title" | "subtitle" | "spacer";
    export interface menuItem {
        type : optionTypes,
        title : string,
        iconSrc? : string,
        desc? : string,
        cta : (any) => any
    }
</script>

<script lang="ts">
    import { createEventDispatcher, onMount } from 'svelte';
    import RegularOption from '../DropdownOptions/RegularOption.svelte';
    import Separator from '../DropdownOptions/Separator.svelte';
    
    const disp = createEventDispatcher()

    export let alt : string;
    export let active : boolean;
    export let currentID : string;
    export let id : string;
    export let showArrow = true;
    export let showHoverEffect = true;

    export let items : menuItem[];

    export let evenSpacing = false;

    let openLocked = true;

    let clickStartTime: number;
    let clickEndTime: number;

    let dropdownPanel: HTMLElement;

    const openDropdown = ():void => { // toggle the dropdown menu through dispatch
        disp("openDropdown");
        // start timing when the user releases the mouse button. We should use this information to determine if the user is doing a long click or not
        clickStartTime = performance.now();
    }
    const closeDropdown = (e):void => {
        clickEndTime = performance.now();
        if(Math.abs(clickEndTime - clickStartTime) > 350) { // the delay between click and release is larger than 350ms, which means the user is doing a long click
            disp("closeDropdown");
        }
    }
    const keepOpenDropdown = ():void => {
        if(clickEndTime - clickStartTime < 0) clickEndTime = performance.now(); // if the delay is less than 0, the user is probably doing a drag click, as we stopped propagating the event for updating the end time in closeDropdown(). So we need to update the end time here again.

        if(clickEndTime - clickStartTime < 350) { // only keep open the dropdown if the user is not doing a long click (drag click)
            disp("keepOpenDropdown");
        } else {
            disp("closeDropdown");
        }
    }

    const updateCurrentID = ():void => {
        disp("updateCurrentID", {
            newID : id
        });
    }
    const unlockToggleLock = () => { 
        setTimeout(() => {
            openLocked = false;
        }, 0)
    }

    // this code makes no fucking sense but it works somehow.
    const closeOverlay = <T extends Object>(e?:T) => {
        setTimeout(() => {
            if((!e["key"] && !openLocked) || (!!e["key"] && e["key"] === "Escape")){ // if not locked, remove picker overlay
                openLocked = true;
                // disp("toggleDropdown");
                // add event listner to close the overlay
                document.removeEventListener("mousedown", closeOverlay);
                document.removeEventListener("mouseup", unlockToggleLock);
                document.removeEventListener("keydown", closeOverlay)
            }
        }, 0);
    }

    let openDirection = "open-right"
    const updateOpenDirection = ():void => {
        // iterCt prevents stack overflowing
        if(!dropdownPanel) return; // keep checking until dropDownElement exists
        
        const bbRect = dropdownPanel.getBoundingClientRect()
        const margin = 10;
        if(openDirection === "open-right") openDirection = (bbRect.x+bbRect.width+margin > window.innerWidth) ? "open-left" : "open-right";
        else openDirection = (bbRect.x+bbRect.width*2+margin > window.innerWidth) ? "open-left" : "open-right";
    }

    onMount(() => {
        updateOpenDirection(); // update the open direction on init
    })

    window.addEventListener("resize", updateOpenDirection);
</script>

<!-- show the highlight and dropdown menu when active -->
<main>
    <section on:mousedown={openDropdown} on:mouseup={closeDropdown} on:mouseenter={updateCurrentID} title={alt} class="{(active && id === currentID) ? "highlight" : ""} {evenSpacing ? "evenly-spaced" : ""}" style={showHoverEffect ? "" : "background:none"}>
        <slot style="transform: translate3d({showArrow ? "3px" : "0px"}, 0px, 0px); {showHoverEffect ? "" : "opacity: 1"}"></slot>
        
        {#if showArrow}
            <img class="more-options" src="/src/assets/icons/chevron-down.svg" alt="">
        {/if}
    </section>

    <div bind:this={dropdownPanel} on:mousedown={e => e.stopPropagation()} on:mouseup={keepOpenDropdown} class="optionContainer {active && id === currentID ? "" : "hidden"} {openDirection}">
        {#each items as item (item)}
            {#if item.type === "reg"}
                <RegularOption options={item}/>
            {:else if item.type === "sep"} 
                <Separator />
            {:else if item.type === "title"}
                <h1>{item.title}</h1>
            {:else if item.type === "subtitle"}
                <h2>{item.title}</h2>
            {:else if item.type === "spacer"}
                <div style="height:5px"></div>
            {/if}
        {/each}
    </div>
</main>

<style lang="scss">
    @import "/src/static/stylesheets/guideline";
    
    $btnHeight: 40px;

    main{
        position: relative;

        section{
            height:$btnHeight; width:60px;
            border-radius: 7px;
            display: flex; align-items: center; justify-content: center;
            cursor: pointer;
            transition: background-color 200ms ease;
            position: relative;

            &.highlight {
                background-color: hsla(0,0%,100%,10%);
                img{
                    filter: invert(1); opacity: 0.6;
                }
            }
    
            &:hover{
                background-color: hsla(0,0%,100%,10%);
                img{
                    filter: invert(1); opacity: 0.6;
                }
            }

            img{
                filter: invert(1); opacity: 0.5;
                height:24px;
                transition: filter 200ms ease;
                user-select: none; -webkit-user-select: none; -webkit-user-drag: none;
            }

            .more-options{
                height:20px;
                transform: translate3d(3px,0px,0px);
            }
        }

        .optionContainer{
            min-width: 220px; max-width: 500px; width: fit-content; min-height: 14px; max-height: calc(100vh - 120px);
            background-color: hsl(200,5%,12%,85%); backdrop-filter: blur(100px); -webkit-backdrop-filter: blur(100px);
            position: absolute; top:0; margin-top:7px; margin-left:7px;
            border: 1px solid $primaryl4; border-radius: 7px;
            box-shadow: 0px 6px 30px -5px hsla(0,0%,0%,60%);
            z-index: 9999999;
            cursor:default;
            overflow-x: hidden; overflow-y: auto;
            padding: 5px;
            transition: none;

            
            &.open-right{
                left:0;
                transform: translate3d(-6px, $btnHeight, 0px);
            } &.open-left{
                right:0;
                transform: translate3d(-10px, $btnHeight, 0px);
            }

            &.hidden{
                opacity: 0 !important;
                pointer-events: none;
                transition: 200ms opacity ease;
            }

            & h1{
                font-size: 18px;
                font-weight: 600;
                width: calc(100% - 20px);
                padding: 5px 10px 0px 10px;
            } & h2{
                font-size: 12px;
                font-weight: 400;
                width: calc(100% - 20px);
                color: $secondarys5;
                padding: 8px 10px 0px 10px;
            }

            // hide scrollbar
            &::-webkit-scrollbar {
                display: none;
            }
            -ms-overflow-style: none;  // IE and Edge
            scrollbar-width: none;  // Firefox
        }
    }
</style>