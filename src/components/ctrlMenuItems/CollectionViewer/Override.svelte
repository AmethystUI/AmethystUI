<script lang="ts">
    import { fly } from "svelte/transition";
    import { collection, focusedComponent, selectedComponent, selectedOverride, focusedOverride, layerDeleteLock, layerBlurLock } from "../../../stores/collection";
    import { createEventDispatcher } from 'svelte';
    import { setSelectedElmnt } from "../../../stores/overlayStat";

    const disp = createEventDispatcher();

    export let height:number;
    export let elmntIndex:number;
    export let overrideIndex:number;
    
    let editable = false;
    let nameField:HTMLParagraphElement;

    const focusOverride = () => {
        // turn on blur lock
        $layerBlurLock = true;
        
        // switch focus to override index, and selected override to a non -1 value
        $selectedComponent = elmntIndex;
        $selectedOverride = overrideIndex;
        $focusedComponent = -1;
        $focusedOverride = overrideIndex;

        // update the elemnt number for color picker
        setSelectedElmnt($selectedComponent, $selectedOverride);
    }

    const setEditableTrue = () => {
        editable=true;
        if(!!nameField){
            // set focus to it
            setTimeout(() => {
                nameField.focus();
            }, 0);
        }

        // select all in the input text
        window.setTimeout(function() {
            let range = document.createRange();
            range.selectNodeContents(nameField);
            let sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(range);
        }, 0);
    }

    const checkKeyPress = (e:KeyboardEvent):void =>{
        if(e.key === "Enter" || e.key === "Escape"){
            e.preventDefault();
            nameField.blur();

            // format the name properly by removing redundant spaces, replacing the spaces with dashes, and lower casing all letters.
            if(!!$collection[elmntIndex]?.styleOverrides[overrideIndex]){
                $collection[elmntIndex].styleOverrides[overrideIndex].name = nameField.textContent.replace(/\s+/g, "-").toLowerCase();
            }

            return;
        }
    };

    const changeName = ():void => {
        const name = nameField.innerHTML;
        $collection[elmntIndex].styleOverrides[overrideIndex].name = name; // change value in the store
        $collection = [...$collection]
    }

    $: $layerDeleteLock = editable // lock delete
</script>

<main class={`
    layer ${$selectedOverride === overrideIndex && $selectedComponent === elmntIndex ? "selected" : ""} ${$focusedOverride !== overrideIndex && $selectedOverride === overrideIndex && $selectedComponent === elmntIndex ? "blurred" : ""}`} on:mousedown={focusOverride} style="min-height: {height}px;" in:fly={{y:-10, duration:300}}
    on:dblclick={setEditableTrue}>
    <!-- icon + title -->
    <img src="./assets/icons/copy.svg" alt="">

    <p bind:this={nameField} contenteditable={editable} class={`${editable ? "editable" : ""}`} style={`cursor: ${editable ? "text" : "normal"}`} on:blur={() => {editable=false; nameField.scrollLeft = 0}} on:keypress={checkKeyPress} on:blur={changeName}>
        {$collection[elmntIndex]?.styleOverrides[overrideIndex]?.name ?? ""}
    </p>
</main>

<style lang="scss">
    @import "../../../../public/guideline";

    main{
        min-width: calc(100% - 10px);
        border-radius: 6px;
        display: flex; align-items: center;
        margin: 0px;
        cursor:pointer;
        transition: background-color 100ms ease;
        margin-bottom:10px;

        &:hover{
            background-color: hsla(0,0%,100%,7%);
        }

        img{
            transition: 200ms filter ease;
            filter: invert(1); opacity: 0.5;
            user-select: none; -webkit-user-select: none; -webkit-user-drag: none;
            height: 18px;
            margin: 0px 10px 0px 10px;
        }

        p{
            font-size: 14px;
            font-variation-settings: "wght" 400;
            color: $secondarys2;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            width: calc(100% - 50px);
            outline: none;

            &.editable{
                overflow:scroll;
                text-overflow: clip !important;
            }
        
            &:focus{
                max-width: calc(100vw - 350px) !important;
                overflow: scroll; text-overflow: clip;
                -ms-overflow-style: none;  /* IE and Edge */
                scrollbar-width: none;  /* Firefox */
            } &::-webkit-scrollbar {
                display: none;
            }
        }
    }

    .selected{
        background-color: $accent !important;

        img{
            filter: invert(1); opacity: 1;
        }
        p{
            color: $secondary;
            // text-shadow: 0 0 20pt hsl(0,0%,0%);
        }
    }

    .blurred{
        background-color: $accents3 !important;
    }
</style>